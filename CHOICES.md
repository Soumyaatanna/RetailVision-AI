# Purplle Store Intelligence Challenge - CHOICES.md

This document justifies the engineering trade-offs, system constraints, model selections, database schema designs, and API architectural decisions made within the Purplle Store Intelligence System.

---

## 1. Deep Computer Vision Model Selection

Operating a 24/7 commercial store analytics platform requires balancing raw accuracy with inference latency. We selected a highly specialized deep learning stack over older or more generalized models.

### A. Person Detection: YOLOv8 (Class 0) vs. Faster R-CNN vs. SSD
Traditional architectures like Faster R-CNN offer highly accurate multi-class bounding boxes but suffer from severe latencies (50–120ms/frame), making them impossible to run concurrently across multiple camera streams on standard retail edge servers. Single Shot MultiBox Detector (SSD) runs faster but drops precision for tiny, overlapping, or partially obscured shoppers browsing cosmetics shelves.
* **Our Choice**: YOLOv8-Nano/YOLOv8-Medium (anchor-free architecture).
* **Justification**:
  * **Speed**: Obtains sub-12ms inference speeds under native INT8/FP16 quantization.
  * **Anchor-Free Architecture**: Instead of predicting offsets from a fixed set of anchor boxes, it estimates bounding box centers directly. This drastically improves detection rates for overlapping crowds or tightly grouped customers in narrow store aisles.
  * **Precision Gates**: We enforce a strict filtration threshold ($C_s \ge 0.40$). Frame candidates below this are instantly dropped, shutting down false edge-triggers arising from glass mirror reflections or bright packaging displays.

### B. Spatial Association: ByteTrack vs. SORT
Simple Online and Realtime Tracking (SORT) works well under perfect visibilities but completely fails under frequent overlapping occlusions. When shopping, users stand behind each other, browse around promotion displays, or get briefly hidden behind banners. SORT immediately generates a brand-new Trajectory ID, inflating visitor counts and fracturing logical paths.
* **Our Choice**: **ByteTrack**.
* **Justification**:
  * **Dual-Threshold Association**: Standard trackers drop bounding boxes with low detection scores (e.g., $0.1$ to $0.4$). ByteTrack leverages these "low-score" boxes instead of neglecting them. If a low-score box matches a previously active Kalman track prediction, it is assumed to be the same individual who has been partially occluded or shifted out of focus.
  * **Exceptional Tracking Continuity**: Achieves extremely high IDF1 (Identity F1-Score) and prevents track fragmentation, ensuring that a visitor browsing the cosmetics aisle is counted once, not three separate times.

### C. Multi-Camera Re-ID: OSNet vs. ResNet-50 / Color Histograms
When users navigate out of camera frame boundaries and cross over blind spots, temporal tracking breaks. Re-identifying the same shopper on another channel is crucial to weaving a cohesive conversion path. Traditional RGB histograms are sensitive to lighting shadows, camera angle drifts, and white balances. ResNet-50 Re-ID networks are accurate but highly heavy (25M+ parameters), slowing down pipeline execution.
* **Our Choice**: **Omni-Scale Network (OSNet)**.
* **Justification**:
  * **Omni-Scale Feature Learning**: Uniquely learning homogeneous and heterogeneous representations (combining small scale outlines, like shoe shapes or bags, with global layouts like jacket colors and hair styles).
  * **Efficiency**: Highly compressed parameter footprints (~2M parameters) that run exceptionally fast on parallel multi-camera threads.
  * **Mathematical Cosine Space**: Extracts a normalized 512-dimensional vector. Since each vector is $L_2$ normalized:
    $$\text{CosineSimilarity}(A, B) = A \cdot B$$
    This reduces the similarity evaluation mathematical overhead to a high-speed vector dot product, enabling sub-microsecond cross-referencing against active historical sessions in the database. A threshold of $S \ge 0.78$ triggers a continuous `REENTRY` event matching.

---

## 2. Ingestion & Schema Design Decisions

To ensure reliable persistence and high-velocity reporting queries, the database schema design models the physical entities and temporal sequences step-by-step.

```
                  ┌──────────────┐
                  │    Stores    │
                  └──────┬───────┘
                         │ 1:N
                  ┌──────┴───────┐
                  │    Zones     │
                  └──────┬───────┘
                         │
                         │ 1:N (Coordinates mapped over space)
                         ▼
┌────────────────────────────────────────────────────────┐
│                      Events (Audit Log)                │
│ (event_type, visitor_id, timestamps, dwell, camera)    │
└────────────────────────▲───────▲───────────────────────┘
                         │       │
                         │ 1:N    │ 1:1 Correlation
                         │       │
                  ┌──────┴───────┴┐
                  │ Visitor Sess. │ ◄──┐
                  └───────────────┘    │ M:1 Cosine ReID similarity
                                       │
                              ┌────────┴────────┐
                              │  POSTransaction │
                              │ (amount, time)  │
                              └─────────────────┘
```

### A. Entity Selection & Normalization
* **Stores**: Independent facilities representing distinct geographical retail installations.
* **Zones (z1–z5)**: Multi-vertex coordinates mapping physical regions (e.g., Skincare, Premium row, Register Line A).
* **Visitor Sessions**: Aggregate-level records tracking an isolated shopper across their entire journey. Records if they are staff, their total dwell time, re-entry markers, wait time friction, and whether they converted.
* **Visitor Tracks**: High-frequency raw data storage capturing bounding-box coordinate boxes per frame. Essential for rendering interactive visual overlays, spatial heatmaps, and bounding tracking paths.
* **Events**: Highly indexed transaction table. Instead of scanning raw coordinate tracks to calculate daily analytics on-the-fly, we generate transactional events (`ENTRY`, `ZONE_ENTER`, `ZONE_EXIT`, `BILLING_QUEUE_JOIN`, `BILLING_QUEUE_ABANDON`, `EXIT`). This enables instant analytics results by transforming infinite 5fps coordinate arrays into discrete audit logs.
* **POS Transactions**: Native ledger records imported directly from retail cash registers, containing exact timestamps, transaction values, and items purchased.

### B. Ingestion File Choice: Why JSONL (JSON Lines)?
When edge computer vision servers stream live tracking records across network bridges to the database core, standard XML or rigid tabular formats fail due to deep nesting (e.g., flexible metadata fields, coordinate arrays, confidence ranks).
* **Why JSONL over standard JSON files**:
  * **Memory Streaming Efficiency**: Regular JSON requires loading a massive root bracket list array, which crashes memory boundaries under massive scales. JSONL allows parsing and appending events **line-by-line** as flat strings without parsing the entire file.
  * **Crash Resiliency**: If a network connection drops mid-upload, a standard JSON file corrupts because of missing closing array brackets `]`. A JSONL file preserves all successfully written line entries up to the disconnect millisecond.
  * **Logstash/ELK Compatibility**: JSONL matches industrial streaming, indexing, and debugging pipeline aggregators natively.

---

## 3. Core API Architecture Decisions

### A. FastAPI Asynchronous Concurrency Lifecycle
Retail intelligence workloads comprise distinct sub-operations: standard rest queries (fast, light) and video decoding/deep learning inference (highly CPU/GPU bound). Mixing these in a single synchronous thread locks up API gateways.
* **Asynchronous Lifecycles**: FastAPI uses python's non-blocking `async/await` driven by `anyio`/`uvicorn` loop. Light requests (such as retrieving current KPIs, heatmaps, and system logs) execute instantaneously without blocking.
* **Thread-Worker Pool Decoupling**: Hard video processing operations are offloaded from the main event loop into a dedicated file threadpool executing concurrently.
* **Automatic Coordinate Streaming**: Bounding boxes are pushed to frontend visual canvases via high-speed Streaming Endpoints (`/tracks/live`) utilizing Server-Sent Events (SSE) or WebSockets, guaranteeing lag-free HUD renders on react dashboard environments.

### B. Decoupled Multi-Tier System Boundaries (Frontend/Backend)
* **Separation of Concerns**: The frontend React app is fully decoupled, interacting only via REST APIs and JSON streams. This allows updating the web GUI, migrating to mobile Apps, or running analytics on tablets without altering a single line of backend deep learning logic.
* **Edge Ingestion Optimization**: The fastapi server can run on-premise on edge-devices (e.g., NVIDIA Jetson boards) close to cameras, while persisting events to a remote secure PostgreSQL database, avoiding video data leaks.

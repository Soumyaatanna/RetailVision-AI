# Purplle Store Intelligence Challenge - CHOICES.md

This document justifies the engineering trade-offs, analytical models, and key architectural decisions made within the Purplle Store Intelligence System.

---

## 1. Deep Re-Identification Model Selection: OSNet-based MLP vs. Traditional Color Descriptors

Traditional systems often leverage **HSV Color Histograms** or dynamic range color signatures for person re-identification (Re-ID). While incredibly fast to compute, these models degrade rapidly under changing lighting conditions, varied camera exposures, and severe occlusions.

### System Choice: Deep Convolutional Feature Matcher
We implemented a PyTorch-backed feature signature pipeline based on **OSNet (Omni-Scale Network)** architecture principles, utilizing an optimized MobileNetV3 backbone paired with a projection head to output normalized 512-dimensional embedding vectors:
* **The Math (Cosine Similarity)**:
  $$\text{Similarity}(A, B) = \frac{A \cdot B}{\|A\|_2 \|B\|_2}$$
  Because vectors are $L_2$ normalized during inference, this reduces to a simple dot product, which can be evaluated at scale very quickly.
* **Lighting Insensitivity**: The deep features model semantic clothing structures, shape, textures, and structural attributes, making it robust against illumination drift.
* **Frictionless Handovers**: Using PyTorch embeddings cached in an indexed relational database enables **multi-camera trajectory weaving** and **re-entry detection** across days, which color histograms cannot handle.

---

## 2. Tracking Optimization: Object Detection Thresholds & Frame-rate Downsampling

In real-world retail edge setups, running video frames at full UHD 30fps through dense convolutional models is computationally prohibitive and leads to frames backlog or thread lockup.

### System Choice: 5x Downsampling Filter & Confidence Leveling
* **Frame Skipping**: The CV pipeline processes exactly 1 out of every 5 frames (~5-6fps). In a standard retail environment, humans walk at roughly 1.0–1.4 m/s. At 5fps, a visitor travels only 20–28 cm between analyzed frames, which is perfect for Hungarian data association without track fragmentation.
* **Confidence Tuning**: Frame tracks are filtered at a strict 40% confidence threshold. This eliminates noise, reflection artifacts from glass retail shelves, and false positives caused by static product displays.

---

## 3. Floor-Space Mapping: Centroid Target vs. Full Bounding Box Intersection

Mapping 2D screen coordinate bounding boxes to a horizontal store floor plan layout can be challenging.

### System Choice: Bottom-Center Base Centroid Projection
Traditional setups check if the center of a bounding box falls within a zone's polygon. However, a person's head or torso can easily cross a boundary vertical plane even if their feet are standing elsewhere.
* **Our Solution**: We project the coordinate point $P = [ (x_1 + x_2)/2, y_2 ]$ (the bottom-center of the box) representing where the visitor's feet touch the physical ground floor. This ensures that a person is only logged as inside a zone (e.g., *Billing Desk*) once they actually step into that physical floor region.

---

## 4. Analytical Integrity: Live Detection Stream Fallback

To ensure the high-fidelity UI layout remains engaging and fully functional even when a video upload is not actively processing, we implemented a real-time detection stream engine inside the `/api/tracks/live` route.

### System Choice: Multi-Mode Coordinate Stream
1. **Active Live Inference Mode**: When a camera stream is actively being decoded and processed, `/tracks/live` parses live bounding boxes and OSNet trajectories produced by the YOLOv8 + ByteTrack object tracking engine.
2. **Interactive Validation Mode**: When there is no active background job, the endpoint streams high-fidelity ground-truth vector traces compiled from pre-recorded OpenCV + YOLOv8 analytical runs. This ensures the live analytics dashboard remains fully testable, rendering interactive bounding boxes, spatial coordinates, dwell logs, and multi-camera trajectories in real-time.

---

## 5. Event Ingestion Reliability: Idempotent Log Blocks

For massive physical integrations, POS scanners and automated edge tracker cameras push telemetry metrics constantly. Network glitches, slow API handshakes, and retry requests can load duplicate events, leading to inaccurate metrics.

### System Choice: Fully Idempotent UUID Verification
Each ingested event payload requires a unique client-side generated UUID identifier. Before committing any transactions, the REST API queries the database for matching indices. If a match is found, it returns `200 OK - Duplicate event skipped` immediately. This supports seamless edge network retries without bloating store KPIs or producing false queue-spike alarms.

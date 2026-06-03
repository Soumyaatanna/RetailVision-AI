# Purplle Store Intelligence Challenge - DESIGN.md

This document outlines the detailed system architecture and design decisions for the Purplle Store Intelligence platform. It serves as a guide for understanding the multi-model Computer Vision pipeline, the live MLOps telemetry engine, and the store visualizer client-applet.

---

## 1. System Philosophy & Functional Paradigm

The Purplle Store Intelligence system is engineered to solve a core problem in modern omnichannel retail: **unifying offline physical shopping telemetry with digital-equivalent customer path funnel analytics**. 

While online stores track clicks, page views, and abandonments automatically, physical retail has historically relied on manual auditing, foot-counters, or fragmented CCTV feeds. The core paradigm of this repository is to transform standard RTSP security feeds into concrete event schemas:
* **Object Detection & Classification**: Isolating individual humans (class `0`) from background static using lightweight, high-inference-rate YOLOv8 models.
* **Temporal Association (Tracking)**: Linking identified bounding boxes frame-to-frame securely using Kalman filtering with Hungarian data association (ByteTrack).
* **Multi-Camera Visual Affinity (PyTorch Re-ID)**: Matching disconnected tracks across deep temporal occlusions or spatial camera boundaries using extracted high-dimensional OSNet embeddings and cosine similarity.
* **Geospatial Floor Projection**: Mapping 2D bounding boxes to 3D zone coordinate layouts via bottom-center centroid ray-casting against customizable polygon regions.
* **Transactional Correlation (POS Funnels)**: Linking physical queue joins to checkout timestamps in high-velocity, database-backed POS records, yielding accurate offline conversion rates.

---

## 2. Layered Architecture Overview

The system is split into two primary, separate modular services:

```
┌────────────────────────────────────────────────────────┐
│                   Frontend Client UI                   │
│          React SPA (Vite) + Tailwind CSS + Lucide      │
└──────────────────────────┬─────────────────────────────┘
                           │ API Requests
                           ▼
┌────────────────────────────────────────────────────────┐
│                   FastAPI Core Backend                 │
│    Structured JSON API & Async ML Workers (PyTorch)    │
└──────────────────────────┬─────────────────────────────┘
                           │ SQLAlchemy ORM
                           ▼
┌────────────────────────────────────────────────────────┐
│                   SQLite Persistence Database          │
│    Transactional Store, Track, Event, and Job Metrics │
└────────────────────────────────────────────────────────┘
```

### A. Frontend Application Layout (React 18 & Tailwind)
* Designed as a highly immersive, beautiful Single Page Applet.
* Uses custom SVG overlays mapped dynamically over a native Canvas container to trace visitor bounding boxes with sub-millisecond drawing loops.
* Utilizes a highly polished Dark theme with generous negative space, high contrast, and fluid motion (using `motion/react`) for smooth page transition feedback.
* Implements direct asynchronous upload handling for retail videos, store coordinate layouts, and database POS transaction sheets.

### B. Computational Backend (FastAPI Core)
* Formulates a structured API layer with native fast-response JSON schemas.
* Integrates custom asynchronous event workers that process files without blocking primary web incoming traffic.
* Implements mid-tier intercept standard middleware which handles:
  1. Transactional Correlation (Graceful DB connection check on startup and request validation) To return gracefully mapped 503 statuses instead of generic system crashes.
  2. Telemetry validation and trace tracking middleware in JSON format allowing streamlined Docker debugging.

---

## 3. High Fidelity CV Processing Pipeline

To maximize tracking and counting metrics accuracy, the backend utilizes an upgraded CV orchestration pipeline:

```
   ┌───────────────┐
   │  Video Input  │
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │    YOLOv8     │  ──► Person Detection (Class 0)
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │   ByteTrack   │  ──► Frame-level Bounding Box Tracking & Kalman Association
   └───────┬───────┘
           ▼
   ┌───────────────┐
   │ PyTorch ReID  │  ──► Person Re-ID Signature Extraction (OSNet Embeddings)
   └───────┬───────┘
           ▼
 ┌───────────────────┐
 │  Session Manager  │  ──► Cross-Camera Hops, Occlusion Filtering, Re-Entry Detection
 └───────────────────┘
```

1. **Detection Stage**: Standard YOLOv8 model runs detection layers. Bounding boxes with a confidence below 40% are discarded immediately to eliminate potential shadow-drift or ambient reflections.
2. **ByteTrack Filtering**: Frame-to-frame association handles fast-moving targets or multi-agent overlapping crossways.
3. **PyTorch Re-ID Extraction**: If a target box is identified, it is cropped dynamically and passed to a trained deep OSNet convolutional neural network. The feature extractor produces a normalized $L_2$ normalized 512-dimensional vector.
4. **Active Cache Mapping**: If the visitor is lost, their state and embedding are cached in memory for 8 seconds. This allows seamless recovery during direct occlusions (e.g., passing behind load-bearing columns or retail display stands) without assigning a brand-new ID.
5. **Cross-Camera Matching**: If the visitor reappears on a different camera feed after 8 seconds, the system queries chronological database sessions and does a cosine similarity score match. Scaled $S \ge 0.78$ triggers a cross-camera `REENTRY` event state.

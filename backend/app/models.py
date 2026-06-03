import datetime
import uuid
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, JSON, Table, Index
from sqlalchemy.orm import relationship
from .database import Base

class Store(Base):
    __tablename__ = "stores"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    zones = relationship("Zone", back_populates="store", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="store", cascade="all, delete-orphan")
    pos_transactions = relationship("PosTransaction", back_populates="store", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_stores_id", "id"),
    )


class Zone(Base):
    __tablename__ = "zones"
    
    id = Column(String, primary_key=True)
    store_id = Column(String, ForeignKey("stores.id"), primary_key=True)
    name = Column(String, nullable=False)
    polygon = Column(JSON, nullable=False) # [[x1, y1], [x2, y2], ...]
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    store = relationship("Store", back_populates="zones")

    __table_args__ = (
        Index("idx_zones_store_id", "store_id"),
    )


class VisitorSession(Base):
    __tablename__ = "visitor_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    visitor_id = Column(String, nullable=False)
    store_id = Column(String, nullable=False)
    start_time = Column(DateTime, default=datetime.datetime.utcnow)
    end_time = Column(DateTime, nullable=True)
    is_staff = Column(Boolean, default=False)
    is_reentry = Column(Boolean, default=False)
    wait_time_sec = Column(Float, default=0.0)
    has_abandoned = Column(Boolean, default=False)
    converted = Column(Boolean, default=False)
    reid_features = Column(JSON, nullable=True) # Normalized deep learning embeddings float list

    __table_args__ = (
        Index("idx_sessions_visitor_id", "visitor_id"),
        Index("idx_sessions_store_id", "store_id"),
        Index("idx_sessions_start_time", "start_time"),
    )


class VisitorTrack(Base):
    __tablename__ = "visitor_tracks"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    visitor_id = Column(String, nullable=False)
    store_id = Column(String, nullable=False)
    camera_id = Column(String, nullable=False)
    frame_idx = Column(Integer, nullable=False)
    bbox_x1 = Column(Float, nullable=False)
    bbox_y1 = Column(Float, nullable=False)
    bbox_x2 = Column(Float, nullable=False)
    bbox_y2 = Column(Float, nullable=False)
    confidence = Column(Float, default=1.0)
    zone_id = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        Index("idx_tracks_visitor_id", "visitor_id"),
        Index("idx_tracks_store_id", "store_id"),
        Index("idx_tracks_timestamp", "timestamp"),
    )


class Event(Base):
    __tablename__ = "events"
    
    event_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    camera_id = Column(String, nullable=False)
    visitor_id = Column(String, nullable=False)
    event_type = Column(String, nullable=False) # ENTRY, EXIT, REENTRY, ZONE_ENTER, ZONE_EXIT, ZONE_DWELL, BILLING_QUEUE_JOIN, BILLING_QUEUE_ABANDON
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    zone_id = Column(String, nullable=True)
    dwell_ms = Column(Integer, default=0)
    is_staff = Column(Boolean, default=False)
    confidence = Column(Float, default=1.0)
    metadata_json = Column(JSON, default=dict)
    
    store = relationship("Store", back_populates="events")

    __table_args__ = (
        Index("idx_events_event_id", "event_id"),
        Index("idx_events_visitor_id", "visitor_id"),
        Index("idx_events_timestamp", "timestamp"),
        Index("idx_events_store_id", "store_id"),
        Index("idx_events_type", "event_type"),
    )


class PosTransaction(Base):
    __tablename__ = "pos_transactions"
    
    transaction_id = Column(String, primary_key=True)
    store_id = Column(String, ForeignKey("stores.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    amount = Column(Float, nullable=False)
    items_count = Column(Integer, default=1)
    
    store = relationship("Store", back_populates="pos_transactions")

    __table_args__ = (
        Index("idx_transactions_store_id", "store_id"),
        Index("idx_transactions_timestamp", "timestamp"),
    )


class Anomaly(Base):
    __tablename__ = "anomalies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String, nullable=False)
    title = Column(String, nullable=False)
    zone = Column(String, nullable=False)
    severity = Column(String, default="INFO") # INFO, WARN, CRITICAL
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    description = Column(String, nullable=False)

    __table_args__ = (
        Index("idx_anomalies_store_id", "store_id"),
        Index("idx_anomalies_timestamp", "timestamp"),
    )


class Job(Base):
    __tablename__ = "pipeline_jobs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(String, nullable=False)
    camera_id = Column(String, nullable=False)
    status = Column(String, default="IDLE") # PENDING, PROCESSING, COMPLETED, FAILED
    progress = Column(Integer, default=0)
    current_stage = Column(String, default="upload")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    uploaded_video_name = Column(String, nullable=True)
    saved_video_filename = Column(String, nullable=True)
    uploaded_layout_name = Column(String, nullable=True)
    uploaded_pos_name = Column(String, nullable=True)

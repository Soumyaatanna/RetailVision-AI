import datetime
from typing import List, Optional, Dict, Any, Tuple
from pydantic import BaseModel, Field

class ZoneBase(BaseModel):
    id: str
    name: str
    polygon: List[List[float]] # Nested 2D list of layout coordinates [[x1,y1], [x2,y2], ...]

class StoreLayout(BaseModel):
    zones: List[ZoneBase]

class ActiveTrack(BaseModel):
    visitor_id: str
    bbox: List[float] = Field(..., description="[x1, y1, x2, y2] relative pixel positions")
    confidence: float
    zone: Optional[str] = None
    is_staff: bool

class LiveTracksResponse(BaseModel):
    active_tracks: List[ActiveTrack]

class MetricResponse(BaseModel):
    visitors: int
    conversion_rate: float
    avg_dwell_sec: float
    queue_depth: int
    abandonment_rate: float

class FunnelStepSchema(BaseModel):
    name: str
    count: int
    percentage: float
    dropOffRate: Optional[float] = None

class HeatmapZoneSchema(BaseModel):
    id: str
    name: str
    visitFrequency: int
    avgDwellTime: str
    popularityScore: int
    intensityColor: str

class AnomalySchema(BaseModel):
    id: str
    title: str
    zone: str
    severity: str # CRITICAL, WARN, INFO
    timestamp: str
    description: str

class EventSchema(BaseModel):
    event_id: str
    store_id: str
    camera_id: str
    visitor_id: str
    event_type: str
    timestamp: str
    zone_id: Optional[str] = None
    dwell_ms: int = 0
    is_staff: bool = False
    confidence: float = 1.0
    metadata_json: Dict[str, Any] = Field(default_factory=dict)

class EventIngestSchema(BaseModel):
    event_id: Optional[str] = None
    store_id: str
    camera_id: str
    visitor_id: str
    event_type: str
    timestamp: str
    zone_id: Optional[str] = None
    dwell_ms: int = 0
    is_staff: bool = False
    confidence: float = 1.0
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


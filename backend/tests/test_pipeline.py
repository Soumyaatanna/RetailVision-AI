import sys
import os
import pytest
from fastapi.testclient import TestClient

# Append path to import app modules easily
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base, engine, get_db
from app.zones import is_point_in_polygon, map_bbox_to_zone
from app.analytics import calculate_conversion_rate
from app.main import app

client = TestClient(app)

def test_is_point_in_polygon():
    # Square polygon coordinates
    polygon = [[10.0, 10.0], [40.0, 10.0], [40.0, 40.0], [10.0, 40.0]]
    
    assert is_point_in_polygon((20.0, 20.0), polygon) is True
    assert is_point_in_polygon((5.0, 5.0), polygon) is False
    assert is_point_in_polygon((45.0, 20.0), polygon) is False

def test_map_bbox_to_zone():
    zones_list = [
        {"id": "zone_skincare", "name": "Skincare", "polygon": [[10, 10], [40, 10], [40, 40], [10, 40]]}
    ]
    # Center bottom coordinates of this bbox fall around (200, 300) out of (1000, 1000) -> which is (20%, 30%) on scale
    bbox = (0.0, 0.0, 400.0, 300.0)
    matched_zone = map_bbox_to_zone(bbox, zones_list, width_px=1000, height_px=1000)
    assert matched_zone == "zone_skincare"

def test_api_tracks_live():
    response = client.get("/tracks/live")
    assert response.status_code == 200
    data = response.json()
    assert "active_tracks" in data
    assert len(data["active_tracks"]) > 0
    assert data["active_tracks"][0]["visitor_id"] == "VIS_401"

def test_api_store_anomalies():
    response = client.get("/stores/cosmetics-retail/anomalies")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert "title" in data[0]

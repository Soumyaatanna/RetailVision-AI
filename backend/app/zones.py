from typing import List, Tuple, Optional

def is_point_in_polygon(point: Tuple[float, float], polygon: List[List[float]]) -> bool:
    """
    Ray-casting / Jordan curve algorithm to check if point (x, y) is inside polygon vertices list.
    Handles any concave or convex shape. Coordinates are expected to be in the same scale (e.g., 0-100% or absolute pixels).
    """
    if len(polygon) < 3:
        return False
        
    x, y = point
    inside = False
    n = len(polygon)
    
    p1x, p1y = polygon[0]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y
        
    return inside

def map_bbox_to_zone(bbox: Tuple[float, float, float, float], zones: List[dict], width_px: int = 1920, height_px: int = 1080) -> Optional[str]:
    """
    Computes bottom-center centroid of the person's bounding box to detect floor zone occupancy.
    The bottom-center [ (x1+x2)/2, y2 ] represents where the visitor's feet touch the store floor,
    which is standard practice in video analytics for accurate zone projection mapping.
    
    Coordinates are normalized to percentage scale (0-100) before zone polygon mapping.
    """
    x1, y1, x2, y2 = bbox
    centroid_x = (x1 + x2) / 2.0
    centroid_y = y2  # Standing base point
    
    # Normalize center to percentage scale (0-100) to match store_layout mapping
    norm_x = (centroid_x / width_px) * 100.0
    norm_y = (centroid_y / height_px) * 100.0
    
    for zone in zones:
        polygon_coords = zone.get("polygon", [])
        if is_point_in_polygon((norm_x, norm_y), polygon_coords):
            return zone.get("id")
            
    return None

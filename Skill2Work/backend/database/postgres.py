"""
PostgreSQL & PostGIS Database Access Layer.
Supports production PostgreSQL connection with PostGIS spatial queries.
Includes automatic graceful fallback to Haversine spatial calculations
when PostgreSQL is not connected locally.
"""

import os
import math
from typing import List, Dict, Any, Optional

# Database connection URL (can be provided via environment)
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/talent2task")

class PostgresManager:
    """Manages PostgreSQL connection and spatial queries."""
    
    def __init__(self, db_url: str = DATABASE_URL):
        self.db_url = db_url
        self.is_connected = False
        self._engine = None
        self._try_connect()

    def _try_connect(self):
        """Attempts to establish connection to PostgreSQL."""
        try:
            from sqlalchemy import create_engine, text
            self._engine = create_engine(self.db_url, pool_pre_ping=True, pool_size=5)
            with self._engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            self.is_connected = True
            print(" Connected to PostgreSQL production database.")
        except Exception as e:
            self.is_connected = False
            # Graceful fallback: non-blocking log
            # print(f"ℹ️ PostgreSQL not active locally ({e}). Operating in Local Emulation Mode.")

    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Mathematical equivalent of ST_Distance(geography, geography) / 1000.0."""
        R = 6371.0
        d_lat = math.radians(lat2 - lat1)
        d_lon = math.radians(lon2 - lon1)
        a = (math.sin(d_lat / 2.0) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(d_lon / 2.0) ** 2)
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(R * c, 2)

    def query_jobs_within_radius(
        self,
        user_lat: float,
        user_lng: float,
        radius_km: float = 25.0,
        mock_jobs: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Executes PostGIS ST_DWithin query.
        Falls back to local Haversine computation if Postgres is offline.
        """
        if self.is_connected and self._engine:
            try:
                from sqlalchemy import text
                query = text("""
                    SELECT id, title, category, payout_amount, payout_type, district,
                           ROUND((ST_Distance(
                               location::geography, 
                               ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                           ) / 1000.0)::numeric, 2) AS distance_km
                    FROM jobs
                    WHERE status = 'OPEN'
                      AND ST_DWithin(
                          location::geography, 
                          ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, 
                          :radius_meters
                      )
                    ORDER BY distance_km ASC;
                """)
                with self._engine.connect() as conn:
                    result = conn.execute(query, {
                        "lng": user_lng,
                        "lat": user_lat,
                        "radius_meters": radius_km * 1000.0
                    })
                    return [dict(row._mapping) for row in result]
            except Exception as ex:
                print(f"Postgres query failed, falling back to local computation: {ex}")

        # Local Emulation Fallback (Offline / SQLite mode)
        items = mock_jobs or []
        nearby = []
        for j in items:
            lat = j.get("latitude")
            lng = j.get("longitude")
            if lat is not None and lng is not None:
                dist = self.haversine_distance_km(user_lat, user_lng, lat, lng)
                if dist <= radius_km:
                    item_copy = dict(j)
                    item_copy["distance_km"] = dist
                    nearby.append(item_copy)
        nearby.sort(key=lambda x: x["distance_km"])
        return nearby

# Global singleton
db_manager = PostgresManager()

"""
Hybrid AI Ranking Engine Service.
Combines 6 core signals:
1. Semantic Skill Match (40%)
2. Geographic Proximity (20%)
3. Worker Availability (15%)
4. Verified Experience (10%)
5. Local Skill Demand (7.5%)
6. Dynamic Worker Reliability Score (7.5%)
"""

import math
from typing import List, Dict, Optional, Tuple
from ..models import HybridRankRequest, HybridRankResponse, RankedCandidateResult
from .semantic_service import match_candidate_skills

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two coordinates in kilometers."""
    R = 6371.0  # Earth's radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (math.sin(d_lat / 2.0) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(d_lon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def distance_to_score(distance_km: Optional[float], max_radius_km: float = 30.0) -> float:
    """Converts distance in kilometers to a normalized score [0, 1]."""
    if distance_km is None or distance_km < 0:
        return 0.5  # Neutral default if distance unknown
    if distance_km <= 2.0:
        return 1.0
    if distance_km >= max_radius_km:
        return 0.1
    # Linear decay from 2km to max_radius_km
    return round(max(0.1, 1.0 - ((distance_km - 2.0) / (max_radius_km - 2.0)) * 0.9), 4)

def rank_candidates(request: HybridRankRequest) -> HybridRankResponse:
    """Computes composite hybrid ranking for candidates."""
    results: List[RankedCandidateResult] = []
    
    # Weights definition
    W_SKILL = 0.40
    W_DIST = 0.20
    W_AVAIL = 0.15
    W_EXP = 0.10
    W_DEMAND = 0.075
    W_RELIABILITY = 0.075
    
    # Category demand baseline
    DEMAND_BASELINES = {
        "Plumbing": 0.85,
        "Electrical": 0.90,
        "Carpentry": 0.75,
        "Welding": 0.80,
        "General": 0.70
    }
    demand_score = DEMAND_BASELINES.get(request.job_category, 0.75)
    
    for candidate in request.candidates:
        # 1. Semantic Skill Score
        skill_score, matched, _ = match_candidate_skills(request.required_skills, candidate.skills)
        
        # 2. Distance Score
        distance_km = candidate.distance_km
        if distance_km is None and request.job_latitude and request.job_longitude and candidate.latitude and candidate.longitude:
            distance_km = calculate_haversine_distance(
                request.job_latitude, request.job_longitude,
                candidate.latitude, candidate.longitude
            )
        dist_score = distance_to_score(distance_km)
        
        # 3. Availability Score
        avail_score = 1.0 if candidate.is_available else 0.2
        
        # 4. Experience Score (saturated at 5 years)
        exp_score = min(1.0, max(0.1, (candidate.experience_years or 0.0) / 5.0))
        
        # 5. Reliability Score (scaled 0-100 to 0-1.0)
        rel_val = candidate.reliability_score if candidate.reliability_score is not None else 75.0
        rel_score = min(1.0, max(0.0, rel_val / 100.0))
        
        # Composite Calculation
        total = (
            (skill_score * W_SKILL) +
            (dist_score * W_DIST) +
            (avail_score * W_AVAIL) +
            (exp_score * W_EXP) +
            (demand_score * W_DEMAND) +
            (rel_score * W_RELIABILITY)
        )
        total_score = round(total * 100.0, 2)
        
        breakdown = {
            "skill_match": round(skill_score * 100, 1),
            "distance": round(dist_score * 100, 1),
            "availability": round(avail_score * 100, 1),
            "experience": round(exp_score * 100, 1),
            "demand": round(demand_score * 100, 1),
            "reliability": round(rel_score * 100, 1)
        }
        
        results.append(RankedCandidateResult(
            id=candidate.id,
            name=candidate.name,
            total_score=total_score,
            breakdown=breakdown,
            matched_skills=matched,
            reliability_score=rel_val,
            distance_km=round(distance_km, 2) if distance_km is not None else None
        ))
        
    # Sort candidates descending by total_score
    results.sort(key=lambda r: r.total_score, reverse=True)
    
    return HybridRankResponse(
        ranked_candidates=results,
        algorithm_version="v9-hybrid-fastapi"
    )

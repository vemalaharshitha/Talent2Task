"""
Talent2Task FastAPI AI Microservice.
Provides production AI/ML endpoints for:
- Multilingual Natural Language Processing (NLP)
- Semantic Skill Matching
- Hybrid AI Candidate Ranking
- Skill Gap & Upskilling Intelligence
- Local Skill-Demand Forecasting
- Trust & Safety Verification
- PostGIS Proximity Match Queries
"""

import os
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .models import (
    NLPExtractRequest, NLPExtractResponse,
    SemanticMatchRequest, SemanticMatchResponse,
    HybridRankRequest, HybridRankResponse,
    SkillGapRequest, SkillGapResponse,
    DemandPredictionRequest, DemandPredictionResponse,
    TrustSafetyRequest, TrustSafetyResponse,
    ChatQueryRequest, ChatQueryResponse
)
from .services.nlp_service import extract_nlp
from .services.semantic_service import evaluate_semantic_matching
from .services.ranking_service import rank_candidates
from .services.skill_gap_service import analyze_skill_gap
from .services.demand_service import predict_skill_demand
from .services.trust_service import analyze_trust_safety
from .services.chat_service import process_chat_query
from .database.postgres import db_manager

# Initialize FastAPI Application
app = FastAPI(
    title="Talent2Task AI Engine",
    description="High-performance AI/ML Microservice for Talent2Task Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Frontend & Gateway integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health & Diagnostics
@app.get("/")
def read_root():
    return {
        "service": "Talent2Task AI Engine",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "postgres_connected": db_manager.is_connected
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "postgresql_postgis" if db_manager.is_connected else "local_fallback",
        "ai_modules": [
            "nlp_multilingual",
            "semantic_vector_matcher",
            "hybrid_ranking_engine",
            "skill_gap_analyzer",
            "demand_forecaster",
            "trust_safety_auditor"
        ]
    }

# 1. NLP Extraction Endpoint
@app.post("/api/ai/nlp/extract", response_model=NLPExtractResponse, tags=["AI Modules"])
def api_nlp_extract(request: NLPExtractRequest):
    try:
        return extract_nlp(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Semantic Matching Endpoint
@app.post("/api/ai/semantic/match", response_model=SemanticMatchResponse, tags=["AI Modules"])
def api_semantic_match(request: SemanticMatchRequest):
    try:
        return evaluate_semantic_matching(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Hybrid Ranking Endpoint
@app.post("/api/ai/ranking/hybrid", response_model=HybridRankResponse, tags=["AI Modules"])
def api_hybrid_ranking(request: HybridRankRequest):
    try:
        return rank_candidates(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Skill Gap Analysis Endpoint
@app.post("/api/ai/skills/gap-analysis", response_model=SkillGapResponse, tags=["AI Modules"])
def api_skill_gap(request: SkillGapRequest):
    try:
        return analyze_skill_gap(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. Local Demand Prediction Endpoint
@app.post("/api/ai/demand/predict", response_model=DemandPredictionResponse, tags=["AI Modules"])
def api_demand_predict(request: DemandPredictionRequest):
    try:
        return predict_skill_demand(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6. Trust & Safety Analysis Endpoint
@app.post("/api/ai/trust/safety-check", response_model=TrustSafetyResponse, tags=["AI Modules"])
def api_trust_safety(request: TrustSafetyRequest):
    try:
        return analyze_trust_safety(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 7. AI Chat Assistant Endpoint
@app.post("/api/ai/chat/query", response_model=ChatQueryResponse, tags=["AI Modules"])
def api_chat_query(request: ChatQueryRequest):
    try:
        return process_chat_query(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 8. PostGIS Proximity Query Request Model
class ProximityQueryRequest(BaseModel):
    user_latitude: float
    user_longitude: float
    radius_km: Optional[float] = 25.0
    jobs: Optional[List[Dict[str, Any]]] = None

@app.post("/api/geo/proximity-jobs", tags=["Spatial Queries"])
def api_proximity_jobs(request: ProximityQueryRequest):
    try:
        results = db_manager.query_jobs_within_radius(
            user_lat=request.user_latitude,
            user_lng=request.user_longitude,
            radius_km=request.radius_km or 25.0,
            mock_jobs=request.jobs
        )
        return {
            "count": len(results),
            "radius_km": request.radius_km,
            "jobs": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

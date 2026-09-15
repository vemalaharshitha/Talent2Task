"""
Pydantic data models for Talent2Task FastAPI AI Service.
Defines schemas for NLP Extraction, Semantic Matching, Hybrid Ranking,
Skill-Gap Analysis, Demand Prediction, and Trust/Safety Analysis.
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

# ==========================================
# 1. NLP Extraction Schemas
# ==========================================
class NLPExtractRequest(BaseModel):
    text: str = Field(..., description="User query or voice transcript in any supported language (EN, TA, TE, HI)")
    language_hint: Optional[str] = Field(None, description="Optional ISO language hint (en, ta, te, hi)")

class ExtractedEntities(BaseModel):
    skills: List[str] = Field(default_factory=list)
    location: Optional[str] = None
    max_distance_km: Optional[float] = None
    min_pay: Optional[float] = None
    payout_type: Optional[str] = None
    timing: Optional[str] = None
    experience_level: Optional[str] = None

class NLPExtractResponse(BaseModel):
    detected_language: str
    intent: str
    entities: ExtractedEntities
    normalized_query: str
    confidence: float

# ==========================================
# 2. Semantic Matching Schemas
# ==========================================
class CandidateProfile(BaseModel):
    id: str
    name: Optional[str] = None
    skills: List[str]
    bio: Optional[str] = ""

class SemanticMatchRequest(BaseModel):
    required_skills: List[str]
    job_description: Optional[str] = ""
    candidates: List[CandidateProfile]
    top_k: Optional[int] = 10

class MatchResult(BaseModel):
    candidate_id: str
    similarity_score: float
    matched_skills: List[str]
    missing_skills: List[str]

class SemanticMatchResponse(BaseModel):
    matches: List[MatchResult]
    total_evaluated: int

# ==========================================
# 3. Hybrid Ranking Schemas
# ==========================================
class CandidateRankingInput(BaseModel):
    id: str
    name: Optional[str] = None
    skills: List[str]
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance_km: Optional[float] = None
    is_available: bool = True
    experience_years: Optional[float] = 0.0
    reliability_score: Optional[float] = 75.0
    completed_tasks: Optional[int] = 0
    rating: Optional[float] = 4.0

class HybridRankRequest(BaseModel):
    job_id: Optional[str] = None
    required_skills: List[str]
    job_category: Optional[str] = "General"
    job_latitude: Optional[float] = None
    job_longitude: Optional[float] = None
    candidates: List[CandidateRankingInput]

class RankedCandidateResult(BaseModel):
    id: str
    name: Optional[str] = None
    total_score: float
    breakdown: Dict[str, float]
    matched_skills: List[str]
    reliability_score: float
    distance_km: Optional[float] = None

class HybridRankResponse(BaseModel):
    ranked_candidates: List[RankedCandidateResult]
    algorithm_version: str = "v9-hybrid-fastapi"

# ==========================================
# 4. Skill Gap Analysis Schemas
# ==========================================
class SkillGapRequest(BaseModel):
    worker_skills: List[str]
    target_role: Optional[str] = None
    region: Optional[str] = "Tamil Nadu"

class SkillRecommendation(BaseModel):
    skill: str
    importance: str
    estimated_wage_increase_percent: float
    training_resource: str
    reason: str

class SkillGapResponse(BaseModel):
    worker_skills: List[str]
    matched_skills: List[str]
    missing_skills: List[str]
    match_percentage: float
    recommendations: List[SkillRecommendation]
    readiness_level: str

# ==========================================
# 5. Local Demand Prediction Schemas
# ==========================================
class HistoricalDataPoint(BaseModel):
    date: str
    job_count: int

class DemandPredictionRequest(BaseModel):
    skill: str
    district: str
    historical_points: Optional[List[HistoricalDataPoint]] = None

class DemandPredictionResponse(BaseModel):
    skill: str
    district: str
    current_demand_level: str
    predicted_demand_level: Optional[str] = None
    prediction_confidence: Optional[float] = None
    insufficient_data: bool
    data_points_count: int
    summary: str

# ==========================================
# 6. Trust & Safety Schemas
# ==========================================
class JobSafetyInput(BaseModel):
    id: str
    title: str
    description: str
    category: str
    payout_amount: float
    payout_type: str
    recruiter_id: Optional[str] = None
    recruiter_posts_count: Optional[int] = 1

class RiskSignal(BaseModel):
    code: str
    level: str
    description: str

class TrustSafetyRequest(BaseModel):
    job: JobSafetyInput

class TrustSafetyResponse(BaseModel):
    job_id: str
    risk_level: str  # "LOW", "MEDIUM", "HIGH"
    status_label: str  # "Verified & Safe", "Potential Risk Detected"
    risk_score: float
    signals: List[RiskSignal]
    explanation: str
    safe_to_publish: bool

# ==========================================
# 7. AI Chat Assistant Schemas
# ==========================================
class ChatAction(BaseModel):
    action_type: str  # "VIEW_JOB", "OPEN_POST_JOB", "NAVIGATE_TAB", "FILTER_SKILL"
    label: str
    payload: Optional[Dict[str, Any]] = None

class ChatUserContext(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = "seeker"  # "seeker" or "recruiter"
    name: Optional[str] = None
    skills: Optional[List[str]] = []
    city: Optional[str] = "Chennai"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    language: Optional[str] = "en"

class ChatQueryRequest(BaseModel):
    query: str
    language: Optional[str] = "en"
    context: Optional[ChatUserContext] = None
    recent_history: Optional[List[Dict[str, str]]] = []

class ChatQueryResponse(BaseModel):
    reply: str
    intent: str
    detected_language: str
    actions: Optional[List[ChatAction]] = []
    suggested_followups: Optional[List[str]] = []
    sources: Optional[List[str]] = []

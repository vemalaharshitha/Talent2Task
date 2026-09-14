"""
Verification test suite for Talent2Task FastAPI AI Service.
Tests:
1. NLP Extraction (Multilingual: EN, TA, TE, HI)
2. Semantic Matching
3. Hybrid Ranking
4. Skill Gap Analysis
5. Demand Prediction (Actual + Insufficient Data handling + ML Forecasting)
6. Trust & Safety Assessment
7. PostGIS Proximity Match Simulation
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
from backend.models import (
    NLPExtractRequest, SemanticMatchRequest, CandidateProfile,
    HybridRankRequest, CandidateRankingInput, SkillGapRequest,
    DemandPredictionRequest, HistoricalDataPoint,
    TrustSafetyRequest, JobSafetyInput
)
from backend.services.nlp_service import extract_nlp
from backend.services.semantic_service import evaluate_semantic_matching
from backend.services.ranking_service import rank_candidates
from backend.services.skill_gap_service import analyze_skill_gap
from backend.services.demand_service import predict_skill_demand
from backend.services.trust_service import analyze_trust_safety
from backend.database.postgres import db_manager

def test_nlp_extraction():
    print("\n--- Testing 1: Multilingual NLP Extraction ---")
    
    # Test Tamil Voice query
    ta_req = NLPExtractRequest(text="எனக்கு ஒரு பிளம்பர் தேவை சென்னை 10 km Rs 800 per day")
    ta_res = extract_nlp(ta_req)
    assert ta_res.detected_language == "ta", f"Expected 'ta', got {ta_res.detected_language}"
    assert "Plumbing" in ta_res.entities.skills, f"Expected 'Plumbing' in skills, got {ta_res.entities.skills}"
    assert ta_res.entities.location == "Chennai", f"Expected location 'Chennai', got {ta_res.entities.location}"
    assert ta_res.entities.max_distance_km == 10.0, f"Expected 10km, got {ta_res.entities.max_distance_km}"
    print(f" Tamil extraction passed: {ta_res.entities.skills}, {ta_res.entities.location}")

    # Test English query
    en_req = NLPExtractRequest(text="Need an urgent electrician in Coimbatore within 5km Rs 1200/day")
    en_res = extract_nlp(en_req)
    assert en_res.detected_language == "en"
    assert "Electrical" in en_res.entities.skills
    assert en_res.entities.location == "Coimbatore"
    assert en_res.entities.timing == "URGENT"
    print(f" English extraction passed: {en_res.entities.skills}, {en_res.entities.timing}")

def test_semantic_matching():
    print("\n--- Testing 2: Semantic Skill Matching ---")
    req = SemanticMatchRequest(
        required_skills=["Plumbing", "Pipe Fitting"],
        candidates=[
            CandidateProfile(id="c1", name="Karthik", skills=["Plumber", "Drainage"]),
            CandidateProfile(id="c2", name="Ramesh", skills=["Electrician", "Wiring"]),
            CandidateProfile(id="c3", name="Senthil", skills=["Pipe Fitting", "Plumbing", "Sanitary"])
        ]
    )
    res = evaluate_semantic_matching(req)
    assert len(res.matches) == 3
    assert res.matches[0].candidate_id == "c3", "c3 should have highest match"
    assert res.matches[0].similarity_score >= 0.85
    assert res.matches[-1].candidate_id == "c2", "c2 (Electrician) should have lowest match"
    print(f" Semantic match passed: Top candidate {res.matches[0].candidate_id} score={res.matches[0].similarity_score}")

def test_hybrid_ranking():
    print("\n--- Testing 3: Hybrid AI Ranking Engine ---")
    req = HybridRankRequest(
        required_skills=["Plumbing"],
        job_category="Plumbing",
        job_latitude=13.0827,
        job_longitude=80.2707,
        candidates=[
            CandidateRankingInput(
                id="w1", name="Arun", skills=["Plumbing"],
                latitude=13.0850, longitude=80.2720,  # ~0.3 km
                is_available=True, experience_years=4.0, reliability_score=92.0
            ),
            CandidateRankingInput(
                id="w2", name="Vijay", skills=["Plumbing"],
                latitude=13.2500, longitude=80.4000,  # ~25 km away
                is_available=False, experience_years=1.0, reliability_score=60.0
            )
        ]
    )
    res = rank_candidates(req)
    assert len(res.ranked_candidates) == 2
    assert res.ranked_candidates[0].id == "w1", "w1 should rank higher due to proximity, availability, and reliability"
    assert res.ranked_candidates[0].total_score > res.ranked_candidates[1].total_score
    print(f" Hybrid ranking passed: Winner={res.ranked_candidates[0].name} (Score={res.ranked_candidates[0].total_score} vs {res.ranked_candidates[1].total_score})")

def test_skill_gap():
    print("\n--- Testing 4: Skill-Gap Analysis ---")
    req = SkillGapRequest(worker_skills=["Plumbing", "Pipe Fitting"], target_role="Master Plumber")
    res = analyze_skill_gap(req)
    assert "Drainage" in res.missing_skills or "Water Pressure Testing" in res.missing_skills
    assert len(res.recommendations) > 0
    assert res.recommendations[0].estimated_wage_increase_percent > 0
    print(f" Skill gap passed: Readiness={res.readiness_level}, Recs={len(res.recommendations)}")

def test_demand_intelligence():
    print("\n--- Testing 5: Demand Intelligence & ML Forecasting ---")
    
    # 5a. Insufficient data test
    sparse_req = DemandPredictionRequest(
        skill="Plumber",
        district="Salem",
        historical_points=[HistoricalDataPoint(date="2026-09-01", job_count=3)]
    )
    sparse_res = predict_skill_demand(sparse_req)
    assert sparse_res.insufficient_data is True
    assert sparse_res.predicted_demand_level is None
    print(f" Insufficient data handled transparently: {sparse_res.summary}")

    # 5b. Sufficient data test (Random Forest execution)
    full_req = DemandPredictionRequest(
        skill="Electrician",
        district="Chennai",
        historical_points=[
            HistoricalDataPoint(date="2026-08-01", job_count=8),
            HistoricalDataPoint(date="2026-08-08", job_count=10),
            HistoricalDataPoint(date="2026-08-15", job_count=12),
            HistoricalDataPoint(date="2026-08-22", job_count=15),
            HistoricalDataPoint(date="2026-08-29", job_count=18),
            HistoricalDataPoint(date="2026-09-05", job_count=22)
        ]
    )
    full_res = predict_skill_demand(full_req)
    assert full_res.insufficient_data is False
    assert full_res.predicted_demand_level is not None
    assert full_res.prediction_confidence is not None
    print(f" Random Forest prediction passed: Level={full_res.predicted_demand_level}, Conf={full_res.prediction_confidence}")

def test_trust_safety():
    print("\n--- Testing 6: Trust & Safety Assessment ---")
    
    # Normal safe job
    safe_job = JobSafetyInput(
        id="j1",
        title="Residential House Wiring",
        description="Looking for certified electrician for apartment rewiring in Anna Nagar. Fair daily wage.",
        category="Electrical",
        payout_amount=1200.0,
        payout_type="DAILY"
    )
    safe_res = analyze_trust_safety(TrustSafetyRequest(job=safe_job))
    assert safe_res.risk_level == "LOW"
    assert safe_res.status_label == "Verified & Safe"
    print(f" Safe job passed: {safe_res.status_label}")

    # Suspicious job with advance fee & unreal pay
    risky_job = JobSafetyInput(
        id="j2",
        title="Plumbing Assistant Earn Big",
        description="Earn 15000 per day! Registration fee of 500 required before start. Send aadhaar otp.",
        category="Plumbing",
        payout_amount=15000.0,
        payout_type="DAILY"
    )
    risky_res = analyze_trust_safety(TrustSafetyRequest(job=risky_job))
    assert risky_res.risk_level == "HIGH"
    assert risky_res.status_label == "Potential Risk Detected"
    assert len(risky_res.signals) >= 2
    print(f" Risk detection passed: {risky_res.status_label} with {len(risky_res.signals)} signals.")

def test_postgis_proximity():
    print("\n--- Testing 7: PostGIS / Proximity Calculation ---")
    mock_jobs = [
        {"id": "j_near", "title": "Nearby Pipe Repair", "latitude": 13.0830, "longitude": 80.2710}, # ~0.05 km
        {"id": "j_far", "title": "Distant Welding", "latitude": 11.0168, "longitude": 76.9558}     # Coimbatore ~500 km
    ]
    results = db_manager.query_jobs_within_radius(
        user_lat=13.0827,
        user_lng=80.2707,
        radius_km=10.0,
        mock_jobs=mock_jobs
    )
    assert len(results) == 1
    assert results[0]["id"] == "j_near"
    assert results[0]["distance_km"] < 1.0
    print(f" PostGIS proximity query passed: Found {len(results)} jobs within 10km (dist={results[0]['distance_km']} km)")

def test_chat_assistant():
    print("\n--- Testing 8: Talent2Task AI Chat Assistant ---")
    from backend.models import ChatQueryRequest, ChatUserContext
    from backend.services.chat_service import process_chat_query

    # 1. Test Greeting
    req1 = ChatQueryRequest(query="வணக்கம்", language="ta")
    res1 = process_chat_query(req1)
    assert res1.intent == "GREETING"
    assert "Talent2Task" in res1.reply
    print(f" Chat Greeting passed (TA): {res1.reply[:60]}...")

    # 2. Test Skill Gap question
    req2 = ChatQueryRequest(
        query="What skills should I learn in Chennai?",
        language="en",
        context=ChatUserContext(city="Chennai", skills=["Plumbing"])
    )
    res2 = process_chat_query(req2)
    assert res2.intent == "SKILL_GAP_RECOMMENDATION"
    assert len(res2.actions) > 0
    print(f" Chat Skill Gap passed: {res2.intent} with {len(res2.actions)} actions.")

    # 3. Test Employer query
    req3 = ChatQueryRequest(
        query="Find a plumber near me",
        language="en",
        context=ChatUserContext(role="recruiter", city="Chennai")
    )
    res3 = process_chat_query(req3)
    assert res3.intent in ["WORKER_SEARCH", "JOB_SEARCH"]
    print(f" Chat Worker/Job search passed: {res3.intent}")

if __name__ == "__main__":
    test_nlp_extraction()
    test_semantic_matching()
    test_hybrid_ranking()
    test_skill_gap()
    test_demand_intelligence()
    test_trust_safety()
    test_postgis_proximity()
    test_chat_assistant()
    print("\n ALL 8 FASTAPI AI & CHAT ASSISTANT VERIFICATION TESTS PASSED SUCCESSFULLY!")

"""
Trust & Safety Intelligence Service.
Evaluates job postings for potential risk signals using transparent, non-accusatory heuristics
and machine intelligence. Identifies unrealistic compensation, advance fee schemes, and sensitive
data harvesting without auto-banning or aggressive labeling.
"""

import re
from typing import List
from ..models import TrustSafetyRequest, TrustSafetyResponse, RiskSignal

# Standard Vocational Daily Market Caps (INR)
BENCHMARK_MAX_DAILY_WAGE = {
    "plumbing": 2500.0,
    "electrical": 2800.0,
    "carpentry": 2600.0,
    "welding": 3000.0,
    "painting": 2200.0,
    "masonry": 2400.0,
    "driving": 2000.0,
    "cooking": 1800.0,
    "tailoring": 1500.0,
    "general": 2500.0
}

def analyze_trust_safety(request: TrustSafetyRequest) -> TrustSafetyResponse:
    """Performs non-accusatory trust and safety audit on a job posting."""
    job = request.job
    signals: List[RiskSignal] = []
    
    desc_lower = job.description.lower()
    title_lower = job.title.lower()
    text_corpus = f"{title_lower} {desc_lower}"
    
    # Signal 1: Advance Fee or Registration Deposit
    fee_keywords = [
        "registration fee", "deposit", "processing charge", "advance payment required",
        "security deposit", "pay before joining", "pay to apply", "application money"
    ]
    if any(k in text_corpus for k in fee_keywords):
        signals.append(RiskSignal(
            code="EXTERNAL_OR_ADVANCE_FEE",
            level="HIGH",
            description="Posting mentions advance deposit or registration fees before work begins."
        ))
        
    # Signal 2: Sensitive Personal Data / Credential Harvesting
    credential_keywords = [
        "aadhaar otp", "bank password", "netbanking", "cvv", "pin number",
        "credit card details", "share otp", "atm card", "upi pin"
    ]
    if any(k in text_corpus for k in credential_keywords):
        signals.append(RiskSignal(
            code="SENSITIVE_CREDENTIAL_REQUEST",
            level="CRITICAL",
            description="Posting requests sensitive financial or identity credentials."
        ))
        
    # Signal 3: Unrealistic Payout Amount (> 3.5x typical benchmark)
    cat_key = job.category.lower()
    benchmark = BENCHMARK_MAX_DAILY_WAGE.get(cat_key, BENCHMARK_MAX_DAILY_WAGE["general"])
    
    if job.payout_type.upper() == "DAILY" and job.payout_amount > (benchmark * 3.5):
        signals.append(RiskSignal(
            code="ANOMALOUS_PAYOUT",
            level="MEDIUM",
            description=f"Advertised daily wage of ₹{job.payout_amount:,.0f} is significantly higher than regional benchmark (₹{benchmark:,.0f})."
        ))
    elif job.payout_type.upper() == "HOURLY" and job.payout_amount > 2000.0:
        signals.append(RiskSignal(
            code="ANOMALOUS_HOURLY_PAYOUT",
            level="MEDIUM",
            description=f"Hourly wage of ₹{job.payout_amount:,.0f} exceeds typical market rates for {job.category}."
        ))
        
    # Signal 4: Vague or Low Content Density
    if len(job.description.strip()) < 15:
        signals.append(RiskSignal(
            code="LOW_INFORMATION_DENSITY",
            level="LOW",
            description="Job description is unusually brief, which may lead to scope ambiguity."
        ))
        
    # Compute composite risk score (0 to 100)
    score = 0.0
    for s in signals:
        if s.level == "CRITICAL":
            score += 50.0
        elif s.level == "HIGH":
            score += 35.0
        elif s.level == "MEDIUM":
            score += 20.0
        elif s.level == "LOW":
            score += 10.0
            
    risk_score = min(100.0, score)
    
    # Determine risk level and transparent non-accusatory status label
    if risk_score >= 50.0:
        risk_level = "HIGH"
        status_label = "Potential Risk Detected"
        safe_to_publish = False
        explanation = "Multiple anomalies detected including potential advance fee or credential requests. Verification recommended."
    elif risk_score >= 20.0:
        risk_level = "MEDIUM"
        status_label = "Potential Risk Detected"
        safe_to_publish = True
        explanation = "One or more atypical terms (e.g. high payout or brief description) were noted for applicant awareness."
    else:
        risk_level = "LOW"
        status_label = "Verified & Safe"
        safe_to_publish = True
        explanation = "Posting aligns with standard vocational guidelines and verified fair wage ranges."
        
    return TrustSafetyResponse(
        job_id=job.id,
        risk_level=risk_level,
        status_label=status_label,
        risk_score=risk_score,
        signals=signals,
        explanation=explanation,
        safe_to_publish=safe_to_publish
    )

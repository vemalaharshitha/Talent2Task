"""
Skill-Gap Analysis and Personalized Upskilling Service.
Analyses worker skills against target market roles, identifies missing high-demand capabilities,
and provides transparent wage uplift estimations and training paths.
"""

from typing import List, Dict, Any, Set
from ..models import SkillGapRequest, SkillGapResponse, SkillRecommendation

# Benchmark Role Requirements
BENCHMARK_ROLES: Dict[str, Dict[str, Any]] = {
    "Master Plumber": {
        "core_skills": ["Plumbing", "Pipe Fitting", "Drainage", "Sanitary"],
        "advanced_skills": ["Leak Detection", "Water Pressure Testing", "Solar Water Heater Installation"],
        "courses": {
            "Water Pressure Testing": ("Tamil Nadu Skill Development Corporation (TNSDC) - Advanced Plumbing", 18.0),
            "Solar Water Heater Installation": ("National Skill Development Corporation (NSDC) - Green Plumbing", 25.0),
            "Leak Detection": ("Vocational Training Institute - Pipe Diagnostic Systems", 15.0)
        }
    },
    "Industrial Electrician": {
        "core_skills": ["Electrical", "Wiring", "Lighting"],
        "advanced_skills": ["Circuit Breaker Diagnostics", "Three Phase Motor Wiring", "Solar Inverter Maintenance"],
        "courses": {
            "Three Phase Motor Wiring": ("Government ITI Certificate - Industrial Power Systems", 28.0),
            "Solar Inverter Maintenance": ("Surya Mitra Skill Development Program", 32.0),
            "Circuit Breaker Diagnostics": ("TNSDC Modern Electrical Safety Systems", 15.0)
        }
    },
    "Modular Carpenter": {
        "core_skills": ["Carpentry", "Woodwork", "Door Fitting"],
        "advanced_skills": ["Modular Kitchen Assembly", "Precision Power Tools", "CAD Blueprint Reading"],
        "courses": {
            "Modular Kitchen Assembly": ("Interior Fitters Skill Council Certification", 35.0),
            "Precision Power Tools": ("Modern Woodcraft & Safety Workshop", 15.0),
            "CAD Blueprint Reading": ("Technical Drawing for Modular Furniture", 20.0)
        }
    },
    "Structural Welder": {
        "core_skills": ["Welding", "Metal Fabrication"],
        "advanced_skills": ["TIG Welding", "MIG Welding", "Boiler Pressure Welding"],
        "courses": {
            "TIG Welding": ("Advanced Metal Works Institute - TIG/MIG Specialist", 40.0),
            "Boiler Pressure Welding": ("Certified Pressure Vessel Welding (ASME standards)", 50.0)
        }
    }
}

def analyze_skill_gap(request: SkillGapRequest) -> SkillGapResponse:
    """Executes skill gap analysis and returns structured upskilling pathways."""
    worker_set = set(s.strip().lower() for s in request.worker_skills)
    
    # Identify target role
    target_role = request.target_role
    if not target_role or target_role not in BENCHMARK_ROLES:
        # Infer closest role based on worker skills
        best_role = "Master Plumber"
        best_overlap = -1
        for role, data in BENCHMARK_ROLES.items():
            all_role_skills = [s.lower() for s in data["core_skills"] + data["advanced_skills"]]
            overlap = sum(1 for s in all_role_skills if s in worker_set)
            if overlap > best_overlap:
                best_overlap = overlap
                best_role = role
        target_role = best_role
        
    role_data = BENCHMARK_ROLES[target_role]
    all_required = role_data["core_skills"] + role_data["advanced_skills"]
    
    matched: List[str] = []
    missing: List[str] = []
    
    for req in all_required:
        req_norm = req.lower()
        if any(req_norm in w or w in req_norm for w in worker_set):
            matched.append(req)
        else:
            missing.append(req)
            
    match_pct = round((len(matched) / len(all_required) * 100.0) if all_required else 100.0, 1)
    
    # Determine readiness level
    if match_pct >= 80.0:
        readiness = "Job Ready"
    elif match_pct >= 50.0:
        readiness = "Near Ready"
    else:
        readiness = "Upskilling Needed"
        
    # Generate recommendations
    recommendations: List[SkillRecommendation] = []
    courses = role_data.get("courses", {})
    
    for miss in missing:
        course_name, wage_inc = courses.get(miss, (f"Vocational Certification in {miss}", 15.0))
        importance = "HIGH" if miss in role_data["core_skills"] else "MEDIUM"
        recommendations.append(SkillRecommendation(
            skill=miss,
            importance=importance,
            estimated_wage_increase_percent=wage_inc,
            training_resource=course_name,
            reason=f"High regional demand for {miss} in {request.region or 'Tamil Nadu'} with estimated +{wage_inc}% earning potential."
        ))
        
    return SkillGapResponse(
        worker_skills=request.worker_skills,
        matched_skills=matched,
        missing_skills=missing,
        match_percentage=match_pct,
        recommendations=recommendations,
        readiness_level=readiness
    )

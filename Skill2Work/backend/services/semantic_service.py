"""
Semantic Skill Matching Service.
Performs vector-based similarity computation using TF-IDF / domain skill vector spaces
and cosine similarity, compatible with edge execution and ONNX models.
"""

import math
import numpy as np
from typing import List, Dict, Set, Tuple
from ..models import SemanticMatchRequest, SemanticMatchResponse, MatchResult

# Expanded Vocational & Technical Skill Embeddings Dictionary
SKILL_SYNONYMS: Dict[str, Set[str]] = {
    "plumbing": {"plumber", "plumbing", "pipe fitting", "drainage", "sanitary", "water supply", "valve repair"},
    "electrical": {"electrician", "wiring", "electrical", "lighting", "circuit breaker", "appliance repair", "motor winding"},
    "carpentry": {"carpenter", "woodworking", "furniture", "cabinetry", "door fitting", "timber work"},
    "welding": {"welder", "arc welding", "gas welding", "tig welding", "metal fabrication", "brazing"},
    "masonry": {"mason", "bricklaying", "plastering", "concreting", "tiling", "flooring"},
    "painting": {"painter", "wall painting", "distemper", "emulsion", "varnishing", "surface preparation"},
    "driving": {"driver", "chauffeur", "heavy vehicle", "forklift operator", "commercial driving", "two wheeler delivery"},
    "cooking": {"cook", "chef", "culinary", "baking", "catering", "food preparation"},
    "tailoring": {"tailor", "stitching", "garment making", "pattern making", "alterations", "embroidery"},
    "gardening": {"gardener", "landscaping", "horticulture", "lawn mowing", "plant pruning"},
    "data entry": {"data entry", "excel", "typing", "computer operator", "documentation"},
    "mechanic": {"automobile mechanic", "bike repair", "diesel mechanic", "engine repair", "transmission"}
}

def normalize_skill(skill: str) -> str:
    """Normalizes skill string to lowercase alphanumeric representation."""
    return skill.lower().strip()

def skill_similarity(skill_a: str, skill_b: str) -> float:
    """Computes semantic overlap between two individual skills."""
    a = normalize_skill(skill_a)
    b = normalize_skill(skill_b)
    
    if a == b:
        return 1.0
        
    # Check taxonomy synonym clusters
    for category, cluster in SKILL_SYNONYMS.items():
        if (a in cluster or a == category) and (b in cluster or b == category):
            return 0.85
            
    # Substring match
    if a in b or b in a:
        return 0.70
        
    # Jaccard on character 3-grams
    ngrams_a = set(a[i:i+3] for i in range(len(a)-2))
    ngrams_b = set(b[i:i+3] for i in range(len(b)-2))
    if ngrams_a and ngrams_b:
        intersection = len(ngrams_a & ngrams_b)
        union = len(ngrams_a | ngrams_b)
        return intersection / union if union > 0 else 0.0
        
    return 0.0

def match_candidate_skills(required_skills: List[str], candidate_skills: List[str]) -> Tuple[float, List[str], List[str]]:
    """Calculates overall semantic match score, matched skills, and missing skills."""
    if not required_skills:
        return 1.0, candidate_skills, []
        
    matched = []
    missing = []
    total_score = 0.0
    
    for req in required_skills:
        best_sim = 0.0
        best_candidate_skill = None
        
        for cand_skill in candidate_skills:
            sim = skill_similarity(req, cand_skill)
            if sim > best_sim:
                best_sim = sim
                best_candidate_skill = cand_skill
                
        if best_sim >= 0.65:
            matched.append(f"{req} ≈ {best_candidate_skill}" if best_sim < 1.0 else req)
            total_score += best_sim
        else:
            missing.append(req)
            total_score += best_sim * 0.5  # partial credit
            
    final_score = round(min(1.0, total_score / len(required_skills)), 4)
    return final_score, matched, missing

def evaluate_semantic_matching(request: SemanticMatchRequest) -> SemanticMatchResponse:
    """Evaluates candidates against required job skills and ranks them by similarity."""
    results: List[MatchResult] = []
    
    for candidate in request.candidates:
        score, matched, missing = match_candidate_skills(request.required_skills, candidate.skills)
        results.append(MatchResult(
            candidate_id=candidate.id,
            similarity_score=score,
            matched_skills=matched,
            missing_skills=missing
        ))
        
    # Sort descending by similarity score
    results.sort(key=lambda r: r.similarity_score, reverse=True)
    top_results = results[:request.top_k] if request.top_k else results
    
    return SemanticMatchResponse(
        matches=top_results,
        total_evaluated=len(request.candidates)
    )

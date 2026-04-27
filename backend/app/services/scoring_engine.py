"""
Scoring Engine
Scores a candidate against a job description.
Final score is out of 5.
Visibility rule: score >= 3.5 AND status is verified/test_verified
"""
from typing import Optional

WEIGHTS = {
    "skills_match": 0.40,
    "experience": 0.20,
    "test_performance": 0.20,
    "education": 0.10,
    "completeness": 0.10,
}

SCORE_LABELS = [
    (4.5, "Excellent Match"),
    (4.0, "Strong Match"),
    (3.5, "Good Match"),
    (2.5, "Moderate Match"),
    (0.0, "Weak Match"),
]

def get_label(score: float) -> str:
    for threshold, label in SCORE_LABELS:
        if score >= threshold:
            return label
    return "Weak Match"

def score_skills(candidate_skills: list, required_skills: list) -> float:
    """Returns 0-1 based on skill overlap."""
    if not required_skills:
        return 0.5
    candidate_lower = [s.lower() for s in candidate_skills]
    matched = sum(1 for s in required_skills if s.lower() in candidate_lower)
    return min(matched / len(required_skills), 1.0)

def score_experience(candidate_exp_years: float, required_exp: str) -> float:
    """Simple mapping: entry=0-1yr, mid=2-4yr, senior=5+yr."""
    mapping = {"entry": 1, "mid": 3, "senior": 5}
    required_years = mapping.get(required_exp.lower(), 1)
    if candidate_exp_years >= required_years:
        return 1.0
    return candidate_exp_years / required_years

def score_education(candidate_degree: Optional[str], required_education: Optional[str]) -> float:
    if not required_education or not candidate_degree:
        return 0.5
    degree_rank = {"phd": 4, "master": 3, "m.tech": 3, "mba": 3, "bachelor": 2, "b.tech": 2, "b.e": 2, "diploma": 1}
    candidate_rank = next((v for k, v in degree_rank.items() if k in candidate_degree.lower()), 1)
    required_rank = next((v for k, v in degree_rank.items() if k in required_education.lower()), 1)
    return min(candidate_rank / required_rank, 1.0)

def calculate_score(
    candidate_skills: list,
    required_skills: list,
    candidate_exp_years: float,
    required_exp: str,
    test_score_pct: float,       # 0-100
    candidate_degree: str,
    required_education: str,
    profile_completeness: float, # 0-1
) -> dict:
    skills = score_skills(candidate_skills, required_skills)
    experience = score_experience(candidate_exp_years, required_exp)
    test = test_score_pct / 100.0
    education = score_education(candidate_degree, required_education)
    completeness = profile_completeness

    weighted = (
        skills * WEIGHTS["skills_match"] +
        experience * WEIGHTS["experience"] +
        test * WEIGHTS["test_performance"] +
        education * WEIGHTS["education"] +
        completeness * WEIGHTS["completeness"]
    )

    final_score = round(weighted * 5, 2)  # scale to 0-5

    return {
        "skills_match": round(skills * 5 * WEIGHTS["skills_match"], 2),
        "experience_score": round(experience * 5 * WEIGHTS["experience"], 2),
        "test_score": round(test * 5 * WEIGHTS["test_performance"], 2),
        "education_score": round(education * 5 * WEIGHTS["education"], 2),
        "completeness_score": round(completeness * 5 * WEIGHTS["completeness"], 2),
        "final_score": final_score,
        "label": get_label(final_score),
        "is_visible": final_score >= 3.5,
    }

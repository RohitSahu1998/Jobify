from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import get_db
from app.core.deps import require_company
from app.models.user import User
from app.models.score import CandidateScore
from app.models.candidate import CandidateProfile, VerificationStatus
from app.models.job import Job
from app.models.test import TestAttempt
from app.services.scoring_engine import calculate_score

router = APIRouter()

class ScoreRequest(BaseModel):
    candidate_id: str
    job_id: str

@router.post("/calculate")
def calculate_candidate_score(
    data: ScoreRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_company),
):
    candidate = db.query(CandidateProfile).filter(CandidateProfile.id == data.candidate_id).first()
    job = db.query(Job).filter(Job.id == data.job_id).first()
    if not candidate or not job:
        raise HTTPException(status_code=404, detail="Candidate or Job not found")

    best_test = db.query(TestAttempt).filter(
        TestAttempt.candidate_id == data.candidate_id,
        TestAttempt.passed == True
    ).order_by(TestAttempt.score.desc()).first()
    test_score_pct = best_test.score if best_test else 0.0

    parsed = candidate.parsed_resume or {}
    result = calculate_score(
        candidate_skills=parsed.get("skills", []),
        required_skills=job.required_skills or [],
        candidate_exp_years=len(parsed.get("experience", [])) * 0.5,
        required_exp=job.experience_level or "entry",
        test_score_pct=test_score_pct,
        candidate_degree=candidate.degree or "",
        required_education=job.education_required or "",
        profile_completeness=candidate.profile_completeness,
    )

    is_verified = candidate.verification_status in [
        VerificationStatus.verified, VerificationStatus.test_verified
    ]
    result["is_visible"] = result["is_visible"] and is_verified

    existing = db.query(CandidateScore).filter(
        CandidateScore.candidate_id == data.candidate_id,
        CandidateScore.job_id == data.job_id
    ).first()

    if existing:
        for k, v in result.items():
            setattr(existing, k, v)
        db.commit()
        return {"score_id": str(existing.id), **result}

    score = CandidateScore(candidate_id=data.candidate_id, job_id=data.job_id, **result)
    db.add(score)
    db.commit()
    db.refresh(score)
    return {"score_id": str(score.id), **result}

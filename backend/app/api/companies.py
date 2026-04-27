from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.deps import require_company, get_current_user
from app.models.user import User
from app.models.company import CompanyProfile
from app.models.score import CandidateScore

router = APIRouter()

class CompanyCreate(BaseModel):
    company_name: str
    industry: Optional[str] = ""
    website: Optional[str] = ""
    location: Optional[str] = ""

@router.post("/profile", status_code=201)
def create_company(
    data: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_company),
):
    existing = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Company profile already exists")
    company = CompanyProfile(user_id=current_user.id, **data.dict())
    db.add(company)
    db.commit()
    db.refresh(company)
    return {"message": "Company profile created", "company_id": str(company.id)}

@router.get("/me")
def get_my_company(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_company),
):
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return {"id": str(company.id), "company_name": company.company_name, "industry": company.industry}

@router.get("/candidates/{job_id}")
def get_visible_candidates(
    job_id: str,
    min_score: float = 3.5,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_company),
):
    # Verify the job belongs to this company
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")

    scores = db.query(CandidateScore).filter(
        CandidateScore.job_id == job_id,
        CandidateScore.final_score >= min_score,
        CandidateScore.is_visible == True,
    ).order_by(CandidateScore.final_score.desc()).all()

    result = []
    for s in scores:
        c = s.candidate
        result.append({
            "candidate_id": str(c.id),
            "name": c.full_name,
            "college": c.college,
            "score": s.final_score,
            "label": s.label,
            "verification_status": c.verification_status,
            "skills": (c.parsed_resume or {}).get("skills", []),
            "resume_path": c.resume_path,
        })

    return {"total": len(result), "candidates": result}

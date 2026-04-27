from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import require_company, get_current_user
from app.models.user import User
from app.models.job import Job
from app.models.company import CompanyProfile

router = APIRouter()

class JobCreate(BaseModel):
    title: str
    description: str
    required_skills: List[str]
    experience_level: str
    education_required: Optional[str] = ""
    keywords: Optional[List[str]] = []
    location: Optional[str] = ""

@router.post("/", status_code=201)
def create_job(
    data: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_company),
):
    company = db.query(CompanyProfile).filter(CompanyProfile.user_id == current_user.id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Create company profile first")
    job = Job(company_id=company.id, **data.dict())
    db.add(job)
    db.commit()
    db.refresh(job)
    return {"message": "Job posted", "job_id": str(job.id)}

@router.get("/")
def list_jobs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    jobs = db.query(Job).filter(Job.is_active == True).all()
    return [{"id": str(j.id), "title": j.title, "location": j.location,
             "experience_level": j.experience_level, "required_skills": j.required_skills} for j in jobs]

@router.get("/{job_id}")
def get_job(job_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"id": str(job.id), "title": job.title, "required_skills": job.required_skills,
            "experience_level": job.experience_level, "description": job.description}

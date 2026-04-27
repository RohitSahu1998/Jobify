import os, shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_db
from app.core.config import settings
from app.core.deps import require_candidate
from app.models.user import User
from app.models.candidate import CandidateProfile, VerificationStatus
from app.models.proof import ProofDocument, ProofCategory, ProofStatus
from app.services.resume_parser import parse_resume
from app.services.ocr_service import validate_certificate

router = APIRouter()

class ProfileCreate(BaseModel):
    full_name: str
    phone: Optional[str] = ""
    location: Optional[str] = ""
    college: Optional[str] = ""
    degree: Optional[str] = ""
    graduation_year: Optional[int] = None

@router.post("/profile", status_code=201)
def create_profile(
    data: ProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    existing = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    profile = CandidateProfile(user_id=current_user.id, **data.dict())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return {"message": "Profile created", "profile_id": str(profile.id)}

@router.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {
        "id": str(profile.id),
        "full_name": profile.full_name,
        "college": profile.college,
        "degree": profile.degree,
        "location": profile.location,
        "verification_status": profile.verification_status,
        "profile_completeness": profile.profile_completeness,
        "parsed_resume": profile.parsed_resume,
    }

@router.get("/proofs")
def get_my_proofs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    proofs = db.query(ProofDocument).filter(ProofDocument.candidate_id == profile.id).all()
    return [
        {
            "id": str(p.id),
            "category": p.category,
            "claim_text": p.claim_text,
            "status": p.status,
            "no_proof_selected": p.no_proof_selected,
            "test_assigned": p.test_assigned,
            "ocr_extracted": p.ocr_extracted,
            "uploaded_at": p.uploaded_at,
            "file_url": f"/uploads/{p.file_path.split('/')[-1]}" if p.file_path else None,
        }
        for p in proofs
    ]

@router.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Create your profile first")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = f"{settings.UPLOAD_DIR}/resume_{profile.id}_{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    parsed = parse_resume(file_path)
    profile.resume_path = file_path
    profile.parsed_resume = parsed

    fields = [profile.full_name, profile.phone, profile.location, profile.college, profile.degree]
    profile.profile_completeness = round(sum(1 for f in fields if f) / len(fields), 2)
    db.commit()

    return {"message": "Resume uploaded and parsed", "parsed": parsed}

@router.post("/upload-proof")
async def upload_proof(
    category: ProofCategory = Form(...),
    claim_text: str = Form(...),
    no_proof: bool = Form(False),
    file: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Create your profile first")

    proof = ProofDocument(
        candidate_id=profile.id,
        category=category,
        claim_text=claim_text,
        no_proof_selected=no_proof,
    )

    if no_proof:
        proof.status = ProofStatus.no_proof
        proof.test_assigned = True
        db.add(proof)
        db.commit()
        db.refresh(proof)
        return {"message": "No proof selected. Skill test assigned.", "test_required": True, "proof_id": str(proof.id)}

    if not file:
        raise HTTPException(status_code=400, detail="File required if not selecting no-proof")

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = f"{settings.UPLOAD_DIR}/proof_{profile.id}_{file.filename}"
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    ocr_result = validate_certificate(file_path, profile.full_name)
    proof.file_path = file_path
    proof.ocr_extracted = ocr_result["ocr_text"]
    proof.status = ProofStatus.verified if ocr_result["is_valid"] else ProofStatus.pending

    db.add(proof)
    db.commit()
    db.refresh(proof)

    # Update verification status after commit so new proof status is visible
    _update_verification_status(profile, db)

    return {
        "message": "Proof uploaded and verified!" if ocr_result["is_valid"] else "Proof uploaded. Pending manual review.",
        "ocr_name_matched": ocr_result["name_matched"],
        "status": proof.status,
        "proof_id": str(proof.id),
        "verification_status": profile.verification_status,
    }


def _update_verification_status(profile: CandidateProfile, db: Session):
    """
    Update candidate verification status based on proof states.
    Rules:
    - At least ONE proof must be verified (OCR or test passed)
    - No proof can be in rejected state
    - Proofs with no_proof must have a passed test (not just assigned)
    """
    from app.models.test import TestAttempt

    proofs = db.query(ProofDocument).filter(ProofDocument.candidate_id == profile.id).all()
    if not proofs:
        return

    has_verified = False
    has_rejected = False

    for p in proofs:
        if p.status == ProofStatus.verified:
            has_verified = True
        elif p.status == ProofStatus.rejected:
            has_rejected = True
        elif p.no_proof_selected:
            # Check if test was actually passed for this proof
            passed_test = db.query(TestAttempt).filter(
                TestAttempt.proof_id == p.id,
                TestAttempt.passed == True
            ).first()
            if passed_test:
                has_verified = True
                # Also mark the proof as verified
                p.status = ProofStatus.verified

    if has_rejected:
        return  # Don't verify if any proof was rejected

    if has_verified:
        # Check if any test_verified already set — keep it
        if profile.verification_status != VerificationStatus.test_verified:
            profile.verification_status = VerificationStatus.verified
        db.commit()

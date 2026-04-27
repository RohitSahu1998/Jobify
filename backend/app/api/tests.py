from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.core.deps import require_candidate
from app.models.user import User
from app.models.candidate import CandidateProfile, VerificationStatus
from app.models.test import TestAttempt
from app.models.proof import ProofDocument, ProofStatus
from app.services.test_engine import get_test_type_for_category, get_questions, evaluate_answers

router = APIRouter()

class StartTestRequest(BaseModel):
    proof_id: str
    domain: str  # tech / marketing / finance / general

class SubmitTestRequest(BaseModel):
    attempt_id: str
    answers: dict

@router.post("/start")
def start_test(
    data: StartTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    proof = db.query(ProofDocument).filter(
        ProofDocument.id == data.proof_id,
        ProofDocument.candidate_id == profile.id,
    ).first()
    if not proof or not proof.test_assigned:
        raise HTTPException(status_code=400, detail="No test assigned for this proof")

    test_type = get_test_type_for_category(data.domain)
    questions = get_questions(test_type)

    attempt = TestAttempt(
        candidate_id=profile.id,
        proof_id=proof.id,
        test_type=test_type,
        questions=questions,
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    safe_questions = [{"id": q["id"], "question": q["question"], "options": q["options"]} for q in questions]
    return {"attempt_id": str(attempt.id), "test_type": test_type, "questions": safe_questions}

@router.post("/submit")
def submit_test(
    data: SubmitTestRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    attempt = db.query(TestAttempt).filter(
        TestAttempt.id == data.attempt_id,
        TestAttempt.candidate_id == profile.id,
    ).first()
    if not attempt:
        raise HTTPException(status_code=404, detail="Test attempt not found")

    result = evaluate_answers(attempt.questions, data.answers)
    attempt.answers = data.answers
    attempt.score = result["score"]
    attempt.passed = result["passed"]
    attempt.completed_at = datetime.utcnow()
    db.commit()

    if result["passed"]:
        # Mark the proof as verified
        if attempt.proof_id:
            proof = db.query(ProofDocument).filter(ProofDocument.id == attempt.proof_id).first()
            if proof:
                proof.status = ProofStatus.verified
                db.commit()

        # Set test_verified status
        profile.verification_status = VerificationStatus.test_verified
        db.commit()

        # Also run full verification check to potentially upgrade to verified
        from app.api.candidates import _update_verification_status
        _update_verification_status(profile, db)

    return {
        "score": result["score"],
        "passed": result["passed"],
        "correct": result["correct"],
        "total": result["total"],
        "verification_status": profile.verification_status,
        "message": "Test passed! Claim verified." if result["passed"] else f"Test failed ({result['score']:.0f}%). You can retry.",
    }

@router.get("/my-attempts")
def get_my_attempts(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Get all test attempts for the current candidate."""
    profile = db.query(CandidateProfile).filter(CandidateProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    attempts = db.query(TestAttempt).filter(
        TestAttempt.candidate_id == profile.id
    ).order_by(TestAttempt.started_at.desc()).all()

    return [
        {
            "id": str(a.id),
            "proof_id": str(a.proof_id) if a.proof_id else None,
            "test_type": a.test_type,
            "score": a.score,
            "passed": a.passed,
            "started_at": a.started_at,
            "completed_at": a.completed_at,
        }
        for a in attempts
    ]

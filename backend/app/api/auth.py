from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import User, UserRole
from app.services.otp_service import generate_otp, otp_expiry, send_otp_email

router = APIRouter()

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: UserRole

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

@router.post("/register", status_code=201)
async def register(data: RegisterRequest, db: Session = Depends(get_db)):
    email_lower = data.email.lower()
    if db.query(User).filter(User.email == email_lower).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    otp = generate_otp()
    user = User(
        email=email_lower,
        hashed_password=hash_password(data.password),
        role=data.role,
        is_verified=False,
        otp=otp,
        otp_expires_at=otp_expiry(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    try:
        await send_otp_email(email_lower, otp)
        email_sent = True
    except Exception as e:
        email_sent = False
        print(f"[EMAIL ERROR] {type(e).__name__}: {e}")

    response = {
        "message": "Registration successful. Check your email for the OTP.",
        "user_id": str(user.id),
        "role": user.role,
    }
    if not email_sent:
        response["dev_otp"] = otp  # fallback if email fails
    return response

@router.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    email_lower = data.email.lower()
    user = db.query(User).filter(User.email == email_lower).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Already verified. Please login."}
    if not user.otp or user.otp != data.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")

    user.is_verified = True
    user.otp = None
    user.otp_expires_at = None
    db.commit()

    return {"message": "Email verified successfully. You can now login."}

@router.post("/resend-otp")
async def resend_otp(data: ResendOTPRequest, db: Session = Depends(get_db)):
    email_lower = data.email.lower()
    user = db.query(User).filter(User.email == email_lower).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        raise HTTPException(status_code=400, detail="Already verified")

    otp = generate_otp()
    user.otp = otp
    user.otp_expires_at = otp_expiry()
    db.commit()

    try:
        await send_otp_email(email_lower, otp)
        return {"message": "New OTP sent to your email."}
    except Exception as e:
        print(f"[EMAIL ERROR] {type(e).__name__}: {e}")
        # Return success with fallback dev_otp if email fails
        return {"message": "Failed to send email. Check fallback OTP.", "dev_otp": otp}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    email_lower = data.email.lower()
    user = db.query(User).filter(User.email == email_lower).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified. Check your inbox for the OTP.")

    token = create_access_token({"sub": str(user.id), "role": user.role})
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": str(user.id),
    }

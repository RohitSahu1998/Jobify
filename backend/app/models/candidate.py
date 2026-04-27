from sqlalchemy import Column, Integer, String, Float, Enum, ForeignKey, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid
from app.core.database import Base

class VerificationStatus(str, enum.Enum):
    unverified = "unverified"
    verified = "verified"
    test_verified = "test_verified"

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    location = Column(String)
    college = Column(String)
    degree = Column(String)
    graduation_year = Column(Integer)
    resume_path = Column(String)
    parsed_resume = Column(JSON)
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.unverified)
    profile_completeness = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="candidate_profile")
    proofs = relationship("ProofDocument", back_populates="candidate")
    test_attempts = relationship("TestAttempt", back_populates="candidate")
    scores = relationship("CandidateScore", back_populates="candidate")

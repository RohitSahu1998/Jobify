from sqlalchemy import Column, String, Enum, ForeignKey, DateTime, Float, JSON, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid
from app.core.database import Base

class TestType(str, enum.Enum):
    coding = "coding"
    mcq_case = "mcq_case"
    mcq_numerical = "mcq_numerical"
    aptitude = "aptitude"

class TestAttempt(Base):
    __tablename__ = "test_attempts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id"))
    proof_id = Column(UUID(as_uuid=True), ForeignKey("proof_documents.id"), nullable=True)
    test_type = Column(Enum(TestType), nullable=False)
    questions = Column(JSON)
    answers = Column(JSON)
    score = Column(Float)
    passed = Column(Boolean, default=False)
    pass_threshold = Column(Float, default=60.0)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    candidate = relationship("CandidateProfile", back_populates="test_attempts")

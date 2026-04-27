from sqlalchemy import Column, Float, ForeignKey, DateTime, String, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class CandidateScore(Base):
    __tablename__ = "candidate_scores"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id"))
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"))

    skills_match = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    test_score = Column(Float, default=0.0)
    education_score = Column(Float, default=0.0)
    completeness_score = Column(Float, default=0.0)

    final_score = Column(Float, default=0.0)
    label = Column(String)
    is_visible = Column(Boolean, default=False)
    calculated_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("CandidateProfile", back_populates="scores")
    job = relationship("Job", back_populates="scores")

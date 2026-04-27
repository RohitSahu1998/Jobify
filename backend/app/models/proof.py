from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
import uuid
from app.core.database import Base

class ProofCategory(str, enum.Enum):
    internship = "internship"
    work_experience = "work_experience"
    certification = "certification"
    education = "education"
    skill = "skill"

class ProofStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"
    no_proof = "no_proof"

class ProofDocument(Base):
    __tablename__ = "proof_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey("candidate_profiles.id"))
    category = Column(Enum(ProofCategory), nullable=False)
    claim_text = Column(Text)
    file_path = Column(String)
    ocr_extracted = Column(Text)
    status = Column(Enum(ProofStatus), default=ProofStatus.pending)
    no_proof_selected = Column(Boolean, default=False)
    test_assigned = Column(Boolean, default=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("CandidateProfile", back_populates="proofs")

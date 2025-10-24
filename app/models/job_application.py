from sqlalchemy import (
    Column, Integer, String, Text, Enum, Index
)
from enum import Enum as PyEnum
from app.core.database import Base
from sqlalchemy import DateTime, func

class JobStage(PyEnum):
    APPLIED = "APPLIED"
    UNDER_REVIEW = "UNDER_REVIEW"
    OA = "OA"
    INTERVIEW = "INTERVIEW"
    OFFER = "OFFER"

class JobDecision(PyEnum):
    PENDING = "PENDING"
    REJECTED = "REJECTED"
    OFFER_ACCEPTED = "OFFER_ACCEPTED"
    WITHDRAWN = "WITHDRAWN"

class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False)
    role_title = Column(String(200), nullable=False)
    location = Column(String(200), nullable=True)
    source = Column(String(200), nullable=True)
    apply_url = Column(String(500), nullable=True)

    stage = Column(
        Enum(JobStage, native_enum=False, length=32),
        nullable=False,
        default=JobStage.APPLIED,
    )
    decision = Column(
        Enum(JobDecision, native_enum=False, length=32),
        nullable=False,
        default=JobDecision.PENDING,
    )

    priority = Column(Integer, nullable=False, default=3)  # 1..5

    notes = Column(Text, nullable=True)

    applied_at = Column(DateTime(timezone=True), nullable=True)
    last_status_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_job_apps_stage", "stage"),
        Index("ix_job_apps_decision", "decision"),
        Index("ix_job_apps_last_status_at_desc", "last_status_at"),
    )

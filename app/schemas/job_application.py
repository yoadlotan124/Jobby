from pydantic import BaseModel, HttpUrl, Field, field_validator
from typing import Optional
from datetime import datetime
from app.models.job_application import JobStage, JobDecision

class TransitionUpdate(BaseModel):
    stage: Optional[JobStage] = None
    decision: Optional[JobDecision] = None
    note: Optional[str] = None

class JobBase(BaseModel):
    company_name: str = Field(..., min_length=1, max_length=200)
    role_title: str = Field(..., min_length=1, max_length=200)
    location: Optional[str] = Field(None, max_length=200)
    source: Optional[str] = Field(None, max_length=200)
    apply_url: Optional[HttpUrl] = None
    stage: JobStage = JobStage.APPLIED
    decision: JobDecision = JobDecision.PENDING
    priority: int = Field(3, ge=1, le=5)
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None
    last_status_at: Optional[datetime] = None

    @field_validator("company_name", "role_title")
    @classmethod
    def trim_nonempty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("must not be empty")
        return v

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    location: Optional[str] = None
    source: Optional[str] = None
    apply_url: Optional[HttpUrl] = None
    stage: Optional[JobStage] = None
    decision: Optional[JobDecision] = None
    priority: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None
    last_status_at: Optional[datetime] = None

class JobApplicationRead(JobBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

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
    apply_url: Optional[str] = Field(None, max_length=500)  # <- was HttpUrl
    stage: JobStage = JobStage.APPLIED
    decision: JobDecision = JobDecision.PENDING
    priority: int = Field(3, ge=1, le=5)
    notes: Optional[str] = None
    applied_at: Optional[datetime] = None
    last_status_at: Optional[datetime] = None

    @field_validator("company_name", "role_title", mode="before")
    @classmethod
    def trim_nonempty(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("must not be empty")
        return v

    @field_validator("apply_url", mode="before")
    @classmethod
    def normalize_url(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return None
        v = v.strip()
        if not v:
            return None
        # auto-add https if user pasted 'www.something.com'
        if v.startswith("www."):
            v = "https://" + v
        # reject obviously broken values but keep it lenient
        if " " in v or len(v) > 500:
            raise ValueError("invalid URL")
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

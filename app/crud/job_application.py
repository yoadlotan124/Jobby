from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy.orm import Session
from app.models import job_application as models
from app.schemas import job_application as schemas


# --- CREATE ---
def create_application(db: Session, job: schemas.JobCreate):
    obj = models.JobApplication(**job.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# --- READ ---
def get_applications(db: Session) -> List[models.JobApplication]:
    return db.query(models.JobApplication).order_by(models.JobApplication.last_status_at.desc()).all()


def get_application(db: Session, job_id: int) -> Optional[models.JobApplication]:
    return db.query(models.JobApplication).filter(models.JobApplication.id == job_id).first()


def list_applications(
    db: Session,
    stage: Optional[models.JobStage] = None,
    decision: Optional[models.JobDecision] = None,
    company: Optional[str] = None,
    order_by_recent: bool = True,
) -> List[models.JobApplication]:
    q = db.query(models.JobApplication)
    if stage:
        q = q.filter(models.JobApplication.stage == stage)
    if decision:
        q = q.filter(models.JobApplication.decision == decision)
    if company:
        q = q.filter(models.JobApplication.company_name.ilike(f"%{company}%"))
    if order_by_recent:
        q = q.order_by(models.JobApplication.last_status_at.desc().nullslast())
    return q.all()


# --- UPDATE ---
def update_application(db: Session, job_id: int, job: schemas.JobUpdate) -> Optional[models.JobApplication]:
    obj = get_application(db, job_id)
    if not obj:
        return None

    for key, value in job.model_dump(exclude_unset=True).items():
        setattr(obj, key, value)

    db.commit()
    db.refresh(obj)
    return obj


# --- DELETE ---
def delete_application(db: Session, job_id: int) -> Optional[models.JobApplication]:
    obj = get_application(db, job_id)
    if not obj:
        return None
    db.delete(obj)
    db.commit()
    return obj


# --- TRANSITION (stage/decision changes) ---
def transition_application(db: Session, app_id: int, tr: schemas.TransitionUpdate):
    obj = get_application(db, app_id)
    if not obj:
        return None

    changed = False

    if tr.stage is not None and tr.stage != obj.stage:
        obj.stage = tr.stage
        changed = True
    if tr.decision is not None and tr.decision != obj.decision:
        obj.decision = tr.decision
        changed = True

    if tr.note:
        stamp = datetime.now(timezone.utc).isoformat(timespec="seconds")
        note_text = f"[{stamp}] {tr.note.strip()}"
        obj.notes = (obj.notes or "") + f"\n{note_text}"

    if changed:
        obj.last_status_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(obj)
    return obj

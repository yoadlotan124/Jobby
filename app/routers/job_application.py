from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.crud.job_application import (
    get_applications,
    create_application,
    update_application,
    delete_application,
)
from app.schemas.job_application import JobCreate, JobUpdate, JobApplicationRead

router = APIRouter(prefix="/applications", tags=["Applications"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=list[JobApplicationRead])
def read_applications(db: Session = Depends(get_db)):
    return get_applications(db)


@router.post("/", response_model=JobApplicationRead, status_code=201)
def create_app(application: JobCreate, db: Session = Depends(get_db)):
    return create_application(db, application)


@router.put("/{application_id}", response_model=JobApplicationRead)
def update_app(application_id: int, application: JobUpdate, db: Session = Depends(get_db)):
    updated = update_application(db, application_id, application)
    if not updated:
        raise HTTPException(status_code=404, detail="Application not found")
    return updated


@router.delete("/{application_id}", status_code=204)
def delete_app(application_id: int, db: Session = Depends(get_db)):
    deleted = delete_application(db, application_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Application not found")
    return

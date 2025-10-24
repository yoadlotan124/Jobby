# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import job_application

app = FastAPI(title="Jobby API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,   # e.g. ["http://localhost:5174"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(job_application.router)

@app.get("/health")
def health():
    return {"ok": True}

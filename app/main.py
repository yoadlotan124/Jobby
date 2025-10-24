from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import job_application
from app.core.database import Base, engine

app = FastAPI(title=settings.APP_NAME)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables if they don’t exist
Base.metadata.create_all(bind=engine)

# Register your routers
app.include_router(job_application.router)

@app.get("/")
def root():
    return {"message": "Jobby API running 🚀"}

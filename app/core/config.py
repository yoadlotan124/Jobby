from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Jobby"
    DATABASE_URL: str = "sqlite:///./data/jobby.db"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"

settings = Settings()

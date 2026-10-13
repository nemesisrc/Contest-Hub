from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "ContestHub"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/contesthub"
    SYNC_DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/contesthub"
    REDIS_URL: str = "redis://localhost:6379/0"
    JWT_SECRET: str = "contesthub-jwt-secret-key-production-ready"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    CODEFORCES_API_URL: str = "https://codeforces.com/api"
    SYNC_INTERVAL_MINUTES: int = 15

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

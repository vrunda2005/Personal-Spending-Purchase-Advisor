from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Personal Spending & Purchase Advisor"
    API_V1_STR: str = "/api"
    
    # Database configuration (Defaults to Docker Compose PG service)
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/advisor"
    
    # JWT Authentication settings
    SECRET_KEY: str = "3d9b8e8f81f1816e87a2d48d6174a7b7a7dcd2b3b4f6277c0879e6f3b063a5ba"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # AI service integration keys
    GEMINI_API_KEY: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

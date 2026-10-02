import os
from pathlib import Path
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "PATHAI Backend Service"
    PROJECT_DESCRIPTION: str = (
        "Backend API for PATHAI career guidance and reflection platform. "
        "Adheres to the core principle: AI provides explanation and reflection, "
        "system does not decide the user's future."
    )
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database: Default to async SQLite for out-of-the-box zero-setup execution,
    # and supports postgresql+asyncpg://... for PostgreSQL production deployments.
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./pathai.db",
    )

    # CORS configuration
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
        ]

    # Form & System defaults
    DEFAULT_FORM_VERSION: str = "v0.9.1"
    DATA_DIR: Path = Path(__file__).resolve().parent / "data"
    QUESTIONS_FILE_PATH: str = str(
        Path(__file__).resolve().parent / "data" / "questions.json"
    )

    # Engine and Session options
    DB_ECHO: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

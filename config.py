"""RankEngine AI - Application Configuration.

Production-ready settings management using Pydantic Settings (Pydantic v2).
Handles environment variables, PostgreSQL async connection string generation,
CORS origins, Redis/Celery parameters, and third-party API keys (PageSpeed, LLM).
"""

from functools import lru_cache
from typing import Any, List, Optional
from pydantic import (
    Field,
    PostgresDsn,
    RedisDsn,
    field_validator,
    model_validator,
)
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Core application settings and environment variable parser."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # --------------------------------------------------------------------------
    # General Application Settings
    # --------------------------------------------------------------------------
    PROJECT_NAME: str = Field(default="RankEngine AI", description="Application display name")
    VERSION: str = Field(default="1.0.0", description="API semantic version")
    DESCRIPTION: str = Field(
        default="AI-Powered SERP & Local GBP Competitor Audit Engine for SMBs",
        description="Application description",
    )
    API_V1_PREFIX: str = Field(default="/api/v1", description="Prefix for V1 REST endpoints")
    ENVIRONMENT: str = Field(default="development", description="Environment: development, staging, production")
    DEBUG: bool = Field(default=False, description="Enable debug logging and SQLAlchemy echo")

    # --------------------------------------------------------------------------
    # CORS & Security
    # --------------------------------------------------------------------------
    SECRET_KEY: str = Field(
        default="rankengine-default-insecure-secret-key-change-in-production-min32char",
        description="JWT and encryption secret key",
    )
    CORS_ORIGINS: List[str] = Field(
        default=[
            "http://localhost",
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:8000",
            "https://app.rankengine.ai",
        ],
        description="List of allowed CORS origins",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        """Support comma-separated strings or existing lists from env vars."""
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return [str(i) for i in v]
        return v

    # --------------------------------------------------------------------------
    # Database Settings (PostgreSQL Async)
    # --------------------------------------------------------------------------
    POSTGRES_SERVER: str = Field(default="localhost", description="PostgreSQL host")
    POSTGRES_PORT: int = Field(default=5432, description="PostgreSQL port")
    POSTGRES_USER: str = Field(default="postgres", description="PostgreSQL username")
    POSTGRES_PASSWORD: str = Field(default="postgres", description="PostgreSQL password")
    POSTGRES_DB: str = Field(default="rankengine_db", description="PostgreSQL database name")
    DATABASE_URL: Optional[str] = Field(
        default=None,
        description="Async database connection string (postgresql+asyncpg://...)",
    )

    # Connection Pool Settings
    DB_POOL_SIZE: int = Field(default=20, description="SQLAlchemy connection pool size")
    DB_MAX_OVERFLOW: int = Field(default=10, description="SQLAlchemy maximum overflow connections")
    DB_POOL_RECYCLE_SECONDS: int = Field(default=1800, description="Connection recycling interval in seconds")
    DB_POOL_PRE_PING: bool = Field(default=True, description="Verify connection liveness before checkout")

    @model_validator(mode="after")
    def assemble_db_connection(self) -> "Settings":
        """Assemble DATABASE_URL if not explicitly set."""
        if not self.DATABASE_URL:
            self.DATABASE_URL = (
                f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@"
                f"{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
            )
        elif self.DATABASE_URL.startswith("postgresql://"):
            # Ensure asyncpg dialect is used
            self.DATABASE_URL = self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
        return self

    # --------------------------------------------------------------------------
    # Redis & Task Queue (Celery)
    # --------------------------------------------------------------------------
    REDIS_URL: str = Field(default="redis://localhost:6379/0", description="Redis connection URL")
    CELERY_BROKER_URL: Optional[str] = Field(default=None, description="Celery broker URL")
    CELERY_RESULT_BACKEND: Optional[str] = Field(default=None, description="Celery result backend URL")

    @model_validator(mode="after")
    def assemble_celery_urls(self) -> "Settings":
        """Default Celery URLs to REDIS_URL if not individually specified."""
        if not self.CELERY_BROKER_URL:
            self.CELERY_BROKER_URL = self.REDIS_URL
        if not self.CELERY_RESULT_BACKEND:
            self.CELERY_RESULT_BACKEND = self.REDIS_URL
        return self

    # --------------------------------------------------------------------------
    # External APIs (Google PageSpeed, LLM, Playwright)
    # --------------------------------------------------------------------------
    GOOGLE_PAGESPEED_API_KEY: Optional[str] = Field(
        default=None,
        description="Google Cloud API key for PageSpeed Insights API v5",
    )
    GOOGLE_MAPS_API_KEY: Optional[str] = Field(
        default=None,
        description="Google Places / Maps API key for local GBP enrichment",
    )

    # LLM Settings (OpenAI / DeepSeek / Anthropic compatible endpoint)
    OPENAI_API_KEY: Optional[str] = Field(
        default=None,
        description="API key for LLM action item generation & competitor analysis",
    )
    LLM_MODEL: str = Field(default="gpt-4o", description="Default LLM model identifier")
    LLM_BASE_URL: Optional[str] = Field(default=None, description="Custom LLM API base URL if using proxy/compatible API")
    LLM_TEMPERATURE: float = Field(default=0.2, description="Sampling temperature for deterministic audit output")

    # --------------------------------------------------------------------------
    # Scraping & Audit Defaults
    # --------------------------------------------------------------------------
    PLAYWRIGHT_HEADLESS: bool = Field(default=True, description="Run browser in headless mode")
    PLAYWRIGHT_TIMEOUT_MS: int = Field(default=30000, description="Navigation timeout in milliseconds")
    SERP_TOP_RESULTS_LIMIT: int = Field(default=10, description="Number of SERP results to extract per keyword")
    COMPETITORS_AUDIT_LIMIT: int = Field(default=3, description="Number of top competitors to perform deep audit on")
    USER_AGENT: str = Field(
        default=(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36 RankEngine/1.0"
        ),
        description="HTTP user agent for scraping and requests",
    )


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton instance of application settings."""
    return Settings()


settings = get_settings()

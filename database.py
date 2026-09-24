"""RankEngine AI - Async Database Session & Engine Configuration.

SQLAlchemy 2.0 asyncpg connection pool, declarative base, sessionmaker,
and FastAPI dependency injection for asynchronous database sessions.
"""

import logging
from datetime import datetime
from typing import AsyncGenerator
import uuid

from sqlalchemy import DateTime, Uuid, func, select, text
from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

from config import settings

logger = logging.getLogger("rankengine.database")

# --------------------------------------------------------------------------
# Async Engine & Sessionmaker
# --------------------------------------------------------------------------
engine = create_async_engine(
    url=settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_recycle=settings.DB_POOL_RECYCLE_SECONDS,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# --------------------------------------------------------------------------
# Declarative Base & Core Mixins
# --------------------------------------------------------------------------
class Base(AsyncAttrs, DeclarativeBase):
    """SQLAlchemy 2.0 Base class with async attributes support."""
    pass


class TimestampMixin:
    """Common timestamp mixin for all audit and company entities."""

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        doc="Record creation timestamp (UTC)",
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        doc="Record last update timestamp (UTC)",
    )


class UUIDPrimaryKeyMixin:
    """Primary key mixin using UUIDv4 for secure multi-tenant indexing."""

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
        doc="Unique identifier (UUID v4)",
    )


# --------------------------------------------------------------------------
# FastAPI Dependency & Lifecycle Functions
# --------------------------------------------------------------------------
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency for injecting async database sessions per request.

    Yields:
        AsyncSession: Active database session with automatic commit/rollback.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db() -> None:
    """Initialize database schemas (useful for development and test suites)."""
    async with engine.begin() as conn:
        logger.info("Initializing database tables if not exist...")
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized successfully.")


async def close_db() -> None:
    """Gracefully dispose of database engine connection pools."""
    logger.info("Disposing database connection pool...")
    await engine.dispose()
    logger.info("Database connection pool disposed.")


async def check_db_health() -> bool:
    """Execute a simple query to verify database connection health.

    Returns:
        bool: True if database responds to SELECT 1, False otherwise.
    """
    try:
        async with AsyncSessionLocal() as session:
            await session.execute(text("SELECT 1"))
            return True
    except Exception as exc:
        logger.error(f"Database health check failed: {exc}", exc_info=True)
        return False

"""RankEngine AI - Main Application Entrypoint.

FastAPI application configuration, lifespan management (database pool lifecycle),
CORS policy, exception handlers, and API router assembly.
"""

from contextlib import asynccontextmanager
import logging
import sys
from typing import Any, AsyncGenerator, Dict

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database import check_db_health, close_db, init_db
from routers.actions import router as actions_router
from routers.audits import router as audits_router
from routers.companies import router as companies_router

# --------------------------------------------------------------------------
# Structured Logging Configuration
# --------------------------------------------------------------------------
logging.basicConfig(
    level=logging.DEBUG if settings.DEBUG else logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("rankengine.main")


# --------------------------------------------------------------------------
# Lifespan Context Manager (App Startup & Shutdown)
# --------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Manage application startup and graceful shutdown sequences."""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")

    # In development, ensure database tables exist
    if settings.ENVIRONMENT in ("development", "test"):
        try:
            await init_db()
        except Exception as exc:
            logger.warning(
                f"Automatic DB table creation failed (Database might be initializing): {exc}"
            )

    yield

    logger.info(f"Shutting down {settings.PROJECT_NAME}...")
    await close_db()
    logger.info("Application shutdown complete.")


# --------------------------------------------------------------------------
# FastAPI Application Initialization
# --------------------------------------------------------------------------
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
    lifespan=lifespan,
)


# --------------------------------------------------------------------------
# Middleware (CORS & Security)
# --------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------
# Global Exception Handlers
# --------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all unhandled exceptions to return consistent JSON errors."""
    logger.error(f"Unhandled server error at {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Beklenmeyen bir sunucu hatası oluştu.",
            "error_detail": str(exc) if settings.DEBUG else "Internal Server Error",
        },
    )


# --------------------------------------------------------------------------
# Core Health & System Endpoints
# --------------------------------------------------------------------------
@app.get(
    "/",
    tags=["System"],
    summary="Root service info",
)
async def root_info() -> Dict[str, Any]:
    """Root endpoint verifying API availability and active version."""
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "online",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_PREFIX,
    }


@app.get(
    "/health",
    tags=["System"],
    summary="Health check endpoint with DB probe",
)
async def health_check() -> Dict[str, Any]:
    """Verify application liveness and database connection readiness."""
    db_alive = await check_db_health()
    return {
        "status": "healthy" if db_alive else "degraded",
        "database": "connected" if db_alive else "disconnected",
        "environment": settings.ENVIRONMENT,
        "version": settings.VERSION,
    }


# --------------------------------------------------------------------------
# API V1 Router Registration
# --------------------------------------------------------------------------
app.include_router(companies_router, prefix=settings.API_V1_PREFIX)
app.include_router(audits_router, prefix=settings.API_V1_PREFIX)
app.include_router(actions_router, prefix=settings.API_V1_PREFIX)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )

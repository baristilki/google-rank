"""RankEngine AI - Audits API Router.

Endpoints for triggering, monitoring, and retrieving comprehensive SEO & GBP audit tasks.
"""

from datetime import datetime
from typing import List, Optional
import uuid

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models import AuditStatus, AuditTask, Company
from schemas import (
    AuditTaskCreate,
    AuditTaskDetailResponse,
    AuditTaskResponse,
    StandardResponse,
)
from services.audit_service import AuditPipelineService

router = APIRouter(prefix="/audits", tags=["Audits"])


@router.post(
    "",
    response_model=StandardResponse[AuditTaskResponse],
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger a new SERP & Competitor Audit task",
)
async def create_audit_task(
    payload: AuditTaskCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[AuditTaskResponse]:
    """Enqueue a new asynchronous audit job.

    The background worker will:
    1. Scrape Google SERP for target keywords (top 10 results + Local 3-Pack).
    2. Identify top 3 organic & map competitors.
    3. Audit page speed, Core Web Vitals, metadata, schemas, and GBP ratings.
    4. Call LLM to synthesize actionable, prioritized to-do recommendations.
    """
    # Verify company exists
    company = await db.get(Company, payload.company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Şirket bulunamadı (ID: {payload.company_id}).",
        )

    # Instantiate audit task in PENDING status
    audit_task = AuditTask(
        company_id=payload.company_id,
        status=AuditStatus.PENDING,
        target_keywords=payload.target_keywords,
        trigger_source=payload.trigger_source,
    )
    db.add(audit_task)
    await db.flush()
    await db.refresh(audit_task)

    # Enqueue background execution
    pipeline = AuditPipelineService()
    background_tasks.add_task(pipeline.execute_audit, audit_task.id)

    return StandardResponse(
        success=True,
        message="Denetim görevi sıraya alındı ve arka planda başlatıldı (PENDING -> RUNNING).",
        data=AuditTaskResponse.model_validate(audit_task),
    )


@router.get(
    "/{audit_id}",
    response_model=StandardResponse[AuditTaskDetailResponse],
    summary="Get detailed audit report by ID",
)
async def get_audit_details(
    audit_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[AuditTaskDetailResponse]:
    """Retrieve full audit report including SERP rankings, competitor benchmarks, and generated action items."""
    query = (
        select(AuditTask)
        .where(AuditTask.id == audit_id)
        .options(
            selectinload(AuditTask.company),
            selectinload(AuditTask.serp_results),
            selectinload(AuditTask.competitor_analyses),
            selectinload(AuditTask.action_items),
        )
    )
    result = await db.execute(query)
    audit = result.scalar_one_or_none()

    if not audit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Denetim görevi bulunamadı.",
        )

    return StandardResponse(
        success=True,
        message="Denetim detayları getirildi.",
        data=AuditTaskDetailResponse.model_validate(audit),
    )


@router.get(
    "/company/{company_id}",
    response_model=StandardResponse[List[AuditTaskResponse]],
    summary="List all audit runs for a specific company",
)
async def list_company_audits(
    company_id: uuid.UUID,
    limit: int = Query(default=10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[List[AuditTaskResponse]]:
    """Retrieve audit execution history for a specific company."""
    # Check company existence
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Şirket bulunamadı.",
        )

    query = (
        select(AuditTask)
        .where(AuditTask.company_id == company_id)
        .order_by(AuditTask.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(query)
    audits = result.scalars().all()

    return StandardResponse(
        success=True,
        message=f"{len(audits)} denetim kaydı bulundu.",
        data=[AuditTaskResponse.model_validate(a) for a in audits],
    )


class LiveAuditRequest(BaseModel):
    """Payload for real-time live domain & keyword audit."""
    domain: str
    keyword: str
    company_name: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None


@router.post(
    "/live",
    summary="Execute on-the-fly live audit for any domain & keyword",
)
async def run_live_audit(payload: LiveAuditRequest):
    """Runs immediate real-time SERP scrape, competitor benchmark and AI action generation."""
    from action_generator import ActionGenerator
    from serp_matcher import SERPMatcher

    matcher = SERPMatcher()
    generator = ActionGenerator()

    comp_name = payload.company_name or payload.domain.split(".")[0].title()

    matrix = await matcher.build_comparison_matrix(
        target_url=payload.domain,
        keyword=payload.keyword,
        city=payload.city,
        district=payload.district,
    )

    action_plan = await generator.generate_action_plan(
        matrix=matrix,
        company_name=comp_name,
        company_info={
            "name": comp_name,
            "target_domain": payload.domain,
            "city": payload.city or "İstanbul",
            "district": payload.district or "",
        },
    )

    return {
        "success": True,
        "matrix": matrix.model_dump(),
        "action_plan": action_plan.model_dump(),
    }


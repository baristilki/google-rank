"""RankEngine AI - Action Items (To-Do List) API Router.

Endpoints for managing prioritized recommendations generated for SMB clients to outrank competitors.
"""

from datetime import datetime, timezone
from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import ActionItem, ActionPriority, Company, TaskCategory
from schemas import (
    ActionItemResponse,
    ActionItemUpdate,
    StandardResponse,
)

router = APIRouter(prefix="/actions", tags=["Action Items"])


@router.get(
    "/company/{company_id}",
    response_model=StandardResponse[List[ActionItemResponse]],
    summary="Get actionable to-do list for a company",
)
async def get_company_actions(
    company_id: uuid.UUID,
    is_completed: Optional[bool] = Query(default=None, description="Filter by completion status"),
    priority: Optional[ActionPriority] = Query(default=None, description="Filter by priority (URGENT, HIGH...)"),
    category: Optional[TaskCategory] = Query(default=None, description="Filter by SEO category"),
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[List[ActionItemResponse]]:
    """Retrieve prioritized to-do recommendations tailored to beat SERP & Maps competitors."""
    # Validate company
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Şirket bulunamadı.",
        )

    query = select(ActionItem).where(ActionItem.company_id == company_id)

    if is_completed is not None:
        query = query.where(ActionItem.is_completed == is_completed)
    if priority is not None:
        query = query.where(ActionItem.priority == priority)
    if category is not None:
        query = query.where(ActionItem.category == category)

    # Order by priority weight & creation time
    query = query.order_by(
        ActionItem.is_completed.asc(),
        ActionItem.created_at.desc(),
    )
    result = await db.execute(query)
    actions = result.scalars().all()

    return StandardResponse(
        success=True,
        message=f"{len(actions)} eylem maddesi listelendi.",
        data=[ActionItemResponse.model_validate(a) for a in actions],
    )


@router.get(
    "/{action_id}",
    response_model=StandardResponse[ActionItemResponse],
    summary="Get action item details",
)
async def get_action_item(
    action_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[ActionItemResponse]:
    """Retrieve full details of a specific action item including fix suggestions and benchmarks."""
    action = await db.get(ActionItem, action_id)
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eylem maddesi bulunamadı.",
        )

    return StandardResponse(
        success=True,
        message="Eylem maddesi getirildi.",
        data=ActionItemResponse.model_validate(action),
    )


@router.patch(
    "/{action_id}",
    response_model=StandardResponse[ActionItemResponse],
    summary="Update action item status (complete/uncomplete) or priority",
)
async def update_action_item(
    action_id: uuid.UUID,
    payload: ActionItemUpdate,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[ActionItemResponse]:
    """Mark action items as completed or modify urgency and description."""
    action = await db.get(ActionItem, action_id)
    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Eylem maddesi bulunamadı.",
        )

    update_data = payload.model_dump(exclude_unset=True)

    # Automatically set completed_at timestamp if is_completed toggled
    if "is_completed" in update_data:
        if update_data["is_completed"]:
            action.completed_at = datetime.now(timezone.utc)
        else:
            action.completed_at = None

    for key, value in update_data.items():
        setattr(action, key, value)

    await db.flush()
    await db.refresh(action)

    return StandardResponse(
        success=True,
        message="Eylem maddesi güncellendi.",
        data=ActionItemResponse.model_validate(action),
    )

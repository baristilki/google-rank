"""RankEngine AI - Companies API Router.

Endpoints for managing client businesses and SMB profiles targeting local SERP/GBP rankings.
"""

from typing import List, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Company
from schemas import (
    CompanyCreate,
    CompanyResponse,
    CompanyUpdate,
    PaginatedResponse,
    StandardResponse,
)

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.post(
    "",
    response_model=StandardResponse[CompanyResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Register a new company for SEO tracking",
)
async def create_company(
    payload: CompanyCreate,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[CompanyResponse]:
    """Register a new SMB business to be audited across Google SERP and Google Maps."""
    # Check if domain already registered
    query = select(Company).where(Company.target_domain == payload.target_domain)
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"'{payload.target_domain}' alan adı zaten kayıtlı (ID: {existing.id}).",
        )

    company = Company(**payload.model_dump())
    db.add(company)
    await db.flush()
    await db.refresh(company)

    return StandardResponse(
        success=True,
        message="Şirket başarıyla kaydedildi.",
        data=CompanyResponse.model_validate(company),
    )


@router.get(
    "",
    response_model=PaginatedResponse[CompanyResponse],
    summary="List all registered companies with pagination",
)
async def list_companies(
    page: int = Query(default=1, ge=1, description="Page number"),
    size: int = Query(default=20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(default=None, description="Filter by name, domain, city or category"),
    db: AsyncSession = Depends(get_db),
) -> PaginatedResponse[CompanyResponse]:
    """Retrieve paginated list of companies with optional fuzzy search."""
    base_query = select(Company)

    if search:
        search_filter = f"%{search.strip()}%"
        base_query = base_query.where(
            (Company.name.ilike(search_filter))
            | (Company.target_domain.ilike(search_filter))
            | (Company.city.ilike(search_filter))
            | (Company.primary_category.ilike(search_filter))
        )

    # Total count
    count_query = select(func.count()).select_from(base_query.subquery())
    total_count = (await db.execute(count_query)).scalar_one()

    # Pagination
    offset = (page - 1) * size
    query = base_query.order_by(Company.created_at.desc()).offset(offset).limit(size)
    result = await db.execute(query)
    companies = result.scalars().all()

    total_pages = (total_count + size - 1) // size if total_count > 0 else 0

    return PaginatedResponse(
        items=[CompanyResponse.model_validate(c) for c in companies],
        total=total_count,
        page=page,
        size=size,
        total_pages=total_pages,
    )


@router.get(
    "/{company_id}",
    response_model=StandardResponse[CompanyResponse],
    summary="Get company details by ID",
)
async def get_company(
    company_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[CompanyResponse]:
    """Retrieve a single company profile by UUID."""
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Şirket bulunamadı.",
        )

    return StandardResponse(
        success=True,
        message="Şirket bilgisi getirildi.",
        data=CompanyResponse.model_validate(company),
    )


@router.put(
    "/{company_id}",
    response_model=StandardResponse[CompanyResponse],
    summary="Update company profile",
)
async def update_company(
    company_id: uuid.UUID,
    payload: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[CompanyResponse]:
    """Update company metadata, location, or contact information."""
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Şirket bulunamadı.",
        )

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(company, key, value)

    await db.flush()
    await db.refresh(company)

    return StandardResponse(
        success=True,
        message="Şirket bilgileri güncellendi.",
        data=CompanyResponse.model_validate(company),
    )


@router.delete(
    "/{company_id}",
    response_model=StandardResponse[None],
    summary="Delete company and associated audit history",
)
async def delete_company(
    company_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> StandardResponse[None]:
    """Delete a company record and all its associated audit tasks and action items."""
    company = await db.get(Company, company_id)
    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Şirket bulunamadı.",
        )

    await db.delete(company)
    return StandardResponse(
        success=True,
        message="Şirket ve ilişkili tüm veriler başarıyla silindi.",
        data=None,
    )

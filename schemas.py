"""RankEngine AI - Pydantic v2 Schemas (DTOs & Validation).

Production-grade Pydantic v2 data models for:
- Request validation with custom validators (domain normalization, coordinate bounds).
- Response serialization with ORM mode (from_attributes=True).
- LLM structured output extraction models.
- Paginated & standard API envelope responses.
"""

from datetime import datetime
import re
from typing import Any, Dict, Generic, List, Optional, TypeVar
import uuid

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)

from models import (
    ActionPriority,
    AuditStatus,
    DifficultyLevel,
    ImpactLevel,
    TaskCategory,
)

T = TypeVar("T")


# --------------------------------------------------------------------------
# Helper Validator Functions
# --------------------------------------------------------------------------
def clean_domain(domain_raw: str) -> str:
    """Normalize domain names by stripping protocols, paths, and www prefixes."""
    domain = domain_raw.strip().lower()
    # Strip protocol
    domain = re.sub(r"^https?://", "", domain)
    # Strip path, query params, hash
    domain = domain.split("/")[0].split("?")[0].split("#")[0]
    # Strip port if present
    domain = domain.split(":")[0]
    return domain


# --------------------------------------------------------------------------
# 1. Company Schemas
# --------------------------------------------------------------------------
class CompanyBase(BaseModel):
    """Base schema for Company data."""

    name: str = Field(..., min_length=2, max_length=255, description="Business name")
    target_domain: str = Field(..., min_length=3, max_length=255, description="Target domain URL or hostname")
    primary_category: str = Field(..., min_length=2, max_length=150, description="Main business category")
    city: str = Field(..., min_length=2, max_length=100, description="City / Province")
    district: str = Field(..., min_length=2, max_length=100, description="District / County")
    address: Optional[str] = Field(default=None, description="Full physical address")
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0, description="Latitude")
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0, description="Longitude")
    phone: Optional[str] = Field(default=None, max_length=50, description="Contact phone")
    google_place_id: Optional[str] = Field(default=None, max_length=255, description="Google Maps Place ID")

    @field_validator("target_domain")
    @classmethod
    def validate_domain(cls, v: str) -> str:
        cleaned = clean_domain(v)
        if not cleaned or "." not in cleaned:
            raise ValueError(f"Geçersiz domain formatı: '{v}'. Örnek: 'dishekimiistanbul.com'")
        return cleaned


class CompanyCreate(CompanyBase):
    """Schema for registering a new Company."""
    pass


class CompanyUpdate(BaseModel):
    """Schema for updating an existing Company profile."""

    name: Optional[str] = Field(default=None, min_length=2, max_length=255)
    target_domain: Optional[str] = Field(default=None, min_length=3, max_length=255)
    primary_category: Optional[str] = Field(default=None, min_length=2, max_length=150)
    city: Optional[str] = Field(default=None, min_length=2, max_length=100)
    district: Optional[str] = Field(default=None, min_length=2, max_length=100)
    address: Optional[str] = None
    latitude: Optional[float] = Field(default=None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(default=None, ge=-180.0, le=180.0)
    phone: Optional[str] = None
    google_place_id: Optional[str] = None

    @field_validator("target_domain")
    @classmethod
    def validate_domain(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            return clean_domain(v)
        return v


class CompanyResponse(CompanyBase):
    """Complete serialized Company entity response."""

    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --------------------------------------------------------------------------
# 2. SERPResult Schemas
# --------------------------------------------------------------------------
class SERPResultBase(BaseModel):
    """Base properties of a SERP ranking item."""

    keyword: str = Field(..., description="Query keyword")
    rank_position: int = Field(..., ge=1, le=100, description="Rank position (1-100)")
    url: str = Field(..., description="Target webpage URL")
    domain: str = Field(..., description="Extracted domain")
    title: str = Field(..., description="SERP Title tag")
    snippet: Optional[str] = Field(default=None, description="SERP description snippet")
    has_map_pack: bool = Field(default=False, description="Google Local 3-Pack presence")
    map_pack_rank: Optional[int] = Field(default=None, ge=1, le=3, description="Rank in Local 3-Pack")
    is_target_company: bool = Field(default=False, description="Whether this belongs to the audited company")
    raw_serp_features: Optional[Dict[str, Any]] = Field(default=None, description="Extra SERP features")


class SERPResultCreate(SERPResultBase):
    """Schema for persisting a SERP result row."""

    audit_task_id: uuid.UUID


class SERPResultResponse(SERPResultBase):
    """Serialized SERP result item."""

    id: uuid.UUID
    audit_task_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --------------------------------------------------------------------------
# 3. CompetitorAnalysis Schemas
# --------------------------------------------------------------------------
class CompetitorAnalysisBase(BaseModel):
    """Base schema for technical and GBP competitor metrics."""

    competitor_domain: str = Field(..., description="Analyzed domain")
    is_target_domain: bool = Field(default=False, description="True if target client website")
    rank_position: Optional[int] = Field(default=None, description="Average or highest SERP rank")

    # Performance
    speed_mobile_score: Optional[int] = Field(default=None, ge=0, le=100, description="Mobile PageSpeed (0-100)")
    speed_desktop_score: Optional[int] = Field(default=None, ge=0, le=100, description="Desktop PageSpeed (0-100)")
    core_web_vitals: Optional[Dict[str, Any]] = Field(default=None, description="LCP, INP, CLS details")

    # On-Page & Schema
    meta_title: Optional[str] = Field(default=None, description="HTML Title")
    meta_description: Optional[str] = Field(default=None, description="HTML Meta Description")
    word_count: Optional[int] = Field(default=None, ge=0, description="Body content word count")
    headings_structure: Optional[Dict[str, Any]] = Field(default=None, description="H1, H2, H3 breakdown")
    schema_types: Optional[List[str]] = Field(default=None, description="Detected Schema.org types")

    # Google Business Profile
    gbp_rating: Optional[float] = Field(default=None, ge=0.0, le=5.0, description="Google Maps star rating (0-5)")
    gbp_review_count: Optional[int] = Field(default=None, ge=0, description="Total Google reviews")
    gbp_attributes: Optional[Dict[str, Any]] = Field(default=None, description="Attributes (hours, verified, photos)")
    raw_metrics: Optional[Dict[str, Any]] = Field(default=None, description="Raw audit telemetry")


class CompetitorAnalysisCreate(CompetitorAnalysisBase):
    """Schema for persisting competitor audit metrics."""

    audit_task_id: uuid.UUID


class CompetitorAnalysisResponse(CompetitorAnalysisBase):
    """Serialized competitor analysis entity."""

    id: uuid.UUID
    audit_task_id: uuid.UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --------------------------------------------------------------------------
# 4. ActionItem Schemas (Eylem Planı / Görevler)
# --------------------------------------------------------------------------
class ActionItemBase(BaseModel):
    """Base schema for actionable to-do recommendations."""

    title: str = Field(..., min_length=5, max_length=255, description="Action title")
    description: str = Field(..., min_length=10, description="Detailed actionable explanation")
    category: TaskCategory = Field(..., description="Action area")
    impact: ImpactLevel = Field(..., description="Ranking impact")
    difficulty: DifficultyLevel = Field(..., description="Effort required")
    priority: ActionPriority = Field(default=ActionPriority.MEDIUM, description="Calculated priority")
    suggested_fix: Optional[str] = Field(default=None, description="Ready-to-use snippet, JSON-LD, or tag")
    competitor_benchmark: Optional[Dict[str, Any]] = Field(default=None, description="Comparative gap data")


class ActionItemCreate(ActionItemBase):
    """Schema for creating an action item."""

    audit_task_id: uuid.UUID
    company_id: uuid.UUID


class ActionItemUpdate(BaseModel):
    """Schema for updating action item status or priority."""

    is_completed: Optional[bool] = Field(default=None, description="Toggle completion status")
    priority: Optional[ActionPriority] = Field(default=None, description="Update priority")
    title: Optional[str] = Field(default=None, min_length=5, max_length=255)
    description: Optional[str] = Field(default=None, min_length=10)


class ActionItemResponse(ActionItemBase):
    """Serialized ActionItem entity."""

    id: uuid.UUID
    audit_task_id: uuid.UUID
    company_id: uuid.UUID
    is_completed: bool
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --------------------------------------------------------------------------
# 5. AuditTask Schemas
# --------------------------------------------------------------------------
class AuditTaskCreate(BaseModel):
    """Request payload to initiate a new audit task."""

    company_id: uuid.UUID = Field(..., description="ID of Company to audit")
    target_keywords: List[str] = Field(
        ...,
        min_length=1,
        max_length=20,
        description="Target search keywords (e.g. ['kadıköy diş hekimi', 'implant kadıköy'])",
    )
    trigger_source: str = Field(default="MANUAL", description="Audit source: MANUAL, API, CRON")

    @field_validator("target_keywords")
    @classmethod
    def sanitize_keywords(cls, keywords: List[str]) -> List[str]:
        cleaned = [k.strip() for k in keywords if k.strip()]
        if not cleaned:
            raise ValueError("En az bir geçerli anahtar kelime belirtilmelidir.")
        # Deduplicate while preserving order
        return list(dict.fromkeys(cleaned))


class AuditTaskResponse(BaseModel):
    """High-level audit task summary response."""

    id: uuid.UUID
    company_id: uuid.UUID
    status: AuditStatus
    target_keywords: List[str]
    trigger_source: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuditTaskDetailResponse(AuditTaskResponse):
    """Comprehensive audit report containing SERP, Competitors, and Action Items."""

    company: Optional[CompanyResponse] = None
    serp_results: List[SERPResultResponse] = Field(default_factory=list)
    competitor_analyses: List[CompetitorAnalysisResponse] = Field(default_factory=list)
    action_items: List[ActionItemResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# --------------------------------------------------------------------------
# 6. LLM Structured Output Schemas (For Prompt-to-JSON extraction)
# --------------------------------------------------------------------------
class LLMActionItemExtraction(BaseModel):
    """Pydantic schema used for guiding LLM structured JSON output."""

    title: str = Field(..., description="Concise action item headline starting with priority tag")
    description: str = Field(..., description="Clear step-by-step resolution guide for the business")
    category: TaskCategory
    impact: ImpactLevel
    difficulty: DifficultyLevel
    priority: ActionPriority
    suggested_fix: Optional[str] = Field(
        default=None,
        description="Concrete copy-paste code snippet, schema JSON-LD, or meta tag",
    )
    competitor_benchmark: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Summary of metric comparison (e.g. {'target_speed': 34, 'competitor_avg_speed': 85})",
    )


class LLMAuditReportExtraction(BaseModel):
    """Full structured extraction schema returned by LLM analysis agent."""

    executive_summary: str = Field(..., description="High-level audit assessment of client's SERP position")
    key_weaknesses: List[str] = Field(..., description="Top 3-5 technical or local SEO vulnerabilities")
    action_items: List[LLMActionItemExtraction] = Field(..., description="List of prioritized to-do recommendations")


# --------------------------------------------------------------------------
# 7. Standard & Paginated API Envelope Responses
# --------------------------------------------------------------------------
class StandardResponse(BaseModel, Generic[T]):
    """Standard unified API envelope."""

    success: bool = Field(default=True, description="Request success indicator")
    message: str = Field(default="Operation completed successfully", description="Status message")
    data: Optional[T] = Field(default=None, description="Payload data")


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated data list response."""

    items: List[T] = Field(default_factory=list, description="Page items")
    total: int = Field(..., ge=0, description="Total count of items matching query")
    page: int = Field(..., ge=1, description="Current page number")
    size: int = Field(..., ge=1, le=100, description="Page size limit")
    total_pages: int = Field(..., ge=0, description="Total pages available")

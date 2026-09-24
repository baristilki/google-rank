"""RankEngine AI - Database Models.

PostgreSQL SQLAlchemy 2.0 async ORM models representing:
- Company: Local SMB business entity and location profile.
- AuditTask: Asynchronous SERP & Competitor audit job run.
- SERPResult: Top 10 organic SERP rankings and Local Map Pack indicators.
- CompetitorAnalysis: Deep technical & GBP audit benchmarks (target vs top 3 competitors).
- ActionItem: AI-extracted, prioritized, actionable to-do list items.
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional
import uuid

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    Uuid,
    asc,
    desc,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base, TimestampMixin


# --------------------------------------------------------------------------
# Enumerations for Enforced State & Categorization
# --------------------------------------------------------------------------
class AuditStatus(str, Enum):
    """Execution status of an SEO/GBP audit task."""

    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class ActionPriority(str, Enum):
    """Urgency level of recommended SEO action."""

    URGENT = "URGENT"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ImpactLevel(str, Enum):
    """Expected ranking impact upon resolution."""

    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class DifficultyLevel(str, Enum):
    """Implementation complexity of the recommendation."""

    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class TaskCategory(str, Enum):
    """Operational area of the action recommendation."""

    LOCAL_GBP = "LOCAL_GBP"
    TECHNICAL_SEO = "TECHNICAL_SEO"
    ON_PAGE_SEO = "ON_PAGE_SEO"
    CONTENT = "CONTENT"
    BACKLINKS = "BACKLINKS"


# --------------------------------------------------------------------------
# 1. Company Model (İşletme / Müşteri)
# --------------------------------------------------------------------------
class Company(Base, TimestampMixin):
    """Company profile representing a local SMB targeting local search rankings."""

    __tablename__ = "companies"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        doc="Unique company identifier (UUID v4)",
    )
    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Official business name",
    )
    target_domain: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Target website domain (e.g. kadikoydishekimi.com)",
    )
    primary_category: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
        index=True,
        doc="Primary business category (e.g. Diş Kliniği, Tesisatçı, Avukat)",
    )

    # Location Information (Local SEO & Google Maps context)
    city: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        doc="Province / City (e.g. İstanbul, Ankara)",
    )
    district: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
        doc="County / District (e.g. Kadıköy, Çankaya)",
    )
    address: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Full street address of the local business",
    )
    latitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Geographic latitude coordinate",
    )
    longitude: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Geographic longitude coordinate",
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        doc="Business contact phone number",
    )
    google_place_id: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        index=True,
        doc="Google Place ID for Google Business Profile (GBP) synchronization",
    )

    # Relationships
    audit_tasks: Mapped[List["AuditTask"]] = relationship(
        "AuditTask",
        back_populates="company",
        cascade="all, delete-orphan",
        order_by=lambda: desc(AuditTask.created_at),
    )
    action_items: Mapped[List["ActionItem"]] = relationship(
        "ActionItem",
        back_populates="company",
        cascade="all, delete-orphan",
        order_by=lambda: desc(ActionItem.created_at),
    )

    def __repr__(self) -> str:
        return f"<Company id={self.id} name='{self.name}' domain='{self.target_domain}' city='{self.city}/{self.district}'>"


# --------------------------------------------------------------------------
# 2. AuditTask Model (Tarama / Denetim Görevi)
# --------------------------------------------------------------------------
class AuditTask(Base, TimestampMixin):
    """Background asynchronous audit task aggregating SERP, technical & GBP checks."""

    __tablename__ = "audit_tasks"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        doc="Unique audit task identifier",
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Foreign key reference to audited Company",
    )
    status: Mapped[AuditStatus] = mapped_column(
        String(50),
        default=AuditStatus.PENDING,
        nullable=False,
        index=True,
        doc="Audit progress status: PENDING, RUNNING, COMPLETED, FAILED",
    )
    target_keywords: Mapped[List[str]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=False,
        default=list,
        doc="List of target SERP search queries (e.g. ['kadıköy implant diş', 'en iyi diş hekimi kadıköy'])",
    )
    trigger_source: Mapped[str] = mapped_column(
        String(50),
        default="MANUAL",
        nullable=False,
        doc="Audit initiator: MANUAL, CRON, API",
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="Timestamp when worker began processing",
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="Timestamp when all audit steps finalized",
    )
    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Failure details if status is FAILED",
    )

    # Relationships
    company: Mapped["Company"] = relationship("Company", back_populates="audit_tasks")
    serp_results: Mapped[List["SERPResult"]] = relationship(
        "SERPResult",
        back_populates="audit_task",
        cascade="all, delete-orphan",
        order_by=lambda: asc(SERPResult.rank_position),
    )
    competitor_analyses: Mapped[List["CompetitorAnalysis"]] = relationship(
        "CompetitorAnalysis",
        back_populates="audit_task",
        cascade="all, delete-orphan",
    )
    action_items: Mapped[List["ActionItem"]] = relationship(
        "ActionItem",
        back_populates="audit_task",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<AuditTask id={self.id} company_id={self.company_id} status='{self.status}'>"


# --------------------------------------------------------------------------
# 3. SERPResult Model (Arama Sonuçları - İlk 10 & Harita Paketi)
# --------------------------------------------------------------------------
class SERPResult(Base, TimestampMixin):
    """SERP organic rankings, snippet metadata, and Local 3-Pack presence."""

    __tablename__ = "serp_results"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        doc="Unique SERP ranking record identifier",
    )
    audit_task_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("audit_tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Associated audit task ID",
    )
    keyword: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Target search term evaluated",
    )
    rank_position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        doc="Organic SERP rank (1 to 10+)",
    )
    url: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="Full destination URL of ranking page",
    )
    domain: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Extracted root/sub-domain for competitor grouping",
    )
    title: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="SERP headline title tag",
    )
    snippet: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Search result snippet / meta description text",
    )
    has_map_pack: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        doc="Whether Google Local 3-Pack appeared in SERP for this keyword",
    )
    map_pack_rank: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="Position in Google Local Pack if detected (1, 2, or 3)",
    )
    is_target_company: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        doc="True if this result belongs to our audited company domain",
    )
    raw_serp_features: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
        doc="Additional SERP features (people also ask, sitelinks, local pack names)",
    )

    # Relationships
    audit_task: Mapped["AuditTask"] = relationship("AuditTask", back_populates="serp_results")

    __table_args__ = (
        Index("ix_serp_audit_keyword_rank", "audit_task_id", "keyword", "rank_position"),
    )

    def __repr__(self) -> str:
        return f"<SERPResult #{self.rank_position} domain='{self.domain}' keyword='{self.keyword}'>"


# --------------------------------------------------------------------------
# 4. CompetitorAnalysis Model (Hedef Site vs İlk 3 Rakip Teknik/GBP Kıyas)
# --------------------------------------------------------------------------
class CompetitorAnalysis(Base, TimestampMixin):
    """Deep technical SEO, Core Web Vitals, and GBP comparison metrics."""

    __tablename__ = "competitor_analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        doc="Unique competitor analysis metric identifier",
    )
    audit_task_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("audit_tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Associated audit task ID",
    )
    competitor_domain: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        doc="Domain analyzed (target domain or competitor)",
    )
    is_target_domain: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        doc="True if this row represents the client company's site",
    )
    rank_position: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="Organic or Map rank position achieved by this competitor",
    )

    # PageSpeed & Performance Metrics
    speed_mobile_score: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="Google PageSpeed Insights mobile performance score (0-100)",
    )
    speed_desktop_score: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="Google PageSpeed Insights desktop performance score (0-100)",
    )
    core_web_vitals: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
        doc="Core Web Vitals metrics: LCP, INP, CLS values and ratings",
    )

    # On-Page & Technical Metrics
    meta_title: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Extracted HTML title tag",
    )
    meta_description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Extracted HTML meta description",
    )
    word_count: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="Visible body text word count",
    )
    headings_structure: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
        doc="Heading distribution: {'h1': ['...'], 'h2_count': 5, 'h3_count': 8}",
    )
    schema_types: Mapped[Optional[List[str]]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
        doc="Detected JSON-LD and Microdata schema types (e.g. ['LocalBusiness', 'MedicalClinic', 'FAQPage'])",
    )

    # Google Business Profile (GBP) & Local Reputation
    gbp_rating: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
        doc="Google Business Profile review score (e.g. 4.9)",
    )
    gbp_review_count: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        doc="Total number of Google reviews",
    )
    gbp_attributes: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
        doc="GBP metadata: verified, business hours, photo count, recent post activity",
    )

    # Raw metrics for future extensions
    raw_metrics: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
        doc="Raw audit output payload for extensibility",
    )

    # Relationships
    audit_task: Mapped["AuditTask"] = relationship("AuditTask", back_populates="competitor_analyses")

    def __repr__(self) -> str:
        return (
            f"<CompetitorAnalysis domain='{self.competitor_domain}' "
            f"target={self.is_target_domain} mobile_speed={self.speed_mobile_score}>"
        )


# --------------------------------------------------------------------------
# 5. ActionItem Model (İşletmeye Atanacak Öncelikli Somut Görevler)
# --------------------------------------------------------------------------
class ActionItem(Base, TimestampMixin):
    """Prioritized, actionable recommendation generated by LLM audit intelligence."""

    __tablename__ = "action_items"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        doc="Unique action item identifier",
    )
    audit_task_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("audit_tasks.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Audit task that generated this action item",
    )
    company_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        doc="Company this task is assigned to",
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        doc="Short action title (e.g. 'Acil: LocalBusiness ve Dentist Schema İşaretlemesi Ekleyin')",
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
        doc="Detailed explanation of why this is hurting rankings and how to resolve it",
    )
    category: Mapped[TaskCategory] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        doc="Category: LOCAL_GBP, TECHNICAL_SEO, ON_PAGE_SEO, CONTENT, BACKLINKS",
    )
    impact: Mapped[ImpactLevel] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        doc="Expected ranking boost: HIGH, MEDIUM, LOW",
    )
    difficulty: Mapped[DifficultyLevel] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        doc="Implementation effort: EASY, MEDIUM, HARD",
    )
    priority: Mapped[ActionPriority] = mapped_column(
        String(50),
        default=ActionPriority.MEDIUM,
        nullable=False,
        index=True,
        doc="Computed priority: URGENT, HIGH, MEDIUM, LOW",
    )

    # Status tracking
    is_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        index=True,
        doc="Whether the SMB owner/developer has marked this task as completed",
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        doc="Timestamp of task completion",
    )

    # Actionable guidance assets
    suggested_fix: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        doc="Ready-to-use code, JSON-LD schema snippet, or recommended meta tag",
    )
    competitor_benchmark: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON().with_variant(JSONB, "postgresql"),
        nullable=True,
        doc="Competitor comparison gap (e.g. {'target_reviews': 12, 'top_competitor_reviews': 140, 'gap': 128})",
    )

    # Relationships
    audit_task: Mapped["AuditTask"] = relationship("AuditTask", back_populates="action_items")
    company: Mapped["Company"] = relationship("Company", back_populates="action_items")

    __table_args__ = (
        Index("ix_action_company_priority_completed", "company_id", "priority", "is_completed"),
    )

    def __repr__(self) -> str:
        return f"<ActionItem id={self.id} priority='{self.priority}' title='{self.title[:30]}...'>"

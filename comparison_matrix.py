"""RankEngine AI - Standard ComparisonMatrix Model.

Comprehensive Pydantic v2 data structure unifying target website audit metrics,
top 3 organic SERP competitor benchmarks, Local 3-Pack GBP metrics, and gap analysis.
"""

from datetime import datetime, timezone
import json
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


# --------------------------------------------------------------------------
# Benchmark Sub-Models
# --------------------------------------------------------------------------
class SiteMetricBenchmark(BaseModel):
    """Normalized technical and on-page metric profile for a website."""

    domain: str
    url: str
    rank_position: Optional[int] = Field(default=None, description="SERP organic rank position")
    is_target_site: bool = Field(default=False, description="True if audited client company")

    # On-Page & Content
    title: Optional[str] = None
    meta_description: Optional[str] = None
    h1: List[str] = Field(default_factory=list)
    word_count: int = Field(default=0)
    reading_time_minutes: float = Field(default=0.0)
    target_keyword_count: int = Field(default=0, description="Total target query keyword occurrences in body")

    # Schema.org
    has_schema: bool = Field(default=False)
    has_local_business: bool = Field(default=False)
    schema_types: List[str] = Field(default_factory=list)
    missing_recommended_fields: List[str] = Field(default_factory=list)

    # Core Web Vitals & Speed
    mobile_speed_score: Optional[int] = Field(default=None, description="Mobile PageSpeed (0-100)")
    desktop_speed_score: Optional[int] = Field(default=None, description="Desktop PageSpeed (0-100)")
    lcp_display: Optional[str] = Field(default=None, description="Largest Contentful Paint (e.g. '2.4 s')")
    cls_display: Optional[str] = Field(default=None, description="Cumulative Layout Shift (e.g. '0.04')")
    fcp_display: Optional[str] = Field(default=None, description="First Contentful Paint (e.g. '1.5 s')")


class LocalPackBusiness(BaseModel):
    """Google Local 3-Pack (Maps) business profile representation."""

    name: str
    rank_position: int = Field(..., ge=1, le=3, description="Local Pack rank (1, 2, or 3)")
    rating: float = Field(default=0.0, ge=0.0, le=5.0, description="Star rating (0-5)")
    review_count: int = Field(default=0, ge=0, description="Total count of Google reviews")
    category: Optional[str] = Field(default=None, description="GBP primary category")
    address: Optional[str] = Field(default=None, description="Business address or neighborhood")
    phone: Optional[str] = None
    website_url: Optional[str] = None
    is_target_company: bool = Field(default=False)


class GapAnalysis(BaseModel):
    """Comparative gap metrics between target client website and top competitors."""

    # Speed Gap
    mobile_speed_gap: int = Field(
        default=0,
        description="Target Mobile score minus Competitors Average (negative means target is slower)",
    )
    desktop_speed_gap: int = Field(default=0)

    # Content Volume Gap
    target_word_count: int = Field(default=0)
    competitors_avg_word_count: int = Field(default=0)
    word_count_gap: int = Field(
        default=0,
        description="Target words minus Competitors average words (negative means target lacks content)",
    )

    # Schema Gaps
    missing_schemas: List[str] = Field(
        default_factory=list,
        description="Schema types present in competitors but missing in target",
    )
    target_has_local_business: bool = Field(default=False)
    competitors_with_local_business_count: int = Field(default=0)

    # Google Business Profile Gaps
    target_reviews: int = Field(default=0)
    local_pack_leader_reviews: int = Field(default=0)
    review_gap: int = Field(
        default=0,
        description="Target reviews minus top Local Pack competitor reviews",
    )
    rating_gap: float = Field(default=0.0)

    # Executive Bullet Points
    critical_findings: List[str] = Field(
        default_factory=list,
        description="Key diagnostic findings highlighting reasons for lagging rankings",
    )


# --------------------------------------------------------------------------
# Root Comparison Matrix
# --------------------------------------------------------------------------
class ComparisonMatrix(BaseModel):
    """The master comparison matrix unifying all audit data for LLM action extraction."""

    keyword: str
    city: Optional[str] = None
    district: Optional[str] = None
    analyzed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    target_site: SiteMetricBenchmark
    organic_competitors: List[SiteMetricBenchmark] = Field(
        default_factory=list,
        max_length=5,
        description="Top 3 organic SERP competitors",
    )
    local_pack_competitors: List[LocalPackBusiness] = Field(
        default_factory=list,
        max_length=3,
        description="Top 3 Google Maps Local Pack businesses",
    )
    gap_analysis: GapAnalysis

    model_config = ConfigDict(from_attributes=True)

    def to_llm_prompt_summary(self) -> str:
        """Generate a dense, formatted markdown string optimized for LLM prompt context."""
        comp_speed_avg = (
            sum(c.mobile_speed_score or 0 for c in self.organic_competitors) // len(self.organic_competitors)
            if self.organic_competitors
            else 0
        )
        comp_word_avg = (
            sum(c.word_count for c in self.organic_competitors) // len(self.organic_competitors)
            if self.organic_competitors
            else 0
        )

        lines = [
            f"### Hedef Sorgu: '{self.keyword}' ({self.city or ''}/{self.district or ''})",
            "",
            "#### 1. Hedef Site (Müşterimiz) vs Organik İlk 3 Rakip Kıyası:",
            f"- **Hedef Site ({self.target_site.domain})**: Mobil Hız: {self.target_site.mobile_speed_score or 'N/A'}/100, "
            f"Kelime Sayısı: {self.target_site.word_count}, LocalBusiness Schema: {'VAR' if self.target_site.has_local_business else 'YOK'}",
            f"- **Rakipler Ortalaması**: Mobil Hız: {comp_speed_avg}/100, Kelime Sayısı: {comp_word_avg}",
        ]

        for i, comp in enumerate(self.organic_competitors, start=1):
            lines.append(
                f"  - **Rakip #{i} ({comp.domain})**: Sıra: #{comp.rank_position}, "
                f"Mobil Hız: {comp.mobile_speed_score or 'N/A'}, Kelime: {comp.word_count}, "
                f"Schema: {', '.join(comp.schema_types) if comp.schema_types else 'Yok'}"
            )

        lines.append("")
        lines.append("#### 2. Google Haritalar (Local 3-Pack) Kıyası:")
        for pack in self.local_pack_competitors:
            lines.append(
                f"  - **Harita #{pack.rank_position} - {pack.name}**: Puan: {pack.rating} ⭐, "
                f"Yorum: {pack.review_count}, Kategori: {pack.category or 'Belirtilmemiş'}"
            )

        lines.append("")
        lines.append("#### 3. Tespit Edilen Kritik Boşluklar (Gaps):")
        for finding in self.gap_analysis.critical_findings:
            lines.append(f"- {finding}")

        return "\n".join(lines)

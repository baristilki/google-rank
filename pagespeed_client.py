"""RankEngine AI - Google PageSpeed Insights API v5 Client.

Asynchronously retrieves Mobile & Desktop Core Web Vitals (LCP, CLS, FCP, INP, TBT)
and Lighthouse performance scores with robust retry, timeout, and graceful fallback handling.
"""

import asyncio
import logging
from typing import Any, Dict, Optional
from urllib.parse import urlencode

import httpx
from pydantic import BaseModel, ConfigDict, Field

from config import settings

logger = logging.getLogger("rankengine.pagespeed")

GOOGLE_PAGESPEED_API_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"


# --------------------------------------------------------------------------
# PageSpeed Metric Models
# --------------------------------------------------------------------------
class MetricScore(BaseModel):
    """Core Web Vitals single metric representation."""

    name: str = Field(description="Metric acronym (e.g. LCP, CLS, FCP)")
    display_value: str = Field(default="N/A", description="Human-readable value (e.g. '2.4 s')")
    numeric_value: float = Field(default=0.0, description="Raw metric value in ms or score")
    rating: str = Field(
        default="UNKNOWN",
        description="Rating assessment: GOOD, NEEDS_IMPROVEMENT, POOR",
    )


class DeviceSpeedAudit(BaseModel):
    """Audit output for a specific device strategy (Mobile or Desktop)."""

    strategy: str = Field(description="mobile or desktop")
    performance_score: Optional[int] = Field(
        default=None,
        ge=0,
        le=100,
        description="Lighthouse overall performance score (0-100)",
    )
    # Core Web Vitals & Key Timings
    lcp: Optional[MetricScore] = None  # Largest Contentful Paint
    fcp: Optional[MetricScore] = None  # First Contentful Paint
    cls: Optional[MetricScore] = None  # Cumulative Layout Shift
    tbt: Optional[MetricScore] = None  # Total Blocking Time
    speed_index: Optional[MetricScore] = None
    inp: Optional[MetricScore] = None  # Interaction to Next Paint (Crux)

    opportunities: list[Dict[str, Any]] = Field(
        default_factory=list,
        description="Top performance optimization recommendations",
    )
    is_fallback: bool = Field(
        default=False,
        description="True if metrics were simulated or API was unreachable",
    )
    error_message: Optional[str] = None


class PageSpeedReport(BaseModel):
    """Combined Mobile and Desktop PageSpeed audit report."""

    target_url: str
    mobile: DeviceSpeedAudit
    desktop: DeviceSpeedAudit
    audit_completed: bool = True

    model_config = ConfigDict(from_attributes=True)


# --------------------------------------------------------------------------
# Google PageSpeed Client
# --------------------------------------------------------------------------
class PageSpeedClient:
    """Production client for Google PageSpeed Insights API v5."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        timeout_seconds: float = 45.0,
        max_retries: int = 2,
    ) -> None:
        self.api_key = api_key or settings.GOOGLE_PAGESPEED_API_KEY
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries

    def _determine_rating(self, metric: str, value: float) -> str:
        """Evaluate Core Web Vitals thresholds according to Google Web Vitals spec."""
        m = metric.upper()
        if m == "LCP":  # Largest Contentful Paint (ms)
            if value <= 2500:
                return "GOOD"
            elif value <= 4000:
                return "NEEDS_IMPROVEMENT"
            return "POOR"
        elif m == "FCP":  # First Contentful Paint (ms)
            if value <= 1800:
                return "GOOD"
            elif value <= 3000:
                return "NEEDS_IMPROVEMENT"
            return "POOR"
        elif m == "CLS":  # Cumulative Layout Shift (unitless score)
            if value <= 0.1:
                return "GOOD"
            elif value <= 0.25:
                return "NEEDS_IMPROVEMENT"
            return "POOR"
        elif m == "TBT":  # Total Blocking Time (ms)
            if value <= 200:
                return "GOOD"
            elif value <= 600:
                return "NEEDS_IMPROVEMENT"
            return "POOR"
        return "UNKNOWN"

    def _parse_device_response(self, strategy: str, data: Dict[str, Any]) -> DeviceSpeedAudit:
        """Parse raw Lighthouse JSON payload into clean DeviceSpeedAudit model."""
        lighthouse = data.get("lighthouseResult", {})
        categories = lighthouse.get("categories", {})
        perf_category = categories.get("performance", {})
        raw_score = perf_category.get("score")
        perf_score = int(round(raw_score * 100)) if raw_score is not None else None

        audits = lighthouse.get("audits", {})

        def extract_metric(audit_key: str, metric_name: str) -> Optional[MetricScore]:
            item = audits.get(audit_key)
            if not item:
                return None
            num_val = float(item.get("numericValue", 0.0))
            disp_val = item.get("displayValue", f"{round(num_val, 2)}")
            rating = self._determine_rating(metric_name, num_val)
            return MetricScore(
                name=metric_name,
                display_value=disp_val,
                numeric_value=round(num_val, 2),
                rating=rating,
            )

        lcp = extract_metric("largest-contentful-paint", "LCP")
        fcp = extract_metric("first-contentful-paint", "FCP")
        cls = extract_metric("cumulative-layout-shift", "CLS")
        tbt = extract_metric("total-blocking-time", "TBT")
        speed_index = extract_metric("speed-index", "SpeedIndex")

        # Crux INP if available
        crux = data.get("loadingExperience", {}).get("metrics", {})
        inp_data = crux.get("INTERACTION_TO_NEXT_PAINT")
        inp: Optional[MetricScore] = None
        if inp_data:
            inp_val = float(inp_data.get("percentile", 0.0))
            inp = MetricScore(
                name="INP",
                display_value=f"{int(inp_val)} ms",
                numeric_value=inp_val,
                rating=inp_data.get("category", "UNKNOWN"),
            )

        # Top performance opportunities (render-blocking, unoptimized images, unused JS/CSS)
        opportunities = []
        opportunity_keys = [
            "render-blocking-resources",
            "modern-image-formats",
            "unused-javascript",
            "unused-css-rules",
            "uses-optimized-images",
        ]
        for key in opportunity_keys:
            opp_item = audits.get(key)
            if opp_item and opp_item.get("score", 1.0) < 0.9:
                opportunities.append({
                    "id": key,
                    "title": opp_item.get("title"),
                    "description": opp_item.get("description"),
                    "displayValue": opp_item.get("displayValue"),
                })

        return DeviceSpeedAudit(
            strategy=strategy,
            performance_score=perf_score,
            lcp=lcp,
            fcp=fcp,
            cls=cls,
            tbt=tbt,
            speed_index=speed_index,
            inp=inp,
            opportunities=opportunities[:4],
            is_fallback=False,
        )

    async def _fetch_strategy(
        self,
        client: httpx.AsyncClient,
        url: str,
        strategy: str,
    ) -> DeviceSpeedAudit:
        """Fetch a single strategy (mobile or desktop) with exponential backoff."""
        params: Dict[str, Any] = {
            "url": url,
            "strategy": strategy,
            "category": "performance",
            "locale": "tr",
        }
        if self.api_key:
            params["key"] = self.api_key

        last_error = None
        for attempt in range(self.max_retries + 1):
            try:
                response = await client.get(
                    GOOGLE_PAGESPEED_API_ENDPOINT,
                    params=params,
                    timeout=self.timeout_seconds,
                )
                if response.status_code == 200:
                    data = response.json()
                    return self._parse_device_response(strategy, data)
                elif response.status_code == 429:
                    logger.warning(f"Google PageSpeed rate limit hit (429) for {url}, attempt {attempt + 1}")
                    await asyncio.sleep(2.0 ** (attempt + 1))
                else:
                    logger.error(f"PageSpeed API returned status {response.status_code}: {response.text[:200]}")
                    last_error = f"API Error HTTP {response.status_code}"
            except Exception as exc:
                last_error = str(exc)
                logger.warning(f"PageSpeed request failed (attempt {attempt + 1}): {exc}")
                await asyncio.sleep(1.5 ** attempt)

        # Fallback graceful degradation response if API quota exceeded or unreachable
        logger.warning(f"Using graceful fallback PageSpeed score for {strategy} on {url}")
        return self._generate_fallback_audit(strategy, error_msg=last_error)

    def _generate_fallback_audit(self, strategy: str, error_msg: Optional[str] = None) -> DeviceSpeedAudit:
        """Provide a safe fallback object so the overall competitor audit never terminates unexpectedly."""
        # Conservative baseline estimates when Google API is blocked or without key
        score = 65 if strategy == "mobile" else 80
        return DeviceSpeedAudit(
            strategy=strategy,
            performance_score=score,
            lcp=MetricScore(name="LCP", display_value="~2.8 s", numeric_value=2800.0, rating="NEEDS_IMPROVEMENT"),
            fcp=MetricScore(name="FCP", display_value="~1.7 s", numeric_value=1700.0, rating="GOOD"),
            cls=MetricScore(name="CLS", display_value="0.08", numeric_value=0.08, rating="GOOD"),
            tbt=MetricScore(name="TBT", display_value="~240 ms", numeric_value=240.0, rating="NEEDS_IMPROVEMENT"),
            is_fallback=True,
            error_message=error_msg or "PageSpeed API anahtarı girilmedi veya kota aşıldı (Simüle edilmiş baz metrikler).",
        )

    async def audit_url(self, url: str) -> PageSpeedReport:
        """Concurrently fetch Mobile and Desktop Core Web Vitals for a given target URL."""
        # Ensure scheme
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        async with httpx.AsyncClient() as client:
            mobile_task = self._fetch_strategy(client, url, strategy="mobile")
            desktop_task = self._fetch_strategy(client, url, strategy="desktop")

            mobile_res, desktop_res = await asyncio.gather(mobile_task, desktop_task)

            return PageSpeedReport(
                target_url=url,
                mobile=mobile_res,
                desktop=desktop_res,
                audit_completed=True,
            )

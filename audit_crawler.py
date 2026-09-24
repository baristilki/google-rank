"""RankEngine AI - Audit Crawler Module.

High-performance asynchronous webpage crawler and on-page SEO analyzer.
- Primary fetch: Fast asynchronous HTTP client (httpx) with custom headers, redirects, and retries.
- Fallback fetch: Headless Playwright browser for JavaScript-heavy client-rendered SPAs.
- On-page extraction: Title, Meta Description, Canonical URL, OpenGraph tags, H1-H3 hierarchy.
- Schema.org audit: Parses application/ld+json blocks and validates LocalBusiness guidelines.
- Content analysis: Word count, reading time, and target keyword frequency/density calculation.
"""

import asyncio
from datetime import datetime, timezone
import json
import logging
import re
from typing import Any, Dict, List, Optional, Set
from urllib.parse import urljoin, urlparse

from bs4 import BeautifulSoup
import httpx
from pydantic import BaseModel, ConfigDict, Field

from config import settings

logger = logging.getLogger("rankengine.crawler")


# --------------------------------------------------------------------------
# Data Models (Pydantic v2)
# --------------------------------------------------------------------------
class HeadingStructure(BaseModel):
    """Hierarchical breakdown of headings on the page."""

    h1: List[str] = Field(default_factory=list, description="All H1 heading texts")
    h2: List[str] = Field(default_factory=list, description="All H2 heading texts")
    h3: List[str] = Field(default_factory=list, description="All H3 heading texts")
    h1_count: int = Field(default=0, description="Total H1 tags found")
    h2_count: int = Field(default=0, description="Total H2 tags found")
    h3_count: int = Field(default=0, description="Total H3 tags found")


class SchemaAuditReport(BaseModel):
    """Detailed validation report of Schema.org / JSON-LD structured data."""

    has_json_ld: bool = Field(default=False, description="Whether any JSON-LD was detected")
    detected_types: List[str] = Field(default_factory=list, description="Schema types discovered")
    raw_schemas: List[Dict[str, Any]] = Field(default_factory=list, description="Extracted JSON-LD objects")
    has_local_business: bool = Field(
        default=False,
        description="Whether a LocalBusiness or subtype (Dentist, Store, Clinic...) exists",
    )
    detected_local_business_type: Optional[str] = Field(
        default=None,
        description="Specific LocalBusiness subtype detected",
    )
    present_fields: List[str] = Field(default_factory=list, description="Fields populated in LocalBusiness schema")
    missing_recommended_fields: List[str] = Field(
        default_factory=list,
        description="Missing essential fields (e.g. address, telephone, geo, openingHours)",
    )
    validation_warnings: List[str] = Field(default_factory=list, description="Schema syntax or validation warnings")


class KeywordOccurrence(BaseModel):
    """Keyword frequency and presence analysis across page elements."""

    keyword: str
    count_in_body: int = Field(default=0)
    density_percent: float = Field(default=0.0)
    in_title: bool = Field(default=False)
    in_meta_description: bool = Field(default=False)
    in_h1: bool = Field(default=False)
    in_h2: bool = Field(default=False)


class ContentAnalysisReport(BaseModel):
    """Content volume, readability, and keyword density report."""

    word_count: int = Field(default=0, description="Total count of visible words in body")
    character_count: int = Field(default=0, description="Total visible character count")
    estimated_reading_time_minutes: float = Field(default=0.0, description="Estimated reading time in minutes")
    top_frequent_words: Dict[str, int] = Field(
        default_factory=dict,
        description="Most frequent significant words (stopwords filtered)",
    )
    target_keyword_analysis: List[KeywordOccurrence] = Field(
        default_factory=list,
        description="Analysis for specific target search keywords",
    )


class PageAuditResult(BaseModel):
    """Complete technical and on-page SEO audit result for a single URL."""

    url: str
    final_url: str = Field(description="Final destination URL after any HTTP redirects")
    status_code: int = Field(default=200)
    load_time_seconds: float = Field(default=0.0)
    rendered_with_js: bool = Field(default=False, description="True if Playwright headless browser was required")

    # Metadata & Hierarchy
    title: Optional[str] = None
    meta_description: Optional[str] = None
    canonical_url: Optional[str] = None
    open_graph: Dict[str, str] = Field(default_factory=dict)
    headings: HeadingStructure = Field(default_factory=HeadingStructure)

    # Deep Audit Sections
    schema_report: SchemaAuditReport = Field(default_factory=SchemaAuditReport)
    content_report: ContentAnalysisReport = Field(default_factory=ContentAnalysisReport)

    crawled_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    error: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# --------------------------------------------------------------------------
# Turkish & English Stopwords for Content Filtering
# --------------------------------------------------------------------------
COMMON_STOPWORDS: Set[str] = {
    "ve", "ile", "bir", "bu", "şu", "o", "de", "da", "için", "gibi", "kadar", "olan",
    "en", "daha", "çok", "var", "yok", "ise", "ama", "fakat", "lakin", "ancak", "veya",
    "ya", "çünkü", "hem", "ne", "biz", "siz", "onlar", "ben", "sen", "her", "bütün",
    "tüm", "şey", "sonra", "önce", "kendi", "olarak", "the", "and", "or", "in", "on",
    "at", "to", "for", "with", "is", "are", "a", "an", "of", "by", "from", "about",
}

# Standard recommended fields for Google LocalBusiness Rich Results
LOCAL_BUSINESS_RECOMMENDED_FIELDS = [
    "name",
    "address",
    "telephone",
    "geo",
    "openingHoursSpecification",
    "image",
    "url",
    "priceRange",
]

LOCAL_BUSINESS_SUBTYPES = {
    "localbusiness", "dentist", "medicalbusiness", "physician", "hospital",
    "legalbusiness", "attorney", "autorepair", "autodealer", "plumber", "electrician",
    "hvacbusiness", "restaurant", "cafeorcoffeeshop", "bakery", "barorpub",
    "hotel", "beautyandbeautysalon", "hairsalon", "healthandbeautybusiness",
    "realestateagent", "financialservice", "professionalservice", "store",
}


# --------------------------------------------------------------------------
# AuditCrawler Engine
# --------------------------------------------------------------------------
class AuditCrawler:
    """Production-grade asynchronous web scraper and SEO parser."""

    def __init__(
        self,
        timeout_seconds: float = 20.0,
        max_retries: int = 2,
        user_agent: Optional[str] = None,
    ) -> None:
        self.timeout_seconds = timeout_seconds
        self.max_retries = max_retries
        self.user_agent = user_agent or settings.USER_AGENT
        self.headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
            "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124"',
            "Sec-Ch-Ua-Mobile": "?0",
            "Sec-Ch-Ua-Platform": '"Windows"',
            "Upgrade-Insecure-Requests": "1",
        }

    async def fetch_html_httpx(self, url: str) -> tuple[str, str, int, float]:
        """Fetch webpage HTML using high-speed async HTTP client with retries.

        Returns:
            tuple[html_content, final_url, status_code, elapsed_seconds]
        """
        start_time = asyncio.get_event_loop().time()
        transport = httpx.AsyncHTTPTransport(retries=self.max_retries)

        async with httpx.AsyncClient(
            headers=self.headers,
            timeout=self.timeout_seconds,
            follow_redirects=True,
            verify=False,
            transport=transport,
        ) as client:
            response = await client.get(url)
            elapsed = asyncio.get_event_loop().time() - start_time
            return response.text, str(response.url), response.status_code, elapsed

    async def fetch_html_playwright(self, url: str) -> tuple[str, str, int, float]:
        """Fallback browser fetch using headless Playwright for JS-heavy SPAs.

        Returns:
            tuple[html_content, final_url, status_code, elapsed_seconds]
        """
        from playwright.async_api import async_playwright

        start_time = asyncio.get_event_loop().time()
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=settings.PLAYWRIGHT_HEADLESS,
                args=["--no-sandbox", "--disable-dev-shm-usage"],
            )
            context = await browser.new_context(
                user_agent=self.user_agent,
                viewport={"width": 1366, "height": 768},
                locale="tr-TR",
            )
            page = await context.new_page()
            response = await page.goto(
                url,
                timeout=settings.PLAYWRIGHT_TIMEOUT_MS,
                wait_until="domcontentloaded",
            )
            # Allow brief time for hydration/script execution
            await page.wait_for_timeout(1500)
            content = await page.content()
            final_url = page.url
            status_code = response.status if response else 200
            await browser.close()
            elapsed = asyncio.get_event_loop().time() - start_time
            return content, final_url, status_code, elapsed

    async def fetch_page(
        self,
        url: str,
        allow_playwright_fallback: bool = True,
    ) -> tuple[str, str, int, float, bool]:
        """Orchestrates HTTP fetching with smart JavaScript fallback.

        Returns:
            tuple[html, final_url, status_code, elapsed_seconds, rendered_with_js]
        """
        # Ensure scheme
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        try:
            html, final_url, status_code, elapsed = await self.fetch_html_httpx(url)

            # Heuristic to detect empty client-rendered JS apps (React/Vue/Angular root with no content)
            needs_js_fallback = False
            if status_code == 200 and len(html.strip()) < 1500:
                soup = BeautifulSoup(html, "html.parser")
                body_text = soup.get_text().strip()
                if len(body_text.split()) < 30:
                    needs_js_fallback = True

            if needs_js_fallback and allow_playwright_fallback:
                logger.info(f"Page appears JS-rendered. Falling back to Playwright for: {url}")
                try:
                    js_html, js_url, js_status, js_elapsed = await self.fetch_html_playwright(url)
                    return js_html, js_url, js_status, js_elapsed, True
                except Exception as pw_err:
                    logger.warning(f"Playwright fallback failed, using httpx output: {pw_err}")
                    return html, final_url, status_code, elapsed, False

            return html, final_url, status_code, elapsed, False

        except Exception as exc:
            if allow_playwright_fallback:
                logger.info(f"HTTP fetch failed ({exc}), attempting Playwright headless fallback for {url}...")
                try:
                    js_html, js_url, js_status, js_elapsed = await self.fetch_html_playwright(url)
                    return js_html, js_url, js_status, js_elapsed, True
                except Exception as pw_err:
                    logger.error(f"Both HTTP and Playwright failed for {url}: {pw_err}")
                    raise pw_err
            raise exc

    def parse_metadata_and_headings(self, soup: BeautifulSoup) -> tuple[
        Optional[str],
        Optional[str],
        Optional[str],
        Dict[str, str],
        HeadingStructure,
    ]:
        """Extract title, meta description, canonical link, OpenGraph tags, and headings."""
        # Title
        title_tag = soup.find("title")
        title = title_tag.get_text().strip() if title_tag else None

        # Meta Description
        meta_desc = soup.find("meta", attrs={"name": re.compile(r"^description$", re.I)})
        description = meta_desc.get("content", "").strip() if meta_desc and meta_desc.get("content") else None

        # Canonical Link
        canonical_tag = soup.find("link", attrs={"rel": re.compile(r"^canonical$", re.I)})
        canonical_url = canonical_tag.get("href", "").strip() if canonical_tag and canonical_tag.get("href") else None

        # OpenGraph Tags
        open_graph: Dict[str, str] = {}
        for og_tag in soup.find_all("meta", attrs={"property": re.compile(r"^og:", re.I)}):
            prop = og_tag.get("property", "").lower()
            val = og_tag.get("content", "").strip()
            if prop and val:
                open_graph[prop] = val

        # Heading Hierarchy (H1 - H3)
        h1_texts = [h.get_text().strip() for h in soup.find_all("h1") if h.get_text().strip()]
        h2_texts = [h.get_text().strip() for h in soup.find_all("h2") if h.get_text().strip()]
        h3_texts = [h.get_text().strip() for h in soup.find_all("h3") if h.get_text().strip()]

        headings = HeadingStructure(
            h1=h1_texts,
            h2=h2_texts,
            h3=h3_texts,
            h1_count=len(h1_texts),
            h2_count=len(h2_texts),
            h3_count=len(h3_texts),
        )

        return title, description, canonical_url, open_graph, headings

    def audit_schemas(self, soup: BeautifulSoup) -> SchemaAuditReport:
        """Parse application/ld+json and validate Schema.org LocalBusiness compliance."""
        script_tags = soup.find_all("script", attrs={"type": "application/ld+json"})

        if not script_tags:
            return SchemaAuditReport(
                has_json_ld=False,
                missing_recommended_fields=LOCAL_BUSINESS_RECOMMENDED_FIELDS,
                validation_warnings=["Sayfada hiçbir application/ld+json yapılandırılmış veri bloğu bulunamadı."],
            )

        detected_types: List[str] = []
        raw_schemas: List[Dict[str, Any]] = []
        local_business_obj: Optional[Dict[str, Any]] = None
        detected_local_type: Optional[str] = None
        validation_warnings: List[str] = []

        for script in script_tags:
            raw_text = script.string
            if not raw_text or not raw_text.strip():
                continue

            try:
                data = json.loads(raw_text.strip())
            except Exception as json_err:
                validation_warnings.append(f"JSON-LD sözdizimi ayrıştırma hatası: {json_err}")
                continue

            # Handle both single object and @graph array structures
            items = []
            if isinstance(data, dict):
                if "@graph" in data and isinstance(data["@graph"], list):
                    items.extend(data["@graph"])
                else:
                    items.append(data)
            elif isinstance(data, list):
                items.extend(data)

            for item in items:
                if not isinstance(item, dict):
                    continue
                raw_schemas.append(item)
                item_type = item.get("@type")

                # Type can be string or list of strings
                types_list = [item_type] if isinstance(item_type, str) else (item_type if isinstance(item_type, list) else [])
                for t in types_list:
                    if t and t not in detected_types:
                        detected_types.append(t)
                    if t and t.lower() in LOCAL_BUSINESS_SUBTYPES and not local_business_obj:
                        local_business_obj = item
                        detected_local_type = t

        # Analyze LocalBusiness fields
        has_lb = local_business_obj is not None
        present_fields: List[str] = []
        missing_fields: List[str] = []

        if has_lb and local_business_obj:
            for field_name in LOCAL_BUSINESS_RECOMMENDED_FIELDS:
                val = local_business_obj.get(field_name)
                if val:
                    # Deep check for address dictionary
                    if field_name == "address" and isinstance(val, dict):
                        sub_address_fields = ["streetAddress", "addressLocality", "addressRegion"]
                        missing_subs = [sf for sf in sub_address_fields if not val.get(sf)]
                        if missing_subs:
                            validation_warnings.append(
                                f"Adres alanında eksik alt özellikler var: {', '.join(missing_subs)}"
                            )
                    present_fields.append(field_name)
                else:
                    missing_fields.append(field_name)
        else:
            missing_fields = list(LOCAL_BUSINESS_RECOMMENDED_FIELDS)
            validation_warnings.append(
                "Yerel SEO için kritik olan LocalBusiness/Organization Schema.org şeması bulunamadı."
            )

        return SchemaAuditReport(
            has_json_ld=len(raw_schemas) > 0,
            detected_types=detected_types,
            raw_schemas=raw_schemas,
            has_local_business=has_lb,
            detected_local_business_type=detected_local_type,
            present_fields=present_fields,
            missing_recommended_fields=missing_fields,
            validation_warnings=validation_warnings,
        )

    def analyze_content(
        self,
        soup: BeautifulSoup,
        title: Optional[str] = None,
        meta_description: Optional[str] = None,
        headings: Optional[HeadingStructure] = None,
        target_keywords: Optional[List[str]] = None,
    ) -> ContentAnalysisReport:
        """Extract clean body text, word count, and target keyword metrics."""
        # Clone soup to avoid destructive modifications
        clean_soup = BeautifulSoup(str(soup), "html.parser")

        # Strip non-content and layout tags
        for element in clean_soup(["script", "style", "noscript", "svg", "header", "footer", "nav", "aside"]):
            element.decompose()

        # Extract text
        raw_text = clean_soup.get_text(separator=" ", strip=True)
        # Normalize whitespace
        normalized_text = re.sub(r"\s+", " ", raw_text)
        lower_text = normalized_text.lower()

        # Word tokenization (Turkish & Latin alphanumeric support)
        words = re.findall(r"\b[a-zA-ZğüşıöçĞÜŞİÖÇ0-9]{2,}\b", lower_text)
        word_count = len(words)
        character_count = len(normalized_text)
        reading_time = round(word_count / 200.0, 1)  # ~200 WPM

        # Calculate word frequencies (excluding common stopwords)
        word_freq: Dict[str, int] = {}
        for w in words:
            if w not in COMMON_STOPWORDS and not w.isdigit():
                word_freq[w] = word_freq.get(w, 0) + 1

        top_words = dict(sorted(word_freq.items(), key=lambda item: item[1], reverse=True)[:15])

        # Target Keywords Evaluation
        target_analysis: List[KeywordOccurrence] = []
        if target_keywords:
            title_lower = (title or "").lower()
            desc_lower = (meta_description or "").lower()
            all_h1_lower = " ".join([h.lower() for h in (headings.h1 if headings else [])])
            all_h2_lower = " ".join([h.lower() for h in (headings.h2 if headings else [])])

            for kw in target_keywords:
                kw_clean = kw.strip().lower()
                if not kw_clean:
                    continue

                # Count occurrences in body
                matches = len(re.findall(re.escape(kw_clean), lower_text))
                # Density calculation based on total word count
                kw_word_len = len(kw_clean.split())
                density = round(((matches * kw_word_len) / word_count * 100), 2) if word_count > 0 else 0.0

                target_analysis.append(
                    KeywordOccurrence(
                        keyword=kw,
                        count_in_body=matches,
                        density_percent=density,
                        in_title=kw_clean in title_lower,
                        in_meta_description=kw_clean in desc_lower,
                        in_h1=kw_clean in all_h1_lower,
                        in_h2=kw_clean in all_h2_lower,
                    )
                )

        return ContentAnalysisReport(
            word_count=word_count,
            character_count=character_count,
            estimated_reading_time_minutes=reading_time,
            top_frequent_words=top_words,
            target_keyword_analysis=target_analysis,
        )

    async def crawl_url(
        self,
        url: str,
        target_keywords: Optional[List[str]] = None,
        allow_playwright_fallback: bool = True,
    ) -> PageAuditResult:
        """High-level entrypoint: Fetches, extracts, audits, and returns PageAuditResult."""
        try:
            html, final_url, status_code, elapsed, rendered_with_js = await self.fetch_page(
                url=url,
                allow_playwright_fallback=allow_playwright_fallback,
            )

            soup = BeautifulSoup(html, "html.parser")

            title, description, canonical_url, open_graph, headings = self.parse_metadata_and_headings(soup)
            schema_report = self.audit_schemas(soup)
            content_report = self.analyze_content(
                soup=soup,
                title=title,
                meta_description=description,
                headings=headings,
                target_keywords=target_keywords,
            )

            return PageAuditResult(
                url=url,
                final_url=final_url,
                status_code=status_code,
                load_time_seconds=round(elapsed, 3),
                rendered_with_js=rendered_with_js,
                title=title,
                meta_description=description,
                canonical_url=canonical_url,
                open_graph=open_graph,
                headings=headings,
                schema_report=schema_report,
                content_report=content_report,
            )

        except Exception as exc:
            logger.error(f"Audit failed for {url}: {exc}", exc_info=True)
            return PageAuditResult(
                url=url,
                final_url=url,
                status_code=0,
                error=str(exc),
            )

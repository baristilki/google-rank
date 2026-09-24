"""RankEngine AI - AI Action Generator (To-Do & Action Engine).

Transforms raw SEO comparison matrices into prioritized, actionable to-do items
for business owners and technical teams using OpenAI Pydantic Structured Outputs,
domain-tailored Few-Shot prompts, and automatic code/meta generators.
"""

from datetime import datetime, timezone
from enum import Enum
import json
import logging
from typing import Any, Dict, List, Optional
from urllib.parse import urlparse

from openai import AsyncOpenAI
from pydantic import BaseModel, ConfigDict, Field

from comparison_matrix import ComparisonMatrix
from config import settings
from models import ActionPriority, DifficultyLevel, ImpactLevel, TaskCategory

logger = logging.getLogger("rankengine.action_generator")


# --------------------------------------------------------------------------
# Pydantic Output Schemas (Enforced for LLM Structured Output)
# --------------------------------------------------------------------------
class ActionCategoryEnum(str, Enum):
    ON_PAGE = "On-Page"
    LOCAL_GBP = "Local-GBP"
    CONTENT_GAP = "Content-Gap"
    TECHNICAL = "Technical"


class ActionImpactEnum(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class ActionEffortEnum(str, Enum):
    EASY = "EASY"
    MODERATE = "MODERATE"
    HARD = "HARD"


class GeneratedActionItem(BaseModel):
    """Structured action recommendation schema returned by the LLM."""

    category: ActionCategoryEnum = Field(
        ...,
        description="Operational area: On-Page, Local-GBP, Content-Gap, Technical",
    )
    title: str = Field(
        ...,
        min_length=5,
        max_length=150,
        description="Short, unambiguous action headline (e.g. 'Google Haritalar Birincil Kategorisini Güncelle')",
    )
    problem: str = Field(
        ...,
        description="Clear explanation of the deficit relative to top 3 competitors",
    )
    solution_guide: str = Field(
        ...,
        description="Step-by-step resolution instructions for SMB owner or developer",
    )
    impact: ActionImpactEnum = Field(
        ...,
        description="Expected ranking improvement: HIGH, MEDIUM, LOW",
    )
    effort: ActionEffortEnum = Field(
        ...,
        description="Implementation effort: EASY, MODERATE, HARD",
    )
    priority: ActionPriority = Field(
        default=ActionPriority.HIGH,
        description="Overall priority: URGENT, HIGH, MEDIUM, LOW",
    )
    suggested_fix: Optional[str] = Field(
        default=None,
        description="Ready-to-paste code snippet, schema JSON-LD, or recommended copy",
    )
    competitor_benchmark: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Quantitative comparison gap (e.g. {'target': 34, 'competitors_avg': 88})",
    )


class ActionPlanOutput(BaseModel):
    """Complete structured response from the LLM action extraction."""

    executive_summary: str = Field(
        ...,
        description="Executive diagnostic summary explaining why the target site is currently losing to competitors",
    )
    action_items: List[GeneratedActionItem] = Field(
        ...,
        min_length=3,
        description="Prioritized list of concrete to-do tasks",
    )


# --------------------------------------------------------------------------
# Helper Schemas for Automatic Code & Meta Generators
# --------------------------------------------------------------------------
class MetaOption(BaseModel):
    title: str = Field(..., description="Optimized title tag (50-60 chars)")
    description: str = Field(..., description="Optimized meta description (145-160 chars)")
    h1: str = Field(..., description="Optimized H1 heading tag")
    angle: str = Field(..., description="Marketing angle: High-CTR Commercial, Local Authority, Direct Service")


class MetaRecommendations(BaseModel):
    options: List[MetaOption] = Field(default_factory=list)
    competitor_title_insights: List[str] = Field(default_factory=list)


# --------------------------------------------------------------------------
# Few-Shot Prompt Templates
# --------------------------------------------------------------------------
SYSTEM_PROMPT = """Sen kıdemli bir Yerel SEO Mimarı ve B2B SaaS Büyüme Uzmanısın.
Görevin: Bir yerel KOBİ'nin hedef web sitesi ile Google SERP (İlk 3 organik rakip) ve Google Haritalar (Local 3-Pack) rakipleri arasındaki kıyaslama matrisini (`ComparisonMatrix`) analiz etmek.

Hedef: Rakipleri geçmek için gereken adımları genel tavsiyeler ("sitenizi hızlandırın", "içerik ekleyin") yerine, DOĞRUDAN UYGULANABİLİR, SOMUT ve ÖNCELİKLENDİRİLMİŞ Yapılacaklar Listesine (Actionable To-Do List) dönüştürmektir.

Çıktı Kuralları:
1. Kesinlikle verilen Pydantic JSON formatında yanıt ver.
2. `category` şu 4 değerden biri olmalıdır: 'On-Page', 'Local-GBP', 'Content-Gap', 'Technical'.
3. `impact`: HIGH, MEDIUM, LOW.
4. `effort`: EASY, MODERATE, HARD.
5. Görev başlıkları emir kipiyle ve net olmalıdır: "LocalBusiness Schema Ekleyin", "Birincil Harita Kategorisini 'Diş Kliniği' Yapın".
6. `solution_guide` adım adım uygulanabilir olmalıdır (menü isimleri, HTML etiketleri veya uygulanacak strateji).
7. `suggested_fix` alanında kopyalanıp yapıştırılabilecek hazır kod, etiket veya şablon sun.
"""

FEW_SHOT_USER_EXAMPLE = """Hedef Site: kadikoyimplant.com | Kategori: Diş Hekimi | Lokasyon: İstanbul/Kadıköy | Sorgu: 'kadıköy implant diş hekimi'
Hedef Mobil Hız: 38/100, Kelime Sayısı: 420, Schema: YOK, GBP Yorum: 14 (4.1 ⭐)
İlk 3 Rakip:
- Rakip 1: Mobil Hız: 82/100, Kelime: 1.450, Schema: Dentist, LocalBusiness, GBP Yorum: 168 (4.9 ⭐)
- Rakip 2: Mobil Hız: 74/100, Kelime: 1.200, Schema: MedicalClinic, GBP Yorum: 95 (4.8 ⭐)
- Rakip 3: Mobil Hız: 88/100, Kelime: 1.600, Schema: Dentist, GBP Yorum: 130 (4.7 ⭐)
"""

FEW_SHOT_ASSISTANT_EXAMPLE = """{
  "executive_summary": "Hedef site kadikoyimplant.com, ilk 3 rakibe kıyasla ciddi bir teknik hız açığına (-44 puan) ve %230 daha düşük içerik hacmine sahiptir. Ayrıca Schema.org yapılandırılmış verisi bulunmamakta ve Google Haritalar'da lider rakibin 154 yorum gerisindedir.",
  "action_items": [
    {
      "category": "Local-GBP",
      "title": "Google Haritalar İçin Yorum Toplama Kampanyası Başlatın",
      "problem": "Harita lideri rakip 168 yoruma sahipken firmanız 14 yoruma sahiptir. Bu 154 yorumluk fark harita paketinde geride kalmanızın ana nedenidir.",
      "solution_guide": "1. Google İşletme Profilinizden doğrudan 'Yorum iste' kısa bağlantısını (g.page/.../review) alın. 2. Son 3 ayda tedavi gören hastalara SMS veya WhatsApp üzerinden memnuniyet mesajı ile bu bağlantıyı gönderin. 3. İlk hedef olarak 30 gün içinde +25 organik yorum toplayın.",
      "impact": "HIGH",
      "effort": "EASY",
      "priority": "URGENT",
      "suggested_fix": "Merhaba [İsim] Bey/Hanım, kliniğimizdeki tedavinizi tamamladığınız için teşekkür ederiz. Hizmet kalitemizi değerlendirmek için 30 saniyenizi ayırıp deneyiminizi paylaşır mısınız? [GBP_LINK]",
      "competitor_benchmark": {"target_reviews": 14, "competitor_leader_reviews": 168, "gap": -154}
    },
    {
      "category": "Technical",
      "title": "Dentist ve LocalBusiness Schema.org İşaretlemesini Ekleyin",
      "problem": "İlk 3 rakibin tamamında zengin arama sonuçları sağlayan 'Dentist' ve 'LocalBusiness' şeması bulunurken, sitenizde hiçbir yapılandırılmış veri yoktur.",
      "solution_guide": "Aşağıdaki hazır JSON-LD kodunu ana sayfanızın <head> etiketleri arasına ekleyin. Adres, telefon ve koordinat bilgilerini işletmenizle doğrulayın.",
      "impact": "HIGH",
      "effort": "EASY",
      "priority": "URGENT",
      "suggested_fix": "<script type=\"application/ld+json\">{\"@context\": \"https://schema.org\", \"@type\": \"Dentist\", \"name\": \"Kadıköy İmplant\", \"telephone\": \"+902165550000\"}</script>",
      "competitor_benchmark": {"target_has_schema": false, "competitors_with_schema": 3}
    },
    {
      "category": "Content-Gap",
      "title": "İçerik Hacmini Genişletin ve SSS (FAQ) Bölümü Ekleyin",
      "problem": "Rakipler ortalama 1.416 kelimelik kapsamlı rehber içeriğe sahipken, sitenizde sadece 420 kelime bulunmaktadır.",
      "solution_guide": "1. İmplant tedavisi aşamaları, vidalı diş fiyat dinamikleri ve iyileşme süreci hakkında en az 900 kelimelik özgün içerik ekleyin. 2. Sayfa altına 4-5 soruluk sıkça sorulan sorular (FAQ) bloğu yerleştirin.",
      "impact": "HIGH",
      "effort": "MODERATE",
      "priority": "HIGH",
      "suggested_fix": "Önerilen H2 Başlıkları: 'İmplant Tedavisi Nasıl Yapılır?', 'Kadıköy İmplant Fiyatları Nasıl Belirlenir?', 'Tedavi Sonrası Dikkat Edilmesi Gerekenler'",
      "competitor_benchmark": {"target_word_count": 420, "competitor_avg_words": 1416, "gap": -996}
    }
  ]
}"""


# --------------------------------------------------------------------------
# AI Action Generator Service
# --------------------------------------------------------------------------
class ActionGenerator:
    """Core intelligence engine generating prioritized tasks and assets."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        base_url: Optional[str] = None,
    ) -> None:
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.LLM_MODEL
        self.base_url = base_url or settings.LLM_BASE_URL
        self._client: Optional[AsyncOpenAI] = None

    @property
    def client(self) -> Optional[AsyncOpenAI]:
        """Lazy instantiation of AsyncOpenAI client."""
        if self._client is None and self.api_key:
            self._client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.base_url,
            )
        return self._client

    # ----------------------------------------------------------------------
    # 1. Automatic Code Generator: Schema.org LocalBusiness
    # ----------------------------------------------------------------------
    @staticmethod
    def generate_local_business_schema(
        matrix: ComparisonMatrix,
        company_info: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Generates a fully compliant, rich JSON-LD LocalBusiness schema snippet."""
        info = company_info or {}
        target = matrix.target_site

        # Determine best specific schema type
        raw_category = (info.get("primary_category") or "").lower()
        schema_type = "LocalBusiness"
        if "diş" in raw_category or "dentist" in raw_category:
            schema_type = "Dentist"
        elif "sağlık" in raw_category or "klinik" in raw_category or "doktor" in raw_category:
            schema_type = "MedicalClinic"
        elif "oto" in raw_category or "tamir" in raw_category or "servis" in raw_category:
            schema_type = "AutoRepair"
        elif "avukat" in raw_category or "hukuk" in raw_category:
            schema_type = "LegalService"
        elif "tesisat" in raw_category:
            schema_type = "Plumber"
        elif "restoran" in raw_category or "kafe" in raw_category:
            schema_type = "Restaurant"

        name = info.get("name") or (target.title.split("-")[0].strip() if target.title else target.domain)
        url = target.url
        city = info.get("city") or matrix.city or "İstanbul"
        district = info.get("district") or matrix.district or "Kadıköy"
        address = info.get("address") or f"{district}, {city}, Türkiye"
        phone = info.get("phone") or "+90 216 000 0000"
        lat = info.get("latitude") or 40.9900
        lon = info.get("longitude") or 29.0250

        schema_dict = {
            "@context": "https://schema.org",
            "@type": schema_type,
            "name": name,
            "url": url,
            "telephone": phone,
            "priceRange": "$$",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": address,
                "addressLocality": district,
                "addressRegion": city,
                "addressCountry": "TR",
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": lat,
                "longitude": lon,
            },
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    "opens": "09:00",
                    "closes": "19:00",
                }
            ],
        }

        formatted_json = json.dumps(schema_dict, ensure_ascii=False, indent=2)
        return f'<script type="application/ld+json">\n{formatted_json}\n</script>'

    # ----------------------------------------------------------------------
    # 2. Automatic Meta Generator: Optimized Title, Description & H1
    # ----------------------------------------------------------------------
    @staticmethod
    def generate_meta_recommendations(
        matrix: ComparisonMatrix,
        company_name: Optional[str] = None,
    ) -> MetaRecommendations:
        """Generates high-CTR Title, Meta Description, and H1 tags based on competitor patterns."""
        name = company_name or matrix.target_site.domain
        keyword = matrix.keyword.title()
        loc = matrix.district or matrix.city or "Kadıköy"

        competitor_titles = [c.title for c in matrix.organic_competitors if c.title]
        insights = []
        if any("fiyat" in t.lower() for t in competitor_titles):
            insights.append("Rakiplerin başlıklarında 'Fiyat' kelimesi tıklama çekmek için yoğun kullanılıyor.")
        if any("en iyi" in t.lower() for t in competitor_titles):
            insights.append("Rakipler otorite kazanmak için 'En İyi' vurgusu yapıyor.")
        if not insights:
            insights.append("Rakipler lokasyon ve uzmanlık terimlerini başlığın ilk 30 karakterine yerleştirmiş.")

        options = [
            MetaOption(
                angle="High-CTR & Ticari Dönüşüm Odaklı (Fiyat & Randevu Vurgusu)",
                title=f"{loc} {keyword} | Güncel Fiyatlar & Hızlı Randevu - {name}"[:60],
                description=(
                    f"{loc} bölgesinde uzman {keyword.lower()} hizmeti. Şeffaf fiyat politikası, "
                    f"modern teknoloji ve hasta memnuniyeti garantisiyle hemen online randevu alın."
                )[:155],
                h1=f"{loc} {keyword} Hizmetleri ve Tedavi Süreci",
            ),
            MetaOption(
                angle="Yerel Otorite ve Güven Odaklı (Uzmanlık & Tecrübe)",
                title=f"En İyi {loc} {keyword} - Uzman Kadro | {name}"[:60],
                description=(
                    f"15 yılı aşkın tecrübemizle {loc} genelinde en güvenilir {keyword.lower()} çözümleri. "
                    f"Hasta yorumlarımızı ve başarı oranlarımızı inceleyin, sağlığınıza kavuşun."
                )[:155],
                h1=f"Uzman {loc} {keyword} Kliniği",
            ),
            MetaOption(
                angle="Doğrudan Servis ve Lokasyon Netliği",
                title=f"{keyword} {loc} - 7/24 Kesintisiz İletişim | {name}"[:60],
                description=(
                    f"{loc} {keyword.lower()} ihtiyaçlarınız için deneyimli hekimler ve modern cihazlar. "
                    f"Detaylı bilgi, muayene ve danışma için bugün bize ulaşın."
                )[:155],
                h1=f"{loc} {keyword} - Profesyonel Çözümler",
            ),
        ]

        return MetaRecommendations(options=options, competitor_title_insights=insights)

    # ----------------------------------------------------------------------
    # 3. Deterministic Fallback Generator (Rule-based when API key is missing)
    # ----------------------------------------------------------------------
    def _generate_rule_based_plan(
        self,
        matrix: ComparisonMatrix,
        company_name: str,
        company_info: Optional[Dict[str, Any]] = None,
    ) -> ActionPlanOutput:
        """Deterministic high-quality fallback generator mapping quantitative gaps to actions."""
        target = matrix.target_site
        gap = matrix.gap_analysis
        actions: List[GeneratedActionItem] = []

        # 1. LocalBusiness Schema Action
        if not target.has_local_business:
            schema_code = self.generate_local_business_schema(matrix, company_info)
            actions.append(
                GeneratedActionItem(
                    category=ActionCategoryEnum.TECHNICAL,
                    title="Schema.org LocalBusiness Yapılandırılmış Verisini Ekleyin",
                    problem="Sitenizde arama motorlarının firmanızı yerel haritalarla eşleştirmesini sağlayan LocalBusiness şeması eksik.",
                    solution_guide="Aşağıdaki hazır oluşturulmuş JSON-LD kodunu web sitenizin <head> etiketleri arasına yerleştirin.",
                    impact=ActionImpactEnum.HIGH,
                    effort=ActionEffortEnum.EASY,
                    priority=ActionPriority.URGENT,
                    suggested_fix=schema_code,
                    competitor_benchmark={"target_has_schema": False, "competitors_with_schema": gap.competitors_with_local_business_count},
                )
            )

        # 2. Google Business Profile Reviews Action
        if gap.target_reviews == 0:
            actions.append(
                GeneratedActionItem(
                    category=ActionCategoryEnum.LOCAL_GBP,
                    title="Google Haritalar Profilinize İlk Müşteri Yorumlarını Kazandırın",
                    problem=f"Yerel harita lideri {gap.local_pack_leader_reviews} yoruma sahipken firmanızın Google sayfasında henüz hiç yorum bulunmuyor (Açık: {abs(gap.review_gap)} yorum).",
                    solution_guide="Google Haritalar algoritmasında 0 yorumlu bir profille Harita 3'lü Paketi'ne (Local 3-Pack) girmek mümkün değildir. Teslimatı yapılan müşterilere WhatsApp üzerinden hazır mesajı ileterek ilk etapta +15 doğrulanmış yorum toplayın.",
                    impact=ActionImpactEnum.HIGH,
                    effort=ActionEffortEnum.EASY,
                    priority=ActionPriority.URGENT,
                    suggested_fix="Sayın müşterimiz, sizlere sunduğumuz hizmeti değerlendirmeniz bizim için çok kıymetli: [GOOGLE_MAPS_REVIEW_LINK]",
                    competitor_benchmark={"target_reviews": 0, "leader_reviews": gap.local_pack_leader_reviews, "gap": gap.review_gap},
                )
            )
        elif gap.review_gap < -20:
            actions.append(
                GeneratedActionItem(
                    category=ActionCategoryEnum.LOCAL_GBP,
                    title="Google Haritalar İçin Müşteri Yorum Toplama Süreci Başlatın",
                    problem=f"Harita lideri {gap.local_pack_leader_reviews} yoruma sahipken firmanız {gap.target_reviews} yoruma sahip (Fark: {abs(gap.review_gap)}).",
                    solution_guide="Google İşletme Profilinizden 'Yorum iste' kısa linkini alarak hizmet tamamlandıktan sonra müşterilerinize SMS veya WhatsApp ile iletin.",
                    impact=ActionImpactEnum.HIGH,
                    effort=ActionEffortEnum.EASY,
                    priority=ActionPriority.URGENT,
                    suggested_fix="Sayın müşterimiz, sizlere sunduğumuz hizmeti değerlendirmeniz bizim için çok kıymetli: [GOOGLE_MAPS_REVIEW_LINK]",
                    competitor_benchmark={"target_reviews": gap.target_reviews, "leader_reviews": gap.local_pack_leader_reviews, "gap": gap.review_gap},
                )
            )

        # 3. Content Gap Action
        if gap.word_count_gap < -200:
            actions.append(
                GeneratedActionItem(
                    category=ActionCategoryEnum.CONTENT_GAP,
                    title="Sayfa İçerik Hacmini Artırın ve SSS Bölümü Ekleyin",
                    problem=f"Rakipler ortalama {gap.competitors_avg_word_count} kelime barındırırken sitenizde {gap.target_word_count} kelime var (%{round(abs(gap.word_count_gap)/max(gap.competitors_avg_word_count,1)*100)} daha az).",
                    solution_guide="Hedef kelimenizle ilgili en çok merak edilen 4-5 soruyu içeren 'Sıkça Sorulan Sorular' (FAQ) modülü ve detaylı hizmet rehberi ekleyin.",
                    impact=ActionImpactEnum.HIGH,
                    effort=ActionEffortEnum.MODERATE,
                    priority=ActionPriority.HIGH,
                    suggested_fix=f"Eklenecek Başlıklar: '{matrix.keyword} Nedir ve Nasıl Yapılır?', '{matrix.district or ''} {matrix.keyword} Fiyatları', 'Sıkça Sorulan Sorular'",
                    competitor_benchmark={"target_words": gap.target_word_count, "competitors_avg_words": gap.competitors_avg_word_count, "gap": gap.word_count_gap},
                )
            )

        # 4. Meta Optimization Action
        meta_recs = self.generate_meta_recommendations(matrix, company_name)
        opt = meta_recs.options[0]
        actions.append(
            GeneratedActionItem(
                category=ActionCategoryEnum.ON_PAGE,
                title="Title ve Meta Description Etiketlerini CTR Odaklı Güncelleyin",
                problem="Mevcut başlığınız arama sonuçlarında rakipler kadar çekici değil ve kritik arama terimleri başlığın başında yer almıyor.",
                solution_guide="Web sitenizin SEO eklentisinden (Yoast/RankMath veya HTML'den) Title ve Description alanlarını önerilen şablonla değiştirin.",
                impact=ActionImpactEnum.MEDIUM,
                effort=ActionEffortEnum.EASY,
                priority=ActionPriority.HIGH,
                suggested_fix=f"<title>{opt.title}</title>\n<meta name=\"description\" content=\"{opt.description}\">",
                competitor_benchmark={"recommendation": opt.angle},
            )
        )

        # 5. Mobile Speed Action
        if gap.mobile_speed_gap < -15:
            actions.append(
                GeneratedActionItem(
                    category=ActionCategoryEnum.TECHNICAL,
                    title="Mobil Core Web Vitals ve Sayfa Hızını Optimize Edin",
                    problem=f"Mobil hız puanınız ({target.mobile_speed_score or 'N/A'}), rakiplerin ortalamasından ({target.mobile_speed_score or 50 - gap.mobile_speed_gap}) {abs(gap.mobile_speed_gap)} puan geride.",
                    solution_guide="Görselleri WebP formatına dönüştürün, kullanılmayan CSS/JS dosyalarını erteleyin ve tarayıcı önbelleklemesini (browser caching) aktifleştirin.",
                    impact=ActionImpactEnum.HIGH,
                    effort=ActionEffortEnum.HARD,
                    priority=ActionPriority.MEDIUM,
                    suggested_fix="Görseller için lazy-loading ve WebP sıkıştırma uygulayın. LCP süresini 2.5 saniyenin altına çekin.",
                    competitor_benchmark={"mobile_speed_gap": gap.mobile_speed_gap},
                )
            )

        summary = (
            f"{company_name} ({target.domain}), '{matrix.keyword}' sorgusunda incelenen ilk 3 rakibe kıyasla "
            f"özellikle içerik hacminde ({gap.word_count_gap} kelime) ve yerel itibar verilerinde geride kalmaktadır. "
            f"Öncelikli olarak LocalBusiness şemasının ve Google Haritalar yorum stratejisinin devreye alınması önerilir."
        )

        return ActionPlanOutput(
            executive_summary=summary,
            action_items=actions,
        )

    # ----------------------------------------------------------------------
    # 4. High-Level Action Plan Pipeline
    # ----------------------------------------------------------------------
    async def generate_action_plan(
        self,
        matrix: ComparisonMatrix,
        company_name: str,
        company_info: Optional[Dict[str, Any]] = None,
    ) -> ActionPlanOutput:
        """Main entry point: Generates structured action items using LLM or rule-based fallback."""
        # Check if OpenAI client is available
        if not self.client or not self.api_key:
            logger.info("OpenAI API key not configured. Generating rule-based intelligent action plan.")
            return self._generate_rule_based_plan(matrix, company_name, company_info)

        # Construct LLM prompt
        llm_context = matrix.to_llm_prompt_summary()
        company_context = f"Firma Adı: {company_name}\nHedef Domain: {matrix.target_site.domain}\n"

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": FEW_SHOT_USER_EXAMPLE},
            {"role": "assistant", "content": FEW_SHOT_ASSISTANT_EXAMPLE},
            {
                "role": "user",
                "content": f"{company_context}\n{llm_context}\nLütfen bu işletme için rakipleri geçecek somut eylem planını üret.",
            },
        ]

        try:
            # Try OpenAI Pydantic Structured Outputs (v1.30+)
            try:
                completion = await self.client.beta.chat.completions.parse(
                    model=self.model,
                    messages=messages,
                    response_format=ActionPlanOutput,
                    temperature=settings.LLM_TEMPERATURE,
                )
                output = completion.choices[0].message.parsed
                if output:
                    return output
            except (AttributeError, Exception) as parse_err:
                logger.warning(f"Structured outputs .parse failed ({parse_err}), falling back to json_object mode.")

            # Fallback to standard json_object mode
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                response_format={"type": "json_object"},
                temperature=settings.LLM_TEMPERATURE,
            )
            raw_json = response.choices[0].message.content
            return ActionPlanOutput.model_validate_json(raw_json)

        except Exception as exc:
            logger.error(f"LLM API call failed ({exc}). Falling back to rule-based engine.", exc_info=True)
            return self._generate_rule_based_plan(matrix, company_name, company_info)

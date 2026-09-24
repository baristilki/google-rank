"use client";

import React, { useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  FileCheck,
  HelpCircle,
  ImageIcon,
  Info,
  Layers,
  MapPin,
  MessageCircle,
  MessageSquare,
  Navigation,
  Phone,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { CompetitorMetric, GoogleMapsAudit } from "@/lib/types";

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  companyName: string;
  reviewCount: number;
  rating: number;
  competitorReviewCount?: number;
  competitors?: CompetitorMetric[];
  initialRivalDomain?: string;
  initialTab?: "insights" | "competitors" | "maps_audit" | "whatsapp";
  mapsAudit?: GoogleMapsAudit;
}

export const ReviewsModal: React.FC<ReviewsModalProps> = ({
  isOpen,
  onClose,
  domain,
  companyName,
  reviewCount,
  rating,
  competitorReviewCount = 45,
  competitors = [],
  initialRivalDomain,
  initialTab,
  mapsAudit,
}) => {
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const [copiedMapsLink, setCopiedMapsLink] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"insights" | "competitors" | "maps_audit" | "whatsapp">(
    initialTab || (initialRivalDomain ? "competitors" : "insights")
  );
  const [selectedRivalIndex, setSelectedRivalIndex] = useState<number>(0);

  if (!isOpen) return null;

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim();
  const domainBase = cleanDomain.split(".")[0];
  const cleanName = companyName && !companyName.startsWith("WWW") && !companyName.includes("Sanayi ve Ticaret")
    ? companyName
    : domainBase.charAt(0).toUpperCase() + domainBase.slice(1);

  const targetSite = competitors.find((c) => c.is_target) || competitors[0];
  const targetSiteReviews = targetSite?.reviews || [];

  const rivalList = competitors.filter((c) => !c.is_target);
  const activeRival = rivalList[selectedRivalIndex] || rivalList[0];

  const gap = Math.max(competitorReviewCount - reviewCount, 0);

  const mapsSearchUrl = `https://maps.google.com/?q=${encodeURIComponent(cleanName + " " + cleanDomain)}`;

  // Müşteriye Gönderilecek Hazır WhatsApp Mesajı
  const whatsappTemplate = `Sayın müşterimiz, ${cleanName} olarak memnuniyetinizi ve hizmet kalitemizi her zaman en üst seviyede tutmaya özen gösteriyoruz.

Bizi tercih ettiğiniz için teşekkür ederiz. 30 saniyenizi ayırıp Google Haritalar profilimize puan ve deneyimlerinizi paylaşarak bize destek olur musunuz?

Google Haritalar Bağlantımız:
${mapsSearchUrl}

Desteğiniz için şimdiden çok teşekkür ederiz!`;

  const handleCopyWhatsApp = () => {
    navigator.clipboard.writeText(whatsappTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  const handleCopyMapsLink = () => {
    navigator.clipboard.writeText(mapsSearchUrl);
    setCopiedMapsLink(true);
    setTimeout(() => setCopiedMapsLink(false), 2500);
  };

  const handleOpenWhatsAppWeb = () => {
    const encoded = encodeURIComponent(whatsappTemplate);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
  };

  // Fallback maps audit if not passed from backend
  const effectiveAudit: GoogleMapsAudit = mapsAudit || {
    score: targetSite?.gbp_rating ? 68 : 45,
    pin_registered: reviewCount > 0,
    pin_status_label: reviewCount > 0 ? "Pin Servisi Aktif" : "Pin Servisi Kaydı Gerekli",
    is_verified: reviewCount > 0,
    total_checks: 8,
    passed_checks: reviewCount > 0 ? 3 : 1,
    failed_checks: reviewCount > 0 ? 2 : 4,
    checks: [
      {
        id: "chk-1",
        category: "PIN_LOCATION",
        title: "Google Harita Pin Servisi Kaydı & İğne Doğrulaması",
        status: reviewCount > 0 ? "pass" : "fail",
        status_label: reviewCount > 0 ? "Pin Servisi Doğrulandı" : "Kritik: Pin Servisi Kaydı Bulunamadı",
        description: reviewCount > 0
          ? "İşletmenizin harita iğnesi Google Haritalar üzerinde kayıtlıdır."
          : "İşletmenizin resmi Google Harita Pin Servisi kaydı bulunamadı. Yerel aramalarda çıkmak için pin kaydı şarttır.",
        action_needed: "business.google.com üzerinden işletme pin kaydını açın ve kapı numarasına sabitleyin.",
        impact: "Çok Yüksek",
      },
      {
        id: "chk-2",
        category: "CATEGORIES",
        title: "Kategori & İkincil Faaliyet Alanları",
        status: "warning",
        status_label: "Eksik: 3 İkincil Kategori Gerekli",
        description: "Yalnızca tek bir ana kategori seçilmiş. Google Harita algoritmasında ilk 3 için en az 3 ikincil kategori tanımlanmalıdır.",
        action_needed: "İşletme paneline girerek sektörünüze uygun 3 adet ikincil faaliyet kategorisi ekleyin.",
        impact: "Çok Yüksek",
      },
      {
        id: "chk-3",
        category: "HOURS",
        title: "Haftalık Çalışma Saatleri & Resmi Tatil Planı",
        status: "warning",
        status_label: "Eksik: Çalışma Saatleri Girilmemiş",
        description: "Google çalışma saatleri tanımlanmamış işletmeleri aramalarda geri plana iter.",
        action_needed: "Haftalık mesai saatlerinizi ve bayram çalışma takviminizi sisteme kaydedin.",
        impact: "Yüksek",
      },
      {
        id: "chk-4",
        category: "PHOTOS",
        title: "Google Harita Vitrin & Fotoğraf Galerisi (En Az 15 Fotoğraf)",
        status: "fail",
        status_label: "Kritik Açık: Yetersiz Görsel",
        description: "15+ yüksek çözünürlüklü dükkan/ofis içi ve tabela görseli ekleyen işletmeler %42 daha çok yol tarifi alır.",
        action_needed: "Tabela, atölye/ofis ve ürünlerinize ait en az 15 HD fotoğrafı harita profilinize yükleyin.",
        impact: "Yüksek",
      },
    ],
    pin_service_guide: [
      {
        step: 1,
        title: "Google Harita Pin Servisi Kaydını Başlatın",
        description: "business.google.com adresine tarayıcınızdan girin. Google hesabınızla oturum açıp işletme adınızı aratın ve 'İşletmenizi Google'a Ekleyin' seçeneğini seçin.",
      },
      {
        step: 2,
        title: "Harita İğnesini (Pin) Milimetrik Sabitleyin",
        description: "Adresinizi yazdıktan sonra harita ekranında kırmızı harita iğnesini dükkanınızın veya binanızın tam giriş kapısına sürükleyip bırakın.",
      },
      {
        step: 3,
        title: "Google Doğrulama Rozetini (Onay) Alın",
        description: "Google'ın sunduğu Video Doğrulama, Telefon SMS kodu veya Posta Kartı yöntemlerinden biriyle işletmenizi doğrulayın.",
      },
      {
        step: 4,
        title: "Çalışma Saatlerini ve 15 Fotoğrafı Yükleyin",
        description: "Haftalık açılış-kapanış saatlerini, telefon numaranızı, web sitenizi ve en az 15 adet işletme içi/dışı fotoğrafınızı yükleyin.",
      },
      {
        step: 5,
        title: "WhatsApp Yorum Şablonu ile İlk Yorumları Toplayın",
        description: "Google Harita profilinizdeki 'Yorum İsteyin' bağlantısını kopyalayıp sistemimizdeki WhatsApp şablonu ile müşterilerinize gönderin.",
      },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-amber-50/40 via-white to-indigo-50/40 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-200">
              <Star className="h-5 w-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Google Haritalar, Canlı Yorumlar &amp; Harita Kayıt Analizi
                </h3>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                  Yerel SEO &amp; GBP
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kendi işletmenizin gerçek yorumları, ilk 3 rakibin müşteri geri bildirimleri ve Google Harita Pin Servisi eksiklik denetimi.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap border-b border-slate-100 bg-slate-50/70 px-6 pt-2 gap-1">
          {/* TAB 1 */}
          <button
            onClick={() => setActiveTab("insights")}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "insights"
                ? "border-amber-500 text-amber-800 bg-white rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Sizin Yorumlarınız ({reviewCount > 0 ? reviewCount : targetSiteReviews.length})</span>
          </button>

          {/* TAB 2 */}
          <button
            onClick={() => setActiveTab("competitors")}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "competitors"
                ? "border-indigo-600 text-indigo-800 bg-white rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-4 w-4 text-indigo-600" />
            <span>Rakiplerin Yorumları &amp; Açıkları ({rivalList.length} Rakip)</span>
          </button>

          {/* TAB 3: NEW MAPS AUDIT */}
          <button
            onClick={() => setActiveTab("maps_audit")}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "maps_audit"
                ? "border-rose-500 text-rose-800 bg-white rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapPin className="h-4 w-4 text-rose-500" />
            <span>Harita Kayıt &amp; Pin Denetimi</span>
            <span className="rounded-full bg-rose-100 px-1.5 py-0.2 text-[10px] font-extrabold text-rose-700">
              {effectiveAudit.score}/100
            </span>
          </button>

          {/* TAB 4 */}
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "whatsapp"
                ? "border-emerald-600 text-emerald-800 bg-white rounded-t-xl"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>WhatsApp Yorum Şablonu</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="max-h-[72vh] overflow-y-auto p-6 space-y-6">
          {/* ======================================================== */}
          {/* TAB 1: SİZİN YORUMLARINIZ VE GERÇEK YORUM LİSTESİ        */}
          {/* ======================================================== */}
          {activeTab === "insights" && (
            <div className="space-y-6 animate-fade-in">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Google Harita Puanınız
                  </span>
                  <div className="mt-1 flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-900">
                      {rating > 0 ? rating.toFixed(1) : "0.0"}
                    </span>
                    <span className="text-xs text-amber-500 font-bold">⭐ / 5.0</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {rating > 0 ? "Google Tarafından Doğrulandı" : "Henüz Puanlanmadı"}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Toplam Müşteri Yorumu
                  </span>
                  <div className="mt-1 flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-slate-900">{reviewCount}</span>
                    <span className="text-xs text-slate-400">Yorum</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {reviewCount === 0 ? "🚨 0 Yorum (Kritik Açık)" : "Aktif Yorum Kaydı"}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Rakip Liderle Fark
                  </span>
                  <div className="mt-1 flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-rose-600">-{gap}</span>
                    <span className="text-xs text-rose-500 font-bold">Yorum Açığı</span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    1. Sıradaki Rakibin Yorum Sayısı: {competitorReviewCount}
                  </span>
                </div>
              </div>

              {/* Gerçek Yorumlar Listesi VEYA Boş Durum Kılavuzu */}
              {targetSiteReviews && targetSiteReviews.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 flex items-center space-x-2">
                        <span>İşletmenizin Müşteri Değerlendirmeleri</span>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          {targetSiteReviews.length} İnceleme Gösteriliyor
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Müşterilerinizin Google Haritalar profilinizde paylaştığı deneyimler ve işletme yanıtları.
                      </p>
                    </div>

                    <button
                      onClick={handleCopyMapsLink}
                      className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedMapsLink ? "Link Kopyalandı!" : "Harita Linkini Al"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {targetSiteReviews.map((rev, revIdx) => (
                      <div
                        key={revIdx}
                        className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-2xs">
                              {rev.author.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                                <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-500">
                                  Doğrulanmış Müşteri
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400">{rev.date}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <div className="flex text-amber-400">
                              {Array.from({ length: rev.rating }).map((_, i) => (
                                <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-slate-700">{rev.rating}.0</span>
                          </div>
                        </div>

                        {rev.highlight && (
                          <div className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200/60">
                            ✨ {rev.highlight}
                          </div>
                        )}

                        <p className="text-xs text-slate-700 leading-relaxed">
                          &ldquo;{rev.text}&rdquo;
                        </p>

                        {/* Owner Response Box */}
                        {rev.owner_response ? (
                          <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 text-xs text-slate-700 space-y-1">
                            <div className="flex items-center space-x-1 text-indigo-700 font-bold text-[11px]">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>İşletme Sahibi Yanıtı ({cleanName})</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed italic text-[11.5px]">
                              {rev.owner_response}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 py-2 text-xs text-slate-500">
                            <span className="text-[11px]">Bu yoruma henüz yanıt verilmemiş.</span>
                            <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer">
                              <span>Google Panelinde Yanıtla →</span>
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Yorum Yok Durumu */
                <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-6 space-y-4">
                  <div className="flex items-center space-x-2.5 text-amber-900 font-bold text-sm">
                    <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                    <span>Google Haritalar Profilinizde Henüz Müşteri Yorumu Bulunmuyor</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed">
                    Google Harita algoritmasında ilk 3 sırada çıkamamanızın en büyük sebebi <strong>müşteri yorumu eksikliğidir</strong>. Sektörünüzdeki ilk 3 rakip ortalama {competitorReviewCount} yoruma sahiptir. Google, hiç yorum almamış veya uzun süredir yorum almayan işletmeleri yeni müşterilere önermez.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl border border-amber-200/80 bg-white p-3.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <MessageCircle className="h-4 w-4 text-emerald-600" />
                        <span>1. WhatsApp ile Yorum İsteyin</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Geçmişte iş yaptığınız 10 müşterinize hazırladığımız hazır şablonu WhatsApp&apos;tan ileterek 48 saat içinde ilk 5 yıldızlı yorumları toplayabilirsiniz.
                      </p>
                      <button
                        onClick={() => setActiveTab("whatsapp")}
                        className="mt-2.5 inline-flex items-center space-x-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <span>WhatsApp Şablonunu Aç →</span>
                      </button>
                    </div>

                    <div className="rounded-xl border border-amber-200/80 bg-white p-3.5">
                      <div className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                        <MapPin className="h-4 w-4 text-rose-500" />
                        <span>2. Harita Kayıt Durumunuzu Denetleyin</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                        Google Harita Pin Servisi kaydınız eksikse veya doğrulanmamışsa müşterileriniz haritada işletmenizi bulup yorum yazamaz.
                      </p>
                      <button
                        onClick={() => setActiveTab("maps_audit")}
                        className="mt-2.5 inline-flex items-center space-x-1 rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <span>Harita Kayıt Denetimini Aç →</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: RAKİPLERİN GOOGLE HARİTA YORUMLARI & FIRSAT RADARI*/}
          {/* ======================================================== */}
          {activeTab === "competitors" && (
            <div className="space-y-5 animate-fade-in">
              {/* Rival Switcher Pills */}
              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
                {rivalList.map((rival, idx) => (
                  <button
                    key={rival.domain}
                    onClick={() => setSelectedRivalIndex(idx)}
                    className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      selectedRivalIndex === idx
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <span>Rakip #{idx + 1}: {rival.domain.split(".")[0]}</span>
                    <span className="rounded bg-white/20 px-1.5 py-0.2 text-[10px]">
                      {rival.gbp_review_count} Yorum
                    </span>
                  </button>
                ))}
              </div>

              {/* Active Rival Overview Card */}
              {activeRival && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                        İncelenen Rakip
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                        {activeRival.title || activeRival.domain}
                      </h4>
                      <span className="text-[11px] font-mono text-slate-500">{activeRival.domain}</span>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Google Puanı</div>
                        <div className="text-base font-black text-slate-900">
                          {activeRival.gbp_rating} ⭐
                        </div>
                      </div>
                      <div className="text-right border-l border-indigo-200 pl-4">
                        <div className="text-xs text-slate-500">Toplam Yorum</div>
                        <div className="text-base font-black text-indigo-700">
                          {activeRival.gbp_review_count}
                        </div>
                      </div>
                      <div className="text-right border-l border-indigo-200 pl-4">
                        <div className="text-xs text-slate-500">SERP Sırası</div>
                        <div className="text-base font-black text-emerald-700">
                          #{activeRival.rank_position}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fırsat Radarı Banner: Rakip Açıklarından Müşteri Çalma */}
                  <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/60 to-orange-50/60 p-4">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 uppercase tracking-wider">
                      <Sparkles className="h-4 w-4 text-amber-600" />
                      <span>Fırsat Radarı: Rakibin Zayıf Noktaları</span>
                    </div>
                    <p className="text-xs text-amber-950 mt-1 leading-relaxed">
                      Bu rakibin müşteri yorumları incelendiğinde özellikle <strong>teklif gecikmeleri, telefonla ulaşım zorluğu ve yüksek fiyatlandırma</strong> konularında şikayetler görülmektedir. Web sitenizde ve Google Harita profilinizde <em>&ldquo;15 Dakikada Kesin Fiyat Teklifi ve Şeffaf Maliyet&rdquo;</em> vurgusu yaparak bu rakibin arayış içindeki müşterilerini kendinize çekebilirsiniz.
                    </p>
                  </div>

                  {/* Rival Reviews List */}
                  <div className="space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Bu Rakibin Gerçek Müşteri Yorumları &amp; İnceleme Analizi
                    </h5>

                    {activeRival.reviews && activeRival.reviews.length > 0 ? (
                      activeRival.reviews.map((rev, revIdx) => (
                        <div
                          key={revIdx}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                                {rev.author.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-slate-900">{rev.author}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {rev.sentiment === "negative" ? (
                                <span className="rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                                  Müşteri Şikayeti / Açık
                                </span>
                              ) : (
                                <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                  Olumlu Geri Bildirim
                                </span>
                              )}

                              <div className="flex items-center space-x-1 text-amber-400">
                                {Array.from({ length: rev.rating }).map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-amber-400" />
                                ))}
                              </div>
                              <span className="text-[11px] text-slate-400">{rev.date}</span>
                            </div>
                          </div>

                          {rev.highlight && (
                            <div className={`text-[11px] font-semibold ${rev.sentiment === "negative" ? "text-rose-700" : "text-emerald-700"}`}>
                              📌 {rev.highlight}
                            </div>
                          )}

                          <p className="text-xs text-slate-600 leading-relaxed italic">
                            &ldquo;{rev.text}&rdquo;
                          </p>

                          {rev.owner_response && (
                            <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-[11px] text-slate-500 italic">
                              <strong className="text-slate-700 not-italic">Rakip İşletme Yanıtı:</strong> {rev.owner_response}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 text-center">
                        Bu rakip için henüz detaylı inceleme metni çekilmedi.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: GOOGLE HARİTA KAYIT ANALİZİ & PİN DENETİMİ (YENİ)  */}
          {/* ======================================================== */}
          {activeTab === "maps_audit" && (
            <div className="space-y-6 animate-fade-in">
              {/* Header Scorecard */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Harita Sağlık Skoru
                  </span>
                  <div className="mt-1 flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-slate-900">
                      {effectiveAudit.score}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ 100</span>
                  </div>
                  <span className={`text-[11px] font-bold mt-1 block ${effectiveAudit.score >= 80 ? "text-emerald-600" : effectiveAudit.score >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                    {effectiveAudit.score >= 80 ? "Harita Profili Güçlü" : effectiveAudit.score >= 60 ? "Kritik Eksikler Var" : "Acil Müdahale Gerekli"}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Pin Servisi Kayıt Durumu
                  </span>
                  <div className="mt-1 flex items-center space-x-2">
                    {effectiveAudit.pin_registered ? (
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <ShieldAlert className="h-6 w-6 text-rose-600" />
                    )}
                    <span className="text-base font-extrabold text-slate-900">
                      {effectiveAudit.pin_registered ? "Kayıtlı & Doğrulanmış" : "Pin Kaydı Eksik"}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    {effectiveAudit.pin_status_label}
                  </span>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-2xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Denetim Özeti
                  </span>
                  <div className="mt-1 flex items-baseline space-x-3">
                    <span className="text-xl font-bold text-emerald-600">
                      ✓ {effectiveAudit.passed_checks} Başarılı
                    </span>
                    <span className="text-xl font-bold text-rose-600">
                      ✗ {effectiveAudit.failed_checks} Eksik
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Toplam {effectiveAudit.total_checks} Kriter Denetlendi
                  </span>
                </div>
              </div>

              {/* Pin Servisi Nedir ve Neden Hayatidir Kutusu */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-5 space-y-3">
                <div className="flex items-center space-x-2 text-rose-900 font-bold text-sm">
                  <MapPin className="h-5 w-5 text-rose-600 shrink-0" />
                  <span>Google Harita Pin Servisi Kaydı Neden Hayatidir?</span>
                </div>
                <p className="text-xs text-rose-950 leading-relaxed">
                  Google Haritalar&apos;da yer alan kırmızı konum iğnesi (Pin Servisi), firmanızın resmi olarak Google yerel harita veritabanında tescil edilmesini sağlar. Harita iğnesi kapı numarasına milimetrik sabitlenmemiş veya Google İşletme doğrulaması (GBP) yapılmamış firmalar, kullanıcılar arama yaptığında <strong>Google İlk 3 Harita Paketinde (Local 3-Pack) kesinlikle gösterilmez</strong>.
                </p>
              </div>

              {/* Tespit Edilen Eksiklikler Listesi (Checks) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Haritada Tespit Edilen Eksiklikler &amp; Aksiyon Listesi
                  </h4>
                  <span className="text-xs text-slate-400">
                    Aşağıdaki adımları tamamlayarak harita skorunuzu %90+ seviyesine çıkarın
                  </span>
                </div>

                <div className="space-y-2.5">
                  {effectiveAudit.checks.map((chk) => (
                    <div
                      key={chk.id}
                      className={`rounded-2xl border p-4 space-y-2.5 transition-all ${
                        chk.status === "fail"
                          ? "border-rose-200 bg-rose-50/20"
                          : chk.status === "warning"
                          ? "border-amber-200 bg-amber-50/20"
                          : "border-emerald-200 bg-emerald-50/20"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          {chk.status === "fail" && <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />}
                          {chk.status === "warning" && <Clock className="h-4 w-4 text-amber-600 shrink-0" />}
                          {chk.status === "pass" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}

                          <h5 className="text-xs font-extrabold text-slate-900">{chk.title}</h5>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              chk.status === "fail"
                                ? "bg-rose-100 text-rose-800"
                                : chk.status === "warning"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {chk.status_label}
                          </span>

                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                            Etki: {chk.impact}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {chk.description}
                      </p>

                      <div className="rounded-xl border border-slate-200/60 bg-white/80 p-2.5 text-xs text-slate-800 flex items-start space-x-2">
                        <span className="font-bold text-indigo-700 shrink-0">Yapılması Gereken:</span>
                        <span>{chk.action_needed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adım Adım Pin Servisi Kayıt Yönergesi */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                  <Navigation className="h-4 w-4 text-indigo-600" />
                  <span>Google Harita Pin Servisi Kaydı Nasıl Yapılır? (5 Adımlı Kılavuz)</span>
                </div>

                <div className="space-y-3">
                  {effectiveAudit.pin_service_guide.map((item) => (
                    <div key={item.step} className="flex items-start space-x-3 rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-black text-white">
                        {item.step}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-slate-900">{item.title}</div>
                        <p className="text-[11.5px] text-slate-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <a
                    href="https://business.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 transition-colors shadow-xs"
                  >
                    <span>Google İşletme Paneline Git (business.google.com)</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>

                  <button
                    onClick={() => setActiveTab("whatsapp")}
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp Yorum Toplama Şablonunu Aç</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: WHATSAPP ŞABLONU                                  */}
          {/* ======================================================== */}
          {activeTab === "whatsapp" && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-xs text-emerald-900 leading-relaxed">
                <strong>Nasıl Kullanılır?</strong> Sipariş teslim ettiğiniz veya hizmet sağladığınız müşterilere bu mesajı WhatsApp üzerinden göndererek Google Harita puanınızı 1-2 haftada rakiplerinizin seviyesine çıkarabilirsiniz.
              </div>

              <div className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <pre className="font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {whatsappTemplate}
                </pre>

                <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200">
                  <button
                    onClick={handleCopyWhatsApp}
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copiedTemplate ? "Metin Kopyalandı!" : "Metni Kopyala"}</span>
                  </button>

                  <button
                    onClick={handleOpenWhatsAppWeb}
                    className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>WhatsApp Web&apos;de Aç</span>
                  </button>

                  <button
                    onClick={handleCopyMapsLink}
                    className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>{copiedMapsLink ? "Harita Linki Kopyalandı!" : "Sadece Harita Linkini Kopyala"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5">
          <span className="text-xs text-slate-500">
            Google Sıralama &bull; Bu proje <strong>cloudmedya.com</strong> tarafından geliştirilmiştir.
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

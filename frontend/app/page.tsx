"use client";

import React, { useEffect, useState } from "react";
import { ActionBoard } from "@/components/ActionBoard";
import { AIContentGeneratorModal } from "@/components/AIContentGeneratorModal";
import { AuditSearchHero } from "@/components/AuditSearchHero";
import { CompetitorMatrix } from "@/components/CompetitorMatrix";
import { CompetitorRadarCard } from "@/components/CompetitorRadarCard";
import { CorporatePDFModal } from "@/components/CorporatePDFModal";
import { CROAuditCard } from "@/components/CROAuditCard";
import { FixAssistantModal, FixMetricType } from "@/components/FixAssistantModal";
import { GBPPostCalendar } from "@/components/GBPPostCalendar";
import { GeoGridHeatmap } from "@/components/GeoGridHeatmap";
import { KeywordGapCard } from "@/components/KeywordGapCard";
import { KeywordRankingsCard } from "@/components/KeywordRankingsCard";
import { Navbar } from "@/components/Navbar";
import { ReportHeader } from "@/components/ReportHeader";
import { ReviewsModal } from "@/components/ReviewsModal";
import { GoogleMapsAuditCard } from "@/components/GoogleMapsAuditCard";
import { GeoTagPhotoModal } from "@/components/GeoTagPhotoModal";
import { LocalSiloModal } from "@/components/LocalSiloModal";
import { QuotaExceededModal } from "@/components/QuotaExceededModal";
import { ReviewShieldModal } from "@/components/ReviewShieldModal";
import { SEOPackageModal } from "@/components/SEOPackageModal";
import { StrategicArchitectureSchema } from "@/components/StrategicArchitectureSchema";
import { SummaryCards } from "@/components/SummaryCards";
import {
  executeLiveDomainAudit,
  fetchDashboardData,
  fetchQuotaStatus,
  toggleActionStatus,
} from "@/lib/api";
import { initialDashboardData } from "@/lib/mockData";
import { DashboardData } from "@/lib/types";
import {
  Award,
  Building2,
  Camera,
  ChevronRight,
  Cpu,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  Globe,
  HelpCircle,
  Home,
  KeyRound,
  Layers,
  LayoutGrid,
  ListTodo,
  Lock,
  MapPin,
  MessageCircle,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(initialDashboardData);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Layout View Mode: "all" (Tüm Raporu Aç - Varsayılan) vs "tabs" (Bölüm Bölüm Sekmeler)
  const [viewLayout, setViewLayout] = useState<"tabs" | "all">("all");

  // Segmented Tab Navigation State
  const [activeReportTab, setActiveReportTab] = useState<
    "competitors" | "keywords" | "maps" | "actions" | "schema"
  >("competitors");

  // Modals state
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState<boolean>(false);
  const [selectedRivalForReviews, setSelectedRivalForReviews] = useState<string | undefined>(undefined);
  const [reviewsModalInitialTab, setReviewsModalInitialTab] = useState<"insights" | "competitors" | "maps_audit" | "whatsapp">("insights");
  const [isFixModalOpen, setIsFixModalOpen] = useState<boolean>(false);
  const [selectedFixMetric, setSelectedFixMetric] = useState<FixMetricType | null>(null);

  // New Superpower Modals state
  const [isContentModalOpen, setIsContentModalOpen] = useState<boolean>(false);
  const [selectedContentKeyword, setSelectedContentKeyword] = useState<string>("hizmet");
  const [isReviewShieldModalOpen, setIsReviewShieldModalOpen] = useState<boolean>(false);
  const [isCorporatePdfModalOpen, setIsCorporatePdfModalOpen] = useState<boolean>(false);
  const [isSEOPackageModalOpen, setIsSEOPackageModalOpen] = useState<boolean>(false);
  const [isGeoTagModalOpen, setIsGeoTagModalOpen] = useState<boolean>(false);
  const [isLocalSiloModalOpen, setIsLocalSiloModalOpen] = useState<boolean>(false);

  // Quota & Voucher Code Protection State
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState<boolean>(false);
  const [quotaDomain, setQuotaDomain] = useState<string>("");
  const [quotaStatus, setQuotaStatus] = useState<any>(null);
  const [activeVoucherCode, setActiveVoucherCode] = useState<string>("");
  const [pendingSearchParams, setPendingSearchParams] = useState<any>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Fetch initial general quota status and load any saved voucher code
  useEffect(() => {
    let savedCode = "";
    try {
      savedCode = localStorage.getItem("rankengine_voucher_code") || "";
      if (savedCode) setActiveVoucherCode(savedCode);
    } catch {}

    fetchQuotaStatus("", savedCode || undefined).then((res) => {
      if (res) setQuotaStatus(res);
    });
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const liveResult = await executeLiveDomainAudit({
        domain: data.summary.target_domain,
        keyword: data.summary.target_keyword,
        location: data.summary.location,
        companyName: data.summary.company_name,
      });
      setData(liveResult);
      showToast("Canlı SERP ve rakip verileri güncellendi!");
    } catch {
      showToast("Güncelleme sırasında hata oluştu.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLiveSearch = async (params: {
    domain: string;
    keyword: string;
    location?: string;
    companyName?: string;
    voucherCode?: string;
  }) => {
    const cleanDom = params.domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    const codeToSend = params.voucherCode || activeVoucherCode || undefined;

    // PRE-CHECK QUOTA BEFORE SEARCHING:
    // "5 hak dolana kadar bu uyarısı vermesin haklar dolunca arama yapmadan uyarı versin sadece"
    try {
      const q = await fetchQuotaStatus(cleanDom, codeToSend);
      if (q) setQuotaStatus(q);
      if (q && !q.canSearch && !q.hasActiveVoucher && (q.domainFreeRemaining ?? 0) <= 0) {
        setQuotaDomain(cleanDom);
        setIsQuotaModalOpen(true);
        showToast(`"${cleanDom}" için 5 ücretsiz analiz hakkı doldu. Lütfen erişim kodu girin.`);
        return; // STOP! Arama yapmadan sadece uyarı modalını aç
      }
    } catch {}

    setIsSearching(true);
    setPendingSearchParams(params);
    setQuotaDomain(params.domain);
    try {
      const liveResult = await executeLiveDomainAudit({
        ...params,
        domain: cleanDom,
        voucherCode: codeToSend,
      });
      setData(liveResult);
      setHasSearched(true);
      if (liveResult.summary?.target_domain) {
        fetchQuotaStatus(liveResult.summary.target_domain, codeToSend).then((q) => {
          if (q) setQuotaStatus(q);
        });
      }
      showToast(
        `"${params.domain}" analizi tamamlandı! Kurumsal rapor ve radarlar hazırlandı.`
      );
    } catch (err: any) {
      if (err?.isQuotaExceeded) {
        setQuotaDomain(params.domain);
        if (err.quotaStatus) {
          setQuotaStatus(err.quotaStatus);
        }
        setIsQuotaModalOpen(true);
        showToast("Ücretsiz analiz limitiniz doldu. Lütfen erişim kodu girin.");
      } else {
        showToast("Analiz sırasında bir hata oluştu, lütfen tekrar deneyin.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleCodeSuccess = (validCode: string, boundDomain?: string) => {
    setActiveVoucherCode(validCode);
    try {
      localStorage.setItem("rankengine_voucher_code", validCode);
    } catch {}
    showToast(`"${validCode}" kodu aktif edildi! Analiz başlatılıyor...`);

    const targetDom = boundDomain || quotaDomain || pendingSearchParams?.domain || "";
    if (targetDom) {
      setQuotaDomain(targetDom);
      fetchQuotaStatus(targetDom, validCode).then((q) => {
        if (q) setQuotaStatus(q);
      });
      handleLiveSearch({
        domain: targetDom,
        keyword: pendingSearchParams?.keyword || `${targetDom.split(".")[0]} hizmetleri`,
        location: pendingSearchParams?.location || "Kadıköy / İstanbul",
        companyName: pendingSearchParams?.companyName,
        voucherCode: validCode,
      });
    }
  };

  const handleToggleAction = async (id: string, isCompleted: boolean) => {
    setData((prev) => {
      const updatedActions = prev.actions.map((act) =>
        act.id === id ? { ...act, is_completed: isCompleted } : act
      );
      const newCompletedCount = updatedActions.filter((a) => a.is_completed).length;

      return {
        ...prev,
        summary: {
          ...prev.summary,
          completed_actions: newCompletedCount,
        },
        actions: updatedActions,
      };
    });

    if (isCompleted) {
      showToast("Tebrikler! Görev uygulandı olarak işaretlendi. İlerleme güncellendi.");
    }

    await toggleActionStatus(id, isCompleted);
  };

  const handleOpenFixAssistant = (metric: FixMetricType) => {
    setSelectedFixMetric(metric);
    setIsFixModalOpen(true);
  };

  const handleGenerateContentForKeyword = (kw: string) => {
    setSelectedContentKeyword(kw);
    setIsContentModalOpen(true);
  };

  const targetSite = data.competitors.find((c) => c.is_target) || data.competitors[0];
  const rivalLeader = data.competitors.find((c) => !c.is_target && c.rank_position === 1);

  // IF NOT SEARCHED YET: Comprehensive Brand Landing Page with Navigation & All Features Showcase
  if (!hasSearched) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between scroll-smooth selection:bg-indigo-500 selection:text-white">
        {/* Sticky Top Navbar with Menu Links */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-200">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                Google <span className="text-indigo-600">Sıralama</span>
              </span>
              <span className="hidden sm:inline-block ml-2 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-200">
                Canlı SERP &amp; Harita İstihbaratı
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold text-slate-600">
            <a href="#ozellikler" className="hover:text-indigo-600 transition-colors">
              Platform Özellikleri
            </a>
            <a href="#nasil-calisir" className="hover:text-indigo-600 transition-colors">
              Nasıl Çalışır?
            </a>
            <a href="#karsilastirma" className="hover:text-indigo-600 transition-colors">
              Neden Google Sıralama?
            </a>
            <a
              href="https://cloudmedya.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              cloudmedya.com
            </a>
          </nav>

          {/* Right Action */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => {
                setHasSearched(false);
                setIsQuotaModalOpen(false);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 font-bold text-indigo-700 hover:bg-indigo-100 transition-all shadow-2xs cursor-pointer"
            >
              <Home className="h-3.5 w-3.5 text-indigo-600" />
              <span>Ana Sayfa</span>
            </button>

            {quotaStatus?.hasActiveVoucher ? (
              <span className="hidden sm:inline-flex items-center space-x-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 font-bold text-indigo-700 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>{quotaStatus.isUnlimited ? "VIP Sınırsız" : `${quotaStatus.voucherCredits} Kredi`}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIsQuotaModalOpen(true)}
                className="hidden sm:inline-flex items-center space-x-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-bold text-emerald-800 hover:bg-emerald-100 transition-all shadow-2xs cursor-pointer"
                title="Kalan ücretsiz analiz hakkınız"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Hak: {quotaStatus ? quotaStatus.domainFreeRemaining : 5}/5</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsQuotaModalOpen(true)}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 font-bold text-slate-700 hover:border-indigo-300 hover:text-indigo-700 transition-all shadow-2xs cursor-pointer"
            >
              <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
              <span>Erişim Kodu</span>
            </button>

            <button
              onClick={() => {
                setIsQuotaModalOpen(false);
                setHasSearched(true);
              }}
              className="rounded-xl border border-indigo-200 bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 cursor-pointer"
            >
              Demo Raporu Aç
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 space-y-16 py-8 sm:py-12">
          {/* Section 0: Search Hero Card */}
          <section id="arama" className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center space-y-3 mb-6">
              <div className="inline-flex items-center space-x-1.5 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-200 shadow-2xs">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                <span>Canlı SERP &bull; Google Haritalar &bull; Sayfa Hızı v5 &bull; Yapay Zeka</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                Web Sitenizin Gerçek Google Sırasını &amp; Yerel Gücünü Denetleyin
              </h1>
              <p className="text-sm text-slate-500 max-w-2xl mx-auto">
                Yapay tahminler yerine anlık SERP taraması, gerçek rakip kıyaslama masası, Google Haritalar yorum kalkanı ve hazır kod paketi.
              </p>
            </div>

            <AuditSearchHero
              onSearch={handleLiveSearch}
              isSearching={isSearching}
              isCentered={true}
              quotaInfo={quotaStatus}
              onOpenCodeModal={(dom) => {
                if (dom) setQuotaDomain(dom);
                setIsQuotaModalOpen(true);
              }}
              activeVoucherCode={activeVoucherCode}
            />
          </section>

          {/* Section 1: #ozellikler - Platformun 8 Süper Gücü */}
          <section id="ozellikler" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8 scroll-mt-20">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                Sistem Özellikleri &amp; Yetenekler
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Piyasadaki Araçlardan Neden Farklıyız?
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto">
                Google Sıralama, işletmenizi sadece analiz etmekle kalmaz; rakiplerinizi geçmeniz için gereken tüm kodları, A4 sunumunu ve posterleri tek tıkla üretir.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Feature 1 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Search className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    1. Canlı SERP &amp; Dürüst Sıralama
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Google&apos;ın ilk 50 sırası anlık taranır. Siteniz ilk sayfalarda yoksa sahte 1. sayfa göstermez, dürüstçe &ldquo;&gt;50 Sıralamada Yok&rdquo; uyarısı vererek acil eylem planını başlatır.
                  </p>
                </div>
                <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Gerçekçi Sonuçlar
                </span>
              </div>

              {/* Feature 2 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Google Haritalar &amp; Geo-Grid
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Bölgesel 3x3 Geo-Grid radarı ile Local 3-Pack harita görünürlüğünü, canlı puanınızı ve en yakın rakiple olan yorum açığını analiz eder.
                  </p>
                </div>
                <span className="inline-block rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Yerel SEO Gücü
                </span>
              </div>

              {/* Feature 3 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Trophy className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    3. Canlı Rakip Kıyaslama Masası
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    İlk 3 rakibin gerçek PageSpeed v5 mobil hızını, Wayback CDX API ile gerçek domain yaşını, Schema durumunu ve kelime hacmini yan yana kıyaslar.
                  </p>
                </div>
                <span className="inline-block rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  %100 Canlı Veriler
                </span>
              </div>

              {/* Feature 4 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    4. Negatif Yorum Kalkanı &amp; Huni
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    4-5 yıldız veren memnun müşterileri Google Haritalar&apos;a yönlendirirken; 1-3 yıldızlı şikayetleri doğrudan WhatsApp&apos;a yönlendirerek puanınızı 4.9&apos;da tutar.
                  </p>
                </div>
                <span className="inline-block rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                  Puan Koruyucu
                </span>
              </div>

              {/* Feature 5 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    5. Yapay Zeka SEO &amp; Akordeon
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Web sitenizin görsel tasarımını bozmayan katlanabilir &lt;details&gt; akordeon içeriği ve &lt;head&gt; içine yerleşen ziyaretçiye görünmez FAQPage şeması üretir.
                  </p>
                </div>
                <span className="inline-block rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                  Tasarımı Bozmaz
                </span>
              </div>

              {/* Feature 6 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    6. A4 Kurumsal Sunum &amp; PDF
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Yönetim kurullarına ve ajans müşterilerine sunulmaya hazır, 4 tam sayfadan oluşan renkli, şemalı ve kurumsal A4 yönetim raporu çıktısı sağlar.
                  </p>
                </div>
                <span className="inline-block rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                  A4 Birebir Baskı
                </span>
              </div>

              {/* Feature 7 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <FolderArchive className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    7. Hazır SEO Paketi İndirici
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Title, Meta, Schema, Akordeon ve Robots.txt kodlarını tek tıkla webmaster veya yazılımcınıza gönderebileceğiniz hazır dosya paketi olarak indirir.
                  </p>
                </div>
                <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                  Tek Tıkla Kurulum
                </span>
              </div>

              {/* Feature 8 */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all space-y-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <Printer className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900">
                    8. A5 Vitrin &amp; Masa QR Posteri
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    İşletmenizin kasasına, masasına veya vitrinine basabileceğiniz, canlı taranabilir QR kodlu akrilik masa standı posterini tek tıkla A5 formatında basar.
                  </p>
                </div>
                <span className="inline-block rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                  Fiziksel Stand Çıktısı
                </span>
              </div>
            </div>
          </section>

          {/* Section 2: #nasil-calisir - 3 Adımda İşleyiş */}
          <section id="nasil-calisir" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-10 shadow-sm space-y-6">
              <div className="text-center space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Kolay Entegrasyon</span>
                <h2 className="text-2xl font-black text-slate-900">3 Adımda Google&apos;da Zirveye Çıkın</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="text-center space-y-2.5">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-md shadow-indigo-200">
                    1
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Domain &amp; Kelimenizi Girin</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Web sitenizin adresini yazın. Sitedeki en çok aranan sektörel anahtar kelimeler otomatik ayıklanır.
                  </p>
                </div>

                <div className="text-center space-y-2.5">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-md shadow-indigo-200">
                    2
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Canlı SERP &amp; Rakipleri Tarayın</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Googlebot, Places API ve PageSpeed v5 eşzamanlı çalışır. İlk 3 rakibinizin tüm açıkları masaya dökülür.
                  </p>
                </div>

                <div className="text-center space-y-2.5">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-black text-lg shadow-md shadow-indigo-200">
                    3
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Kodları &amp; Sunumu Alıp Uygulayın</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Tek tıkla hazır SEO paketini indirin, A5 stand posterini basın ve 4 sayfalık kurumsal A4 sunumunu kaydedin.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: #karsilastirma - Neden Google Sıralama? */}
          <section id="karsilastirma" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6 scroll-mt-20">
            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 p-6 sm:p-10 text-white shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-white/10 px-3 py-1 rounded-full">
                  Fark Yaratan Güç
                </span>
                <h2 className="text-2xl sm:text-3xl font-black">
                  Klasik SEO Araçları vs Google Sıralama
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-3">
                  <h3 className="font-bold text-rose-300 text-sm flex items-center space-x-2">
                    <span>❌</span>
                    <span>Klasik Yabancı SEO Araçları</span>
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Yüksek aylık dolar abonelikleri gerektirir.</li>
                    <li>• Türkiye yerel harita (Local 3-Pack) dinamiklerini bilmez.</li>
                    <li>• Negatif yorum kalkanı veya QR vitrin posteri sunmaz.</li>
                    <li>• Sadece hata listeler, tek tıkla kopyalanacak hazır kod vermez.</li>
                    <li>• Türkçe kurumsal yönetim sunumu çıktısı sağlamaz.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/40 p-5 space-y-3">
                  <h3 className="font-bold text-emerald-400 text-sm flex items-center space-x-2">
                    <span>✅</span>
                    <span>Google Sıralama (cloudmedya.com)</span>
                  </h3>
                  <ul className="space-y-2 text-slate-200">
                    <li>• %100 canlı ve dürüst SERP &amp; harita taraması.</li>
                    <li>• 1-3 yıldızlı şikayetleri WhatsApp&apos;a filtreleyen Yorum Kalkanı.</li>
                    <li>• Dükkan ve masalar için hazır A5 yazdırılabilir QR posteri.</li>
                    <li>• Sitede görünmeyen JSON-LD ve tasarımı bozmayan akordeon kodu.</li>
                    <li>• 4 sayfalık kurumsal A4 yönetim sunumu ve tek tıkla SEO paketi.</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Global Footer */}
        <footer className="w-full border-t border-slate-200/80 bg-white py-8 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold text-slate-600">
            <a href="#ozellikler" className="hover:text-indigo-600 transition-colors">Özellikler</a>
            <a href="#nasil-calisir" className="hover:text-indigo-600 transition-colors">Nasıl Çalışır?</a>
            <a href="#karsilastirma" className="hover:text-indigo-600 transition-colors">Neden Biz?</a>
            <a href="#arama" className="hover:text-indigo-600 transition-colors">Canlı Denetim</a>
            <a href="https://cloudmedya.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-bold hover:underline">cloudmedya.com</a>
          </div>
          <p className="text-slate-400 pt-2">
            Google Sıralama &copy; {new Date().getFullYear()} &mdash; Bu proje{" "}
            <a
              href="https://cloudmedya.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo-600 hover:underline"
            >
              cloudmedya.com
            </a>{" "}
            tarafından geliştirilmiştir.
          </p>
        </footer>

        {/* Quota Exceeded & Voucher Redemption Modal */}
        <QuotaExceededModal
          isOpen={isQuotaModalOpen}
          onClose={() => setIsQuotaModalOpen(false)}
          domain={quotaDomain || pendingSearchParams?.domain || ""}
          reason={quotaStatus && (quotaStatus.domainFreeRemaining ?? 5) <= 0 ? "DOMAIN_LIMIT_REACHED" : undefined}
          onCodeSuccess={handleCodeSuccess}
        />

        {/* Interactive Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl animate-fade-in border border-slate-800">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // AFTER SEARCH: Organized, Executive Corporate Dashboard
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sticky Top Navbar */}
      <Navbar
        summary={data.summary}
        onRefresh={() =>
          handleLiveSearch({
            domain: data.summary.target_domain,
            keyword: data.summary.target_keyword,
            location: data.summary.location,
            companyName: data.summary.company_name,
          })
        }
        isRefreshing={isRefreshing}
        onNewSearch={() => setHasSearched(false)}
        onOpenPDF={() => setIsCorporatePdfModalOpen(true)}
        onOpenSEOPackage={() => setIsSEOPackageModalOpen(true)}
        quotaInfo={quotaStatus}
        onOpenCodeModal={() => setIsQuotaModalOpen(true)}
      />

      {/* Main Content Dashboard Container */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        {/* Printable White-Label Agency Header */}
        <div className="hidden print:block border-b-2 border-indigo-600 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Google Sıralama - Resmi SEO & SERP Denetim Raporu
              </h1>
              <p className="text-sm font-semibold text-indigo-700 mt-1">
                İşletme: {data.summary.company_name} ({data.summary.target_domain}) | Hedef: &ldquo;{data.summary.target_keyword}&rdquo;
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <span>Tarih: {new Date().toLocaleDateString("tr-TR")}</span>
              <p className="font-bold text-slate-800">Stratejik KOBİ Büyüme Raporu</p>
            </div>
          </div>
        </div>

        {/* Section 0: Corporate Report Executive Header */}
        <section aria-label="Kurumsal Rapor Başlığı">
          <ReportHeader
            summary={data.summary}
            onPrint={() => setIsCorporatePdfModalOpen(true)}
            onResetSearch={() => setHasSearched(false)}
            onOpenReviewShield={() => setIsReviewShieldModalOpen(true)}
            onOpenSEOPackage={() => setIsSEOPackageModalOpen(true)}
          />
        </section>

        {/* Section 1: Top Executive Metric Cards (4 Cards) */}
        <section aria-label="Özet Metrikler">
          <SummaryCards
            summary={data.summary}
            competitors={data.competitors}
            onOpenMapsAudit={() => {
              setReviewsModalInitialTab("maps_audit");
              setSelectedRivalForReviews(undefined);
              setIsReviewsModalOpen(true);
            }}
          />
        </section>

        {/* Section 2: Executive Navigation Bar & Mode Switcher */}
        <div className="no-print space-y-3 pt-2">
          {/* Top Tier: View Mode Selector & Superpower Launchers */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
            <div className="flex items-center space-x-2.5">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pl-1 hidden sm:inline">
                Rapor Görünümü:
              </span>
              <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  onClick={() => setViewLayout("all")}
                  className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewLayout === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>Tüm Raporu Aç (Açık Liste)</span>
                </button>

                <button
                  onClick={() => setViewLayout("tabs")}
                  className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    viewLayout === "tabs"
                      ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span>Sekmeli Görünüm (Bölüm Bölüm)</span>
                </button>
              </div>
            </div>

            {/* Quick Actions: Superpower Modals */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsSEOPackageModalOpen(true)}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs font-bold text-indigo-700 shadow-2xs hover:bg-indigo-100 transition-all cursor-pointer"
                title="Sitenize doğrudan ekleyebileceğiniz hazır HTML & Schema paketi"
              >
                <FolderArchive className="h-4 w-4 text-indigo-600" />
                <span>Hazır SEO Paketi (.zip)</span>
              </button>

              <button
                onClick={() => setIsReviewShieldModalOpen(true)}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs font-bold text-emerald-800 shadow-2xs hover:bg-emerald-100 transition-all cursor-pointer"
                title="Negatif yorumları engelleyen canlı QR huni & A5 posteri"
              >
                <QrCode className="h-4 w-4 text-emerald-600" />
                <span>Yorum Kalkanı &amp; A5 Stand</span>
              </button>

              <button
                onClick={() => setIsGeoTagModalOpen(true)}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-bold text-rose-700 shadow-2xs hover:bg-rose-100 transition-all cursor-pointer"
                title="Google Haritalar fotoğraflarınıza tam GPS ve EXIF koordinatı gömün"
              >
                <Camera className="h-4 w-4 text-rose-600" />
                <span>Fotoğraf Geo-Tag (GPS)</span>
              </button>

              <button
                onClick={() => setIsLocalSiloModalOpen(true)}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-2 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-100 transition-all cursor-pointer"
                title="Şehirdeki sanayi sitelerine ve ilçelere özel SEO açılış sayfaları üretin"
              >
                <Building2 className="h-4 w-4 text-blue-600" />
                <span>İlçe Yerel Silo Mimarisi</span>
              </button>

              <button
                onClick={() => setIsCorporatePdfModalOpen(true)}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 transition-all cursor-pointer"
              >
                <FileCheck className="h-4 w-4" />
                <span>Kurumsal Sunum (A4)</span>
              </button>
            </div>
          </div>

          {/* Bottom Tier: Responsive Grid Section Buttons (Fits Screen without scroll) */}
          {viewLayout === "tabs" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              <button
                onClick={() => setActiveReportTab("competitors")}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeReportTab === "competitors"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className={`p-1.5 rounded-lg ${activeReportTab === "competitors" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"}`}>
                    <Trophy className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="truncate">1. Rakipler</span>
                </div>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                  activeReportTab === "competitors" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  3 Rakip
                </span>
              </button>

              <button
                onClick={() => setActiveReportTab("keywords")}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeReportTab === "keywords"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className={`p-1.5 rounded-lg ${activeReportTab === "keywords" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"}`}>
                    <Search className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="truncate">2. Kelimeler</span>
                </div>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                  activeReportTab === "keywords" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  SERP
                </span>
              </button>

              <button
                onClick={() => setActiveReportTab("maps")}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeReportTab === "maps"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className={`p-1.5 rounded-lg ${activeReportTab === "maps" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"}`}>
                    <MapPin className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="truncate">3. Haritalar</span>
                </div>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                  activeReportTab === "maps" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  3x3 Grid
                </span>
              </button>

              <button
                onClick={() => setActiveReportTab("actions")}
                className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeReportTab === "actions"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className={`p-1.5 rounded-lg ${activeReportTab === "actions" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"}`}>
                    <ListTodo className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="truncate">4. Eylem Planı</span>
                </div>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                  activeReportTab === "actions" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {data.actions.length} Görev
                </span>
              </button>

              <button
                onClick={() => setActiveReportTab("schema")}
                className={`col-span-2 sm:col-span-1 flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                  activeReportTab === "schema"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-slate-200/90 shadow-2xs"
                }`}
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className={`p-1.5 rounded-lg ${activeReportTab === "schema" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"}`}>
                    <Cpu className="h-4 w-4 shrink-0" />
                  </div>
                  <span className="truncate">5. Büyüme Şeması</span>
                </div>
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded shrink-0 ${
                  activeReportTab === "schema" ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-700"
                }`}>
                  4 Katman
                </span>
              </button>
            </div>
          ) : (
            /* When in "all" mode: Responsive Quick Jump Cards across the 5 sections */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-xs">
              <a
                href="#sec-competitors"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-2xs transition-all font-bold"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Trophy className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate">1. Rakipler</span>
                </div>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  3 Rakip
                </span>
              </a>

              <a
                href="#sec-keywords"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-2xs transition-all font-bold"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Search className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate">2. Kelimeler</span>
                </div>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  SERP
                </span>
              </a>

              <a
                href="#sec-maps"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-2xs transition-all font-bold"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate">3. Haritalar</span>
                </div>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  3x3 Grid
                </span>
              </a>

              <a
                href="#sec-actions"
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-2xs transition-all font-bold"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <ListTodo className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate">4. Eylem Planı</span>
                </div>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                  {data.actions.length} Görev
                </span>
              </a>

              <a
                href="#sec-schema"
                className="col-span-2 sm:col-span-1 flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 text-slate-700 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-2xs transition-all font-bold"
              >
                <div className="flex items-center space-x-2 min-w-0">
                  <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                    <Cpu className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate">5. Büyüme Şeması</span>
                </div>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 shrink-0">
                  4 Katman
                </span>
              </a>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* TAB 1: RAKİP KIYASLAMA & İSTİHBARAT RADARI               */}
        {/* ======================================================== */}
        {(viewLayout === "all" || activeReportTab === "competitors") && (
          <div id="sec-competitors" className="space-y-6 animate-fade-in scroll-mt-20">
            {viewLayout === "all" && (
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 pt-4">
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-xs font-bold">
                  BÖLÜM 01
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Rakip Kıyaslama Masası & İstihbarat Radarı
                </h3>
              </div>
            )}

            <section aria-label="Rakip Kıyaslama Masası">
              <CompetitorMatrix
                competitors={data.competitors}
                onOpenReviews={(rivalDomain) => {
                  setSelectedRivalForReviews(rivalDomain);
                  setReviewsModalInitialTab(rivalDomain ? "competitors" : "insights");
                  setIsReviewsModalOpen(true);
                }}
                onOpenFixGuide={handleOpenFixAssistant}
              />
            </section>

            <section aria-label="Rakip İstihbarat Radarı">
              <CompetitorRadarCard
                competitors={data.competitors}
                keyword={data.summary.target_keyword}
              />
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ANAHTAR KELİMELER & SERP MASASI                   */}
        {/* ======================================================== */}
        {(viewLayout === "all" || activeReportTab === "keywords") && (
          <div id="sec-keywords" className="space-y-6 animate-fade-in scroll-mt-20">
            {viewLayout === "all" && (
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 pt-4">
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-xs font-bold">
                  BÖLÜM 02
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Tüm Anahtar Kelimelerde SERP Sıralama Masası & Fırsat Analizi
                </h3>
              </div>
            )}

            <section aria-label="Tüm Anahtar Kelimeler Sıralaması">
              <KeywordRankingsCard
                companyName={data.summary.company_name}
                domain={data.summary.target_domain}
                targetKeyword={data.summary.target_keyword}
                location={data.summary.location}
                rankings={data.keyword_rankings}
                onGenerateContent={handleGenerateContentForKeyword}
                missingKeywordsGuide={data.missing_keywords_guide}
              />
            </section>

            {data.keyword_gaps && data.keyword_gaps.length > 0 && (
              <section aria-label="Rakip Kelime Casusu">
                <KeywordGapCard
                  keywordGaps={data.keyword_gaps}
                  onGenerateContent={handleGenerateContentForKeyword}
                />
              </section>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: HARİTALAR & GEO-GRID                              */}
        {/* ======================================================== */}
        {(viewLayout === "all" || activeReportTab === "maps") && (
          <div id="sec-maps" className="space-y-6 animate-fade-in scroll-mt-20">
            {viewLayout === "all" && (
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 pt-4">
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-xs font-bold">
                  BÖLÜM 03
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Google Haritalar Geo-Grid & Yerel Görünürlük
                </h3>
              </div>
            )}

            {/* Google Harita Kayıt Analizi & Pin Servisi Denetimi */}
            <section aria-label="Google Harita Kayıt Analizi & Pin Denetimi">
              <GoogleMapsAuditCard
                companyName={data.summary.company_name}
                domain={data.summary.target_domain}
                location={data.summary.location}
                keyword={data.summary.target_keyword}
                reviewCount={targetSite.gbp_review_count}
                rating={targetSite.gbp_rating}
                mapsAudit={data.maps_audit}
                onOpenAuditModal={(tab) => {
                  setReviewsModalInitialTab(tab || "maps_audit");
                  setSelectedRivalForReviews(undefined);
                  setIsReviewsModalOpen(true);
                }}
              />
            </section>

            <section aria-label="Geo-Grid Harita Radarı">
              <GeoGridHeatmap
                companyName={data.summary.company_name}
                domain={data.summary.target_domain}
                keyword={data.summary.target_keyword}
                location={data.summary.location}
              />
            </section>

            <section aria-label="Harita Paylaşım Takvimi">
              <GBPPostCalendar
                companyName={data.summary.company_name}
                keyword={data.summary.target_keyword}
                location={data.summary.location}
              />
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: EYLEM PLANI & DÖNÜŞÜM (CRO)                       */}
        {/* ======================================================== */}
        {(viewLayout === "all" || activeReportTab === "actions") && (
          <div id="sec-actions" className="space-y-6 animate-fade-in scroll-mt-20">
            {viewLayout === "all" && (
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 pt-4">
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-xs font-bold">
                  BÖLÜM 04
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Akıllı Eylem Planı & Dönüşüm (CRO) Denetimi
                </h3>
              </div>
            )}

            <section aria-label="Akıllı Eylem Tahtası">
              <ActionBoard
                actions={data.actions}
                onToggleAction={handleToggleAction}
              />
            </section>

            <section aria-label="Dönüşüm Denetimi">
              <CROAuditCard
                domain={data.summary.target_domain}
                companyName={data.summary.company_name}
                phone={data.summary.phone}
                hasWhatsApp={data.summary.has_whatsapp ?? true}
                hasQuoteForm={data.summary.has_quote_form ?? true}
              />
            </section>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: STRATEJİK BÜYÜME MİMARİSİ ŞEMASI                  */}
        {/* ======================================================== */}
        {(viewLayout === "all" || activeReportTab === "schema") && (
          <div id="sec-schema" className="space-y-6 animate-fade-in scroll-mt-20">
            {viewLayout === "all" && (
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 pt-4">
                <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-mono text-xs font-bold">
                  BÖLÜM 05
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Stratejik SEO & Yerel Büyüme Mimarisi Şeması
                </h3>
              </div>
            )}

            <section aria-label="Stratejik Büyüme Mimarisi Şeması">
              <StrategicArchitectureSchema
                companyName={data.summary.company_name}
                domain={data.summary.target_domain}
                targetKeyword={data.summary.target_keyword}
                location={data.summary.location}
              />
            </section>
          </div>
        )}
      </main>

      {/* Interactive Reviews Modal */}
      <ReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        domain={data.summary.target_domain}
        companyName={data.summary.company_name}
        reviewCount={targetSite.gbp_review_count}
        rating={targetSite.gbp_rating}
        competitorReviewCount={rivalLeader?.gbp_review_count || 142}
        competitors={data.competitors}
        initialRivalDomain={selectedRivalForReviews}
        initialTab={reviewsModalInitialTab}
        mapsAudit={data.maps_audit}
      />

      {/* Interactive Fix Assistant Modal */}
      <FixAssistantModal
        isOpen={isFixModalOpen}
        onClose={() => setIsFixModalOpen(false)}
        metricType={selectedFixMetric}
        domain={data.summary.target_domain}
        companyName={data.summary.company_name}
        location={data.summary.location}
        targetKeyword={data.summary.target_keyword}
        logoUrl={data.summary.logo_url}
        phone={data.summary.phone}
        address={data.summary.address}
      />

      {/* Interactive AI Content Generator Modal */}
      <AIContentGeneratorModal
        isOpen={isContentModalOpen}
        onClose={() => setIsContentModalOpen(false)}
        keyword={selectedContentKeyword}
        domain={data.summary.target_domain}
        companyName={data.summary.company_name}
        location={data.summary.location}
      />

      {/* Interactive Review Shield & QR Stand Modal */}
      <ReviewShieldModal
        isOpen={isReviewShieldModalOpen}
        onClose={() => setIsReviewShieldModalOpen(false)}
        domain={data.summary.target_domain}
        companyName={data.summary.company_name}
      />

      {/* Interactive Corporate Presentation & PDF Modal */}
      <CorporatePDFModal
        isOpen={isCorporatePdfModalOpen}
        onClose={() => setIsCorporatePdfModalOpen(false)}
        summary={data.summary}
        competitors={data.competitors}
        actions={data.actions}
        keywordRankings={data.keyword_rankings}
      />

      {/* Interactive Ready SEO Integration Package Modal */}
      <SEOPackageModal
        isOpen={isSEOPackageModalOpen}
        onClose={() => setIsSEOPackageModalOpen(false)}
        summary={data.summary}
        missingKeywordsGuide={data.missing_keywords_guide}
      />

      {/* Interactive Photo Geo-Tag & GPS Modal */}
      <GeoTagPhotoModal
        isOpen={isGeoTagModalOpen}
        onClose={() => setIsGeoTagModalOpen(false)}
        domain={data.summary.target_domain}
        companyName={data.summary.company_name}
        location={data.summary.location}
        keyword={data.summary.target_keyword}
      />

      {/* Interactive Local Silo & District Landing Page Modal */}
      <LocalSiloModal
        isOpen={isLocalSiloModalOpen}
        onClose={() => setIsLocalSiloModalOpen(false)}
        domain={data.summary.target_domain}
        companyName={data.summary.company_name}
        location={data.summary.location}
        keyword={data.summary.target_keyword}
      />

      {/* Quota Exceeded & Voucher Redemption Modal */}
      <QuotaExceededModal
        isOpen={isQuotaModalOpen}
        onClose={() => setIsQuotaModalOpen(false)}
        domain={quotaDomain || pendingSearchParams?.domain || data.summary.target_domain || ""}
        reason={quotaStatus && (quotaStatus.domainFreeRemaining ?? 2) <= 0 ? "DOMAIN_LIMIT_REACHED" : undefined}
        onCodeSuccess={handleCodeSuccess}
      />

      {/* Interactive Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl animate-fade-in border border-slate-800">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Dashboard Footer */}
      <footer className="no-print mt-12 border-t border-slate-200/80 bg-white py-6 text-center text-xs text-slate-500 font-medium">
        Google Sıralama © {new Date().getFullYear()} — Bu proje{" "}
        <a
          href="https://cloudmedya.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-indigo-600 hover:underline"
        >
          cloudmedya.com
        </a>{" "}
        tarafından geliştirilmiştir.
      </footer>
    </div>
  );
}

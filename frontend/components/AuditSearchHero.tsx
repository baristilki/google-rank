"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Globe,
  Hash,
  History,
  KeyRound,
  Loader2,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import { extractSiteKeywords, fetchQuotaStatus } from "@/lib/api";

export interface RecentSearchItem {
  domain: string;
  keyword: string;
  location: string;
}

const DEFAULT_RECENT_SITES: RecentSearchItem[] = [
  { domain: "istanbuluzmandent.com", keyword: "implant tedavisi", location: "Kadıköy / İstanbul" },
  { domain: "ankarahukukburosu.av.tr", keyword: "boşanma avukatı", location: "Çankaya / Ankara" },
  { domain: "bursayetkiliservis.com", keyword: "kombi klima servisi", location: "Nilüfer / Bursa" },
  { domain: "marmaranakliyat.com.tr", keyword: "evden eve nakliyat", location: "Ümraniye / İstanbul" },
  { domain: "egeklimaservis.com", keyword: "klima bakım onarım", location: "Konak / İzmir" },
];

interface AuditSearchHeroProps {
  onSearch: (params: {
    domain: string;
    keyword: string;
    location?: string;
    companyName?: string;
    voucherCode?: string;
  }) => Promise<void>;
  isSearching: boolean;
  isCentered?: boolean;
  quotaInfo?: {
    domainFreeRemaining?: number;
    domainFreeUsed?: number;
    ipFreeRemaining?: number;
    hasActiveVoucher?: boolean;
    voucherCredits?: number;
    isUnlimited?: boolean;
    activeVoucherCode?: string | null;
  } | null;
  onOpenCodeModal?: (domain?: string) => void;
  activeVoucherCode?: string;
}

// Popular Turkish Business Districts & Cities
const TURKISH_LOCATIONS: string[] = [
  "Kadıköy / İstanbul",
  "Başakşehir / İstanbul",
  "İkitelli OSB / İstanbul",
  "Şişli / İstanbul",
  "Beşiktaş / İstanbul",
  "Ümraniye / İstanbul",
  "Tuzla / İstanbul",
  "Bakırköy / İstanbul",
  "Kartal / İstanbul",
  "Pendik / İstanbul",
  "Esenyurt / İstanbul",
  "Ataşehir / İstanbul",
  "Sarıyer / İstanbul",
  "Maltepe / İstanbul",
  "Bağcılar / İstanbul",
  "Beylikdüzü / İstanbul",
  "Zeytinburnu / İstanbul",
  "Çankaya / Ankara",
  "Yenimahalle (OSTİM) / Ankara",
  "Keçiören / Ankara",
  "Etimesgut / Ankara",
  "Mamak / Ankara",
  "Sincan / Ankara",
  "Konak / İzmir",
  "Karşıyaka / İzmir",
  "Bornova / İzmir",
  "Çiğli (AOSB) / İzmir",
  "Bayraklı / İzmir",
  "Nilüfer / Bursa",
  "Osmangazi / Bursa",
  "Yıldırım / Bursa",
  "Selçuklu / Konya",
  "Karatay / Konya",
  "Muratpaşa / Antalya",
  "Kepez / Antalya",
  "Melikgazi / Kayseri",
  "Gebze / Kocaeli",
  "İzmit / Kocaeli",
  "Seyhan / Adana",
  "Şehitkamil / Gaziantep",
  "Odunpazarı / Eskişehir",
  "İlkadım / Samsun",
  "Ortahisar / Trabzon",
  "Pamukkale / Denizli",
];

const normalizeTr = (str: string) =>
  str
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();

export const AuditSearchHero: React.FC<AuditSearchHeroProps> = ({
  onSearch,
  isSearching,
  isCentered = false,
  quotaInfo,
  onOpenCodeModal,
  activeVoucherCode,
}) => {
  const [domain, setDomain] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [voucherCode, setVoucherCode] = useState<string>(activeVoucherCode || "");
  const [companyName, setCompanyName] = useState<string>("");
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [isExtractingKeywords, setIsExtractingKeywords] = useState<boolean>(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState<boolean>(false);
  const [scanStep, setScanStep] = useState<number>(0);
  const locationWrapperRef = useRef<HTMLDivElement>(null);

  // Sync active voucher code from props or localStorage
  useEffect(() => {
    if (activeVoucherCode) {
      setVoucherCode(activeVoucherCode);
    } else {
      try {
        const saved = localStorage.getItem("rankengine_voucher_code");
        if (saved) setVoucherCode(saved);
      } catch {}
    }
  }, [activeVoucherCode]);

  const scanSteps = [
    "Google SERP organik sıralaması taranıyor...",
    "Google Haritalar (Local 3-Pack) liderleri toplanıyor...",
    "Sayfa hızı (Core Web Vitals) ve Schema.org denetleniyor...",
    "Yapay Zeka eylem planı ve hazır kodlar üretiliyor...",
  ];

  // Close location dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationWrapperRef.current &&
        !locationWrapperRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-fetch keywords when user enters a domain
  const fetchKeywordsForDomain = async (targetDomain: string) => {
    if (!targetDomain || targetDomain.trim().length < 4 || !targetDomain.includes(".")) return;
    setIsExtractingKeywords(true);
    try {
      const kws = await extractSiteKeywords(targetDomain);
      setExtractedKeywords(kws);
      // If keyword input is currently empty, automatically select the 1st extracted keyword
      if (kws.length > 0 && !keyword.trim()) {
        setKeyword(kws[0]);
      }
    } finally {
      setIsExtractingKeywords(false);
    }
  };

  const handleDomainBlur = () => {
    if (domain.trim().length > 4 && domain.includes(".")) {
      fetchKeywordsForDomain(domain);
    }
  };

  const handleKeywordSelect = (kw: string) => {
    setKeyword(kw);
  };

  // Filter location matches for "Burası mı?" auto-suggest
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(DEFAULT_RECENT_SITES);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("rankengine_recent_searches");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed.slice(0, 5));
        }
      }
    } catch {}
  }, []);

  const locationQuery = normalizeTr(location);
  const matchedLocations =
    locationQuery.length >= 2
      ? TURKISH_LOCATIONS.filter((loc) => normalizeTr(loc).includes(locationQuery)).slice(0, 6)
      : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDom = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    if (!cleanDom) {
      alert("Lütfen analiz edilecek web sitesi adresini giriniz (Örn: firmaniz.com).");
      return;
    }

    // Smart Keyword Fallback if empty - NEVER silently block submission!
    let finalKeyword = keyword.trim();
    if (!finalKeyword) {
      if (extractedKeywords.length > 0) {
        finalKeyword = extractedKeywords[0];
      } else {
        const domainBase = cleanDom.replace(/^www\./, "").split(".")[0];
        finalKeyword = `${domainBase} hizmetleri`;
      }
      setKeyword(finalKeyword);
    }

    const finalLocation = location.trim() || "Kadıköy / İstanbul";
    const finalCode = (voucherCode || activeVoucherCode || "").trim().toUpperCase() || undefined;

    // QUOTA CHECK BEFORE SEARCHING:
    // "5 hak dolana kadar bu uyarısı vermesin haklar dolunca arama yapmadan uyarı versin sadece"
    try {
      const qStatus = await fetchQuotaStatus(cleanDom, finalCode);
      if (
        qStatus &&
        !qStatus.canSearch &&
        !qStatus.hasActiveVoucher &&
        (qStatus.domainFreeRemaining ?? 0) <= 0
      ) {
        if (onOpenCodeModal) {
          onOpenCodeModal(cleanDom);
        }
        return; // STOP! Arama yapmadan sadece uyarı modalını aç
      }
    } catch {}

    // Save domain to recent searches
    try {
      const current = localStorage.getItem("rankengine_recent_searches");
      let list = current ? JSON.parse(current) : [];
      list = [
        { domain: cleanDom, keyword: finalKeyword, location: finalLocation },
        ...list.filter((x: any) => x.domain !== cleanDom),
      ].slice(0, 6);
      localStorage.setItem("rankengine_recent_searches", JSON.stringify(list));
      setRecentSearches(list.slice(0, 5));
    } catch {}

    setScanStep(0);
    const interval = setInterval(() => {
      setScanStep((prev) => (prev < 3 ? prev + 1 : prev));
    }, 600);

    try {
      if (finalCode) {
        try {
          localStorage.setItem("rankengine_voucher_code", finalCode);
        } catch {}
      }
      await onSearch({
        domain: cleanDom,
        keyword: finalKeyword,
        location: finalLocation,
        companyName: companyName.trim() || undefined,
        voucherCode: finalCode,
      });
    } finally {
      clearInterval(interval);
      setScanStep(0);
    }
  };

  if (isCentered) {
    return (
      <div className="flex min-h-[78vh] flex-col items-center justify-center px-4 sm:px-6">
        <div className="w-full max-w-3xl text-center space-y-6">
          {/* Brand & Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-4 py-1.5 text-xs font-bold text-indigo-700 shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span>Google Sıralama &bull; Canlı SERP &amp; Yerel Rakip Analiz Platformu</span>
          </div>

          {/* Centered Big Headline */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              Müşterinizin Sitesini ve <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent">
                İlk 3 Rakibini
              </span>{" "}
              Canlı Analiz Edin
            </h1>
            <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-600 leading-relaxed">
              Domaini yazın; sitenizdeki anahtar kelimeleri listeleyelim, Google&apos;daki gerçek rakiplerinizi kıyaslayıp <strong>adım adım eylem planını</strong> çıkaralım.
            </p>
          </div>

          {/* Centered Search Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-indigo-100/50 text-left">
            {/* Quota Indicator Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 mb-4 border-b border-slate-100 text-xs">
              <div className="flex items-center space-x-2">
                {quotaInfo?.hasActiveVoucher || voucherCode ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>
                      {quotaInfo?.isUnlimited
                        ? "VIP Sınırsız Analiz Aktif"
                        : quotaInfo?.voucherCredits
                        ? `Paket Kredisi: ${quotaInfo.voucherCredits} Kalan`
                        : `Kupon Hazır: ${voucherCode}`}
                    </span>
                  </span>
                ) : quotaInfo && (quotaInfo.domainFreeRemaining ?? 5) <= 0 ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs">
                    <Lock className="w-3.5 h-3.5 text-rose-600" />
                    <span>Ücretsiz Hak Doldu (5/5)</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>
                      Kalan Ücretsiz Analiz: {quotaInfo ? quotaInfo.domainFreeRemaining : 5}/5
                    </span>
                  </span>
                )}
              </div>

              {onOpenCodeModal && (
                <button
                  type="button"
                  onClick={() => onOpenCodeModal(domain)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200"
                >
                  <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Kupon / Erişim Kodu Gir</span>
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                {/* Domain Input */}
                <div className="relative sm:col-span-6">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Globe className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    onBlur={handleDomainBlur}
                    placeholder="Web Sitesi Adresi (Örn: firmaniz.com)"
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-10 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => fetchKeywordsForDomain(domain)}
                    title="Sitedeki anahtar kelimeleri otomatik tara"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${isExtractingKeywords ? "animate-spin text-indigo-600" : ""}`}
                    />
                  </button>
                </div>

                {/* Keyword Input */}
                <div className="relative sm:col-span-6">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Hedef Kelime (Seçin veya yazın - Boşsa otomatik)"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-2xs"
                  />
                </div>
              </div>

              {/* Location Input with Smart "Burası mı?" Helper */}
              <div ref={locationWrapperRef} className="relative space-y-1.5 w-full">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={location}
                    onFocus={() => setShowLocationSuggestions(true)}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowLocationSuggestions(true);
                    }}
                    placeholder="Şehir / İlçe (Örn: Kadıköy / İstanbul - Boş bırakılırsa otomatik tespit edilir)"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-2xs"
                  />
                </div>

                {/* Intelligent "Burası mı?" Autocomplete Popup */}
                {showLocationSuggestions && matchedLocations.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 z-40 rounded-2xl border border-indigo-200 bg-white p-2.5 shadow-2xl animate-fade-in">
                    <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center text-indigo-700">
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                        Burası mı? (Tıklayarak otomatik doldurun)
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">Akıllı Lokasyon</span>
                    </div>

                    <div className="mt-1 space-y-0.5">
                      {matchedLocations.map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onMouseDown={() => {
                            setLocation(loc);
                            setShowLocationSuggestions(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-left rounded-xl hover:bg-indigo-50 text-xs font-semibold text-slate-800 hover:text-indigo-800 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3.5 w-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                            <span>{loc}</span>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md border border-indigo-100 opacity-90 group-hover:opacity-100">
                            Doldur ↵
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Popular Region Quick Click Chips */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                <span className="font-semibold text-slate-400">Hızlı Şehir:</span>
                {[
                  "Kadıköy / İstanbul",
                  "Çankaya / Ankara",
                  "Konak / İzmir",
                  "Nilüfer / Bursa",
                  "İkitelli OSB / İstanbul",
                ].map((quickLoc) => (
                  <button
                    key={quickLoc}
                    type="button"
                    onClick={() => setLocation(quickLoc)}
                    className="rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-transparent px-2 py-0.5 font-medium text-slate-600 transition-all cursor-pointer"
                  >
                    {quickLoc}
                  </button>
                ))}
              </div>

              {/* Advanced: Optional Exact Google Maps / Company Name */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                >
                  <span>{showAdvanced ? "− Harita İşletme Adı Seçeneğini Kapat" : "+ Google Haritalar profil isminiz farklıysa ekleyin (Opsiyonel)"}</span>
                </button>
                {showAdvanced && (
                  <div className="mt-2 rounded-2xl border border-indigo-100 bg-indigo-50/40 p-3 animate-fade-in">
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                      Google Haritalar Tam Profil Adı:
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Google Haritalar'daki tam işletme adınız (Örn: Uzman Diş Kliniği Kadıköy)"
                      className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none"
                    />
                    <span className="block text-[10px] text-slate-500 mt-1">
                      Domain adınız ile Google Haritalar profil isminiz farklıysa, harita puanı ve yorumların tam eşleşmesi için buraya yazabilirsiniz.
                    </span>
                  </div>
                )}
              </div>

              {/* Auto Extracted Keywords Section */}
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center space-x-1.5">
                    <Tag className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Siteden Tespit Edilen Anahtar Kelimeler:</span>
                  </span>
                  {isExtractingKeywords ? (
                    <span className="text-indigo-600 text-[11px] font-medium flex items-center">
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Sitedeki kelimeler taranıyor...
                    </span>
                  ) : keyword ? (
                    <span className="text-emerald-800 font-bold text-[11px] bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center">
                      <Check className="mr-1 h-3 w-3 text-emerald-700" /> Seçildi: &ldquo;{keyword}&rdquo;
                    </span>
                  ) : extractedKeywords.length > 0 ? (
                    <span className="text-amber-800 font-bold text-[11px] bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full animate-pulse">
                      👇 Kelimeye tıklayarak hedefi değiştirebilirsiniz
                    </span>
                  ) : null}
                </div>

                <p className="text-[11px] text-slate-500 mt-1">
                  Aşağıdaki kelimelerden birine tıklayarak hedef kelimeyi değiştirebilir veya aramak istediğiniz farklı bir kelimeyi kendiniz yazabilirsiniz.
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {extractedKeywords.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      Web sitesi adresinizi girdiğinizde sitenizdeki anahtar kelimeler ayıklanıp buraya listelenecektir...
                    </span>
                  ) : (
                    extractedKeywords.slice(0, 10).map((kw) => {
                      const isSelected = keyword.toLowerCase() === kw.toLowerCase();
                      return (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => handleKeywordSelect(kw)}
                          className={`inline-flex items-center space-x-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "border-2 border-indigo-600 bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200 scale-105"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/60"
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          ) : (
                            <Hash className="h-3 w-3 text-slate-400" />
                          )}
                          <span>{kw}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSearching}
                className="w-full inline-flex items-center justify-center space-x-2 rounded-2xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Canlı SERP ve Rakipler Taranıyor...</span>
                  </>
                ) : (
                  <>
                    <span>Analizi Başlat & Raporu Getir</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Live Progress Bar */}
            {isSearching && (
              <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 p-3.5 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-bold text-indigo-900">
                      <span>{scanSteps[scanStep]}</span>
                      <span>{scanStep + 1} / 4</span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-indigo-200 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${((scanStep + 1) / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Son Analiz Yapılan Siteler */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
            <span className="font-bold text-slate-600 flex items-center">
              <History className="w-3.5 h-3.5 mr-1 text-indigo-600" />
              Son Analiz Yapılan Siteler:
            </span>
            {recentSearches.map((site) => (
              <button
                key={site.domain}
                type="button"
                onClick={() => {
                  setDomain(site.domain);
                  setKeyword(site.keyword);
                  setLocation(site.location);
                }}
                title={`${site.domain} - ${site.keyword} (${site.location})`}
                className="inline-flex items-center space-x-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/80 hover:text-indigo-800 transition-all shadow-2xs cursor-pointer group"
              >
                <Globe className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                <span className="font-semibold">{site.domain}</span>
                <span className="text-[10px] text-slate-400 group-hover:text-indigo-500 font-normal">
                  ({site.keyword})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Compact Mode (inside report)
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm no-print">
      {/* Compact Quota Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 text-xs">
        <div className="flex items-center space-x-2">
          {quotaInfo?.hasActiveVoucher || voucherCode ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-[11px]">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>
                {quotaInfo?.isUnlimited
                  ? "VIP Sınırsız"
                  : quotaInfo?.voucherCredits
                  ? `${quotaInfo.voucherCredits} Kredi`
                  : `Kod: ${voucherCode}`}
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hak: {quotaInfo ? quotaInfo.domainFreeRemaining : 5}/5</span>
            </span>
          )}
        </div>

        {onOpenCodeModal && (
          <button
            type="button"
            onClick={() => onOpenCodeModal(domain)}
            className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 transition-colors cursor-pointer border border-indigo-200"
          >
            <KeyRound className="w-3 h-3 text-indigo-600" />
            <span>Kupon / Erişim Kodu Gir</span>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Globe className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="Web Sitesi (Örn: firmaniz.com)"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="relative flex-1 w-full">
          <Search className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Hedef Kelime (Boşsa otomatik)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="relative flex-1 w-full">
          <MapPin className="pointer-events-none absolute inset-y-0 left-3.5 my-auto h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Şehir / İlçe"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs font-semibold text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSearching}
          className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all disabled:opacity-70 whitespace-nowrap cursor-pointer"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Taranıyor...</span>
            </>
          ) : (
            <>
              <span>Yeniden Analiz Et</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

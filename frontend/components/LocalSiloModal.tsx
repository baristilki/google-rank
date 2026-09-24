"use client";

import React, { useState } from "react";
import {
  Building2,
  Check,
  ChevronRight,
  Code2,
  Copy,
  ExternalLink,
  Globe,
  Layers,
  MapPin,
  Navigation,
  Send,
  Sparkles,
  X,
} from "lucide-react";

interface LocalSiloModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  companyName: string;
  location: string;
  keyword: string;
}

export const LocalSiloModal: React.FC<LocalSiloModalProps> = ({
  isOpen,
  onClose,
  domain,
  companyName,
  location,
  keyword,
}) => {
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState<number>(0);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  if (!isOpen) return null;

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim();
  const domainBase = cleanDomain.split(".")[0];
  const cleanName = companyName && !companyName.startsWith("WWW") && !companyName.includes("Sanayi ve Ticaret")
    ? companyName
    : domainBase.charAt(0).toUpperCase() + domainBase.slice(1);

  // Generate top 5 districts based on city
  const loc = location.toLowerCase();
  let districts = [
    { name: "İkitelli Organize Sanayi (İOSB)", slug: "ikitelli", volume: "3.400 / ay", priority: "Çok Yüksek" },
    { name: "Tuzla Deri & Yan Sanayi", slug: "tuzla", volume: "2.800 / ay", priority: "Çok Yüksek" },
    { name: "Dudullu & Ümraniye Sanayi", slug: "dudullu-umraniye", volume: "2.100 / ay", priority: "Yüksek" },
    { name: "Hadımköy & Beylikdüzü Sanayi", slug: "hadimkoy", volume: "1.900 / ay", priority: "Yüksek" },
    { name: "Kadıköy & Kartal Bölgesi", slug: "anadolu-yakasi", volume: "1.400 / ay", priority: "Orta" },
  ];

  if (loc.includes("ankara")) {
    districts = [
      { name: "Ostim Sanayi Bölgesi", slug: "ostim", volume: "4.200 / ay", priority: "Çok Yüksek" },
      { name: "İvedik Organize Sanayi", slug: "ivedik", volume: "3.100 / ay", priority: "Çok Yüksek" },
      { name: "Sincan ASO 1. OSB", slug: "sincan", volume: "2.200 / ay", priority: "Yüksek" },
      { name: "Yenimahalle & Batıkent", slug: "yenimahalle", volume: "1.600 / ay", priority: "Orta" },
      { name: "Çankaya Bölgesi", slug: "cankaya", volume: "1.300 / ay", priority: "Orta" },
    ];
  } else if (loc.includes("izmir")) {
    districts = [
      { name: "Çiğli Atatürk OSB (İAOSB)", slug: "cigli-aosb", volume: "3.800 / ay", priority: "Çok Yüksek" },
      { name: "Bornova & Pınarbaşı Sanayi", slug: "bornova", volume: "2.900 / ay", priority: "Çok Yüksek" },
      { name: "Kemalpaşa OSB (KOSBI)", slug: "kemalpasa", volume: "2.400 / ay", priority: "Yüksek" },
      { name: "Gaziemir & Ege Serbest Bölge", slug: "gaziemir", volume: "1.700 / ay", priority: "Yüksek" },
      { name: "Karabağlar Bölgesi", slug: "karabaglar", volume: "1.100 / ay", priority: "Orta" },
    ];
  } else if (loc.includes("bursa")) {
    districts = [
      { name: "Nilüfer OSB (NOSAB)", slug: "nilufer-nosab", volume: "3.600 / ay", priority: "Çok Yüksek" },
      { name: "Demirtaş OSB (DOSAB)", slug: "dosab", volume: "2.700 / ay", priority: "Çok Yüksek" },
      { name: "Bursa OSB (BTSO)", slug: "bursa-osb", volume: "2.500 / ay", priority: "Yüksek" },
      { name: "Çalı Sanayi Bölgesi", slug: "cali", volume: "1.800 / ay", priority: "Orta" },
      { name: "Osmangazi Bölgesi", slug: "osmangazi", volume: "1.200 / ay", priority: "Orta" },
    ];
  }

  const activeDistrict = districts[selectedDistrictIndex] || districts[0];

  const pageUrl = `https://${cleanDomain}/hizmetler/${activeDistrict.slug}-${keyword.toLowerCase().replace(/\s+/g, "-")}`;
  const pageTitle = `<title>${activeDistrict.name} ${keyword.toUpperCase()} | ${cleanName}</title>`;
  const pageH1 = `<h1>${activeDistrict.name} Bölgesinde Profesyonel ${keyword} Çözümleri</h1>`;
  const metaDescription = `<meta name="description" content="${cleanName}, ${activeDistrict.name} ve çevresinde profesyonel ${keyword} hizmetleri sunmaktadır. Hızlı teslimat, şeffaf fiyatlandırma ve garantili işçilik için hemen teklif alın.">`;

  const pageContentHtml = `<section class="local-seo-landing">
  <h2>${activeDistrict.name} İçin Neden ${cleanName}?</h2>
  <p>${cleanName} olarak ${activeDistrict.name} sanayi ve ticaret bölgesindeki işletmelere doğrudan hızlı lojistik avantajı ve yerinde teknik destek sağlıyoruz.</p>
  <ul>
    <li><strong>Hızlı Sevkiyat:</strong> ${activeDistrict.name} bölgesine aynı gün veya 24 saat içinde teslimat imkanı.</li>
    <li><strong>Sektörel Standartlar:</strong> Yüksek kalite kontrol ve sertifikalı süreç güvencesi.</li>
    <li><strong>Doğrudan İletişim:</strong> Aracı olmadan doğrudan teknik ekibimizle 15 dakikada fiyat teklifi.</li>
  </ul>
</section>`;

  const schemaJsonLd = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${cleanName} - ${activeDistrict.name}",
  "url": "${pageUrl}",
  "telephone": "+90 212 555 0199",
  "priceRange": "$$",
  "areaServed": {
    "@type": "AdministrativeArea",
    "name": "${activeDistrict.name}, ${location}"
  },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "${activeDistrict.name}",
    "addressRegion": "${location}",
    "addressCountry": "TR"
  }
}
</script>`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  İlçe &amp; Lokasyon Bazlı Yerel SEO Mimarisi (Local Silo)
                </h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                  Şehir Hakimiyeti
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tek ana sayfa yerine çevre ilçelere ve sanayi sitelerine özel sayfalar açarak Google 1. sayfadaki sıralama hacminizi 5 katına çıkarın.
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

        {/* Modal Body */}
        <div className="max-h-[72vh] overflow-y-auto p-6 space-y-6">
          {/* Strategy Tip */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 space-y-1.5">
            <div className="flex items-center space-x-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Neden İlçe ve Sanayi Sitesi Sayfaları Açmalısınız?</span>
            </div>
            <p className="text-xs text-blue-950 leading-relaxed">
              Google arama verilerine göre müşterilerin <strong>%64&apos;ü</strong> doğrudan kendi ilçesini veya sanayi sitesini aratarak firma bulur (Örn: <em>&ldquo;İkitelli metal kaplama&rdquo;</em>). Web sitenizde bu bölgelere özel optimize edilmiş alt sayfalar açtığınızda Google rakiplerinizin önüne sizi yerleştirir.
            </p>
          </div>

          {/* District Switcher Tabs */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Hedef Sanayi Siteleri &amp; İlçe Lokasyonları ({location})
            </span>

            <div className="flex flex-wrap gap-2">
              {districts.map((dist, idx) => (
                <button
                  key={dist.slug}
                  onClick={() => setSelectedDistrictIndex(idx)}
                  className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedDistrictIndex === idx
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{dist.name}</span>
                  <span className="rounded bg-white/20 px-1.5 py-0.2 text-[10px]">
                    {dist.volume}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active District Landing Page Package */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Seçili Bölge Açılış Sayfası (Landing Page)
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {activeDistrict.name} İçin Hazır SEO Paketi
                </h4>
              </div>

              <button
                onClick={() =>
                  handleCopy(
                    `${pageTitle}\n${pageH1}\n${metaDescription}\n\n${pageContentHtml}\n\n${schemaJsonLd}`,
                    "all"
                  )
                }
                className="inline-flex items-center space-x-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copiedType === "all" ? "Tüm Paket Kopyalandı!" : "Tüm Kodları Kopyala"}</span>
              </button>
            </div>

            {/* URL & Head Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                  <span>Önerilen URL Yapısı</span>
                  <button
                    onClick={() => handleCopy(pageUrl, "url")}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {copiedType === "url" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <div className="text-xs font-mono text-slate-800 truncate" title={pageUrl}>
                  {pageUrl}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                  <span>Title (Sayfa Başlığı)</span>
                  <button
                    onClick={() => handleCopy(pageTitle, "title")}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {copiedType === "title" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <div className="text-xs font-mono text-slate-800 truncate" title={pageTitle}>
                  {pageTitle}
                </div>
              </div>
            </div>

            {/* H1 & Meta Description */}
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                  <span>H1 Ana Başlık</span>
                  <button
                    onClick={() => handleCopy(pageH1, "h1")}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {copiedType === "h1" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {pageH1}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase">
                  <span>Meta Description</span>
                  <button
                    onClick={() => handleCopy(metaDescription, "meta")}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    {copiedType === "meta" ? "Kopyalandı" : "Kopyala"}
                  </button>
                </div>
                <div className="text-xs text-slate-600 leading-relaxed">
                  {metaDescription}
                </div>
              </div>
            </div>

            {/* LocalBusiness Schema Code */}
            <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-xs font-mono text-emerald-400 space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans font-bold uppercase">
                <span className="flex items-center space-x-1.5">
                  <Code2 className="h-4 w-4 text-indigo-400" />
                  <span>Bu Bölgeye Özel JSON-LD Şema Kodu</span>
                </span>
                <button
                  onClick={() => handleCopy(schemaJsonLd, "schema")}
                  className="text-indigo-300 hover:text-white cursor-pointer"
                >
                  {copiedType === "schema" ? "Şema Kopyalandı!" : "Kodu Kopyala"}
                </button>
              </div>

              <pre className="overflow-x-auto whitespace-pre leading-relaxed text-[11.5px]">
                {schemaJsonLd}
              </pre>
            </div>
          </div>
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

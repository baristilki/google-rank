"use client";

import React, { useState } from "react";
import {
  Check,
  Code,
  Copy,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import { MissingKeywordsGuide, SummaryMetrics } from "@/lib/types";

interface SEOPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SummaryMetrics;
  missingKeywordsGuide?: MissingKeywordsGuide;
}

export const SEOPackageModal: React.FC<SEOPackageModalProps> = ({
  isOpen,
  onClose,
  summary,
  missingKeywordsGuide,
}) => {
  const [activeTab, setActiveTab] = useState<"all" | "meta" | "schema" | "accordion" | "robots">("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const domain = summary.target_domain;
  const companyName = summary.company_name;
  const keyword = summary.target_keyword;
  const location = summary.location;

  // File 1: Head SEO Meta Tags
  const fileHeadMeta = `<!-- ======================================================== -->
<!-- GOOGLE SIRALAMA - ON-PAGE SEO & HEAD META ETİKETLERİ     -->
<!-- Domain: ${domain} | Hedef: ${keyword} | ${location}       -->
<!-- Geliştirici: cloudmedya.com                              -->
<!-- ======================================================== -->
<title>${missingKeywordsGuide?.implementation_tips?.title_example || `${companyName} | ${keyword.toUpperCase()} - ${location}`}</title>
<meta name="description" content="${missingKeywordsGuide?.implementation_tips?.meta_example || `${companyName}, ${location} bölgesinde profesyonel ${keyword} hizmetleri sunar. Hızlı teklif ve uzman destek için tıklayın.`}">
<meta name="keywords" content="${missingKeywordsGuide?.recommended_keywords ? missingKeywordsGuide.recommended_keywords.map((k) => k.keyword).join(", ") : `${keyword}, ${keyword} fiyatları, ${location} ${keyword}`}">
<link rel="canonical" href="https://${domain}/">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">

<!-- OpenGraph / Sosyal Medya Kartları -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://${domain}/">
<meta property="og:title" content="${companyName} | ${keyword.toUpperCase()}">
<meta property="og:description" content="${location} bölgesinde güvenilir ${keyword} ve kurumsal çözümler.">
<meta property="og:locale" content="tr_TR">`;

  // File 2: Schema.org JSON-LD
  const fileSchemaJson = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://${domain}/#organization",
      "name": "${companyName}",
      "url": "https://${domain}",
      "telephone": "${summary.phone || "+90 212 555 0100"}",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "${summary.address || "Merkez Mah."}",
        "addressLocality": "${location.split("/")[0]?.trim() || "İstanbul"}",
        "addressCountry": "TR"
      },
      "areaServed": {
        "@type": "AdministrativeArea",
        "name": "${location}"
      }
    },
    {
      "@type": "FAQPage",
      "@id": "https://${domain}/#faq",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "${keyword} hizmet teslimat süreniz nedir?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "${companyName} olarak tüm talepleriniz için aynı gün ön değerlendirme ve en hızlı sürede teslimat garantisi sağlıyoruz."
          }
        },
        {
          "@type": "Question",
          "name": "${keyword} fiyat teklifi nasıl alabilirim?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Web sitemizdeki iletişim formu, WhatsApp hattımız veya telefon numaramız üzerinden 30 saniyede ücretsiz fiyat teklifi alabilirsiniz."
          }
        }
      ]
    }
  ]
}
</script>`;

  // File 3: Non-intrusive details accordion
  const fileAccordionHtml = `<!-- ======================================================== -->
<!-- GOOGLE SIRALAMA - TASARIMI BOZMAYAN KATLANABİLİR İÇERİK  -->
<!-- Bu kodu sitenizin <footer> etiketinin hemen üstüne koyun. -->
<!-- Ekranda yalnızca 1 satır kaplar, Google %100 indeksler!  -->
<!-- ======================================================== -->
<details style="max-width: 1000px; margin: 30px auto; padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fafafa; font-family: system-ui, -apple-system, sans-serif;">
  <summary style="font-weight: 700; font-size: 14px; color: #334155; cursor: pointer; outline: none; user-select: none;">
    📌 ${companyName} - ${keyword} Hizmet Kapsamı ve Sıkça Sorulan Sorular (Detaylar İçin Tıklayın)
  </summary>
  <div style="padding-top: 16px; font-size: 13.5px; color: #475569; line-height: 1.7; border-top: 1px solid #eee; margin-top: 12px;">
    <h2>${keyword.toUpperCase()} Hizmetlerimiz ve Kalite Standartlarımız</h2>
    <p>
      İşletmemiz <strong>${companyName}</strong>, ${location} genelinde <strong>${keyword}</strong> alanında uzman kadrosu ile profesyonel çözümler sunmaktadır. 
      Süreçlerimizde müşteri memnuniyeti, şeffaf fiyatlandırma ve zamanında teslimat prensipleriyle hareket ediyoruz.
    </p>
    <h3>Sıkça Sorulan Sorular (SSS)</h3>
    <p><strong>Soru:</strong> Fiyat teklifi alma süreci nasıl işler?</p>
    <p><strong>Cevap:</strong> İletişim kanallarımızdan bize ulaştığınızda projenize özel teklif hazırlanarak aynı gün iletilir.</p>
  </div>
</details>`;

  // File 4: Robots.txt & Sitemap Guide
  const fileRobotsTxt = `# ========================================================
# GOOGLE SIRALAMA - ÖNERİLEN ROBOTS.TXT & SITEMAP YAPILANDIRMASI
# Domain: https://${domain}
# ========================================================

User-agent: *
Allow: /

# Googlebot için özel optimizasyon
User-agent: Googlebot
Allow: /

# Dinamik Site Haritası Konumu
Sitemap: https://${domain}/sitemap.xml
`;

  // Master All-in-One file with clear dividers
  const masterPackage = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <title>${companyName} - Hazır SEO Entegrasyon Paketi</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; line-height: 1.6; color: #1e293b; }
    h1 { color: #4338ca; border-bottom: 2px solid #e0e7ff; padding-bottom: 10px; }
    h2 { color: #0f172a; margin-top: 30px; }
    pre { background: #0f172a; color: #38bdf8; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 13px; }
    .note { background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; margin: 15px 0; border-radius: 4px; font-size: 13px; color: #065f46; }
  </style>
</head>
<body>
  <h1>Google Sıralama &bull; Hazır SEO Entegrasyon Paketi</h1>
  <p><strong>İşletme:</strong> ${companyName} (${domain}) | <strong>Hedef:</strong> ${keyword} (${location})</p>
  <p><strong>Geliştirici:</strong> <a href="https://cloudmedya.com">cloudmedya.com</a></p>
  <div class="note">
    Bu dosya, web sitenizin Google'da 1. sayfaya ve Google Haritalar Local 3-Pack kutusuna yükselmesi için gerekli olan tüm hazır kodları içerir. Kodları sırasıyla sitenize yerleştirin.
  </div>

  <h2>1. Adım: &lt;head&gt; Meta Etiketleri</h2>
  <p>Aşağıdaki bloğu sitenizin <code>&lt;head&gt; ... &lt;/head&gt;</code> etiketleri arasına yapıştırın:</p>
  <pre><code>${fileHeadMeta.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>

  <h2>2. Adım: Schema.org Yapılandırılmış Veri (Ziyaretçiye Görünmez)</h2>
  <p>Aşağıdaki JSON-LD kodunu da yine <code>&lt;head&gt;</code> arasına yapıştırın. Sitede yazı çıkmaz, Google botu tüm soru ve bilgileri okur:</p>
  <pre><code>${fileSchemaJson.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>

  <h2>3. Adım: Tasarımı Bozmayan Katlanabilir İçerik</h2>
  <p>Aşağıdaki akordeon kodunu sayfanızın en altına (<code>&lt;footer&gt;</code> üstüne) yapıştırın:</p>
  <pre><code>${fileAccordionHtml.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>

  <h2>4. Adım: Robots.txt Yapılandırması</h2>
  <pre><code>${fileRobotsTxt.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>

  <footer style="margin-top: 50px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px;">
    Google Sıralama &copy; ${new Date().getFullYear()} &bull; Bu paket cloudmedya.com tarafından üretilmiştir.
  </footer>
</body>
</html>`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadFile = (content: string, filename: string, mimeType: string = "text/html") => {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <FolderArchive className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Hazır SEO Entegrasyon Paketi (Webmaster Paketi)
                </h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  Tek Tıkla İndir
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {domain} için optimize edilmiş tüm Title, Meta, Schema ve Akordeon kodları hazır paket halinde.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleDownloadFile(masterPackage, `seo-paketi-${domain}.html`)}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Tüm Paketi İndir (.html)</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 pt-3 bg-white overflow-x-auto">
          <div className="flex space-x-4 sm:space-x-6 shrink-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "all"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Paket Genel Özeti</span>
            </button>

            <button
              onClick={() => setActiveTab("meta")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "meta"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileCode className="h-3.5 w-3.5 text-indigo-600" />
              <span>1. Head Meta Kodları</span>
            </button>

            <button
              onClick={() => setActiveTab("schema")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "schema"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Code className="h-3.5 w-3.5 text-emerald-600" />
              <span>2. Schema JSON-LD</span>
            </button>

            <button
              onClick={() => setActiveTab("accordion")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "accordion"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>3. Akordeon İçerik</span>
            </button>

            <button
              onClick={() => setActiveTab("robots")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "robots"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>4. Robots.txt</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="max-h-[72vh] overflow-y-auto p-6 space-y-5">
          {activeTab === "all" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs text-indigo-900 leading-relaxed">
                <div className="flex items-center space-x-2 font-bold mb-1 text-sm text-indigo-950">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Webmaster veya Yazılımcınıza Tek Tıkla İletin</span>
                </div>
                <p>
                  Bu pakette yer alan dosyalar, web sitenizin Google arama motorundaki tüm eksiklerini kapatmak için hazırlanmıştır. 
                  Yukarıdaki <strong>&ldquo;Tüm Paketi İndir (.html)&rdquo;</strong> butonuna basarak dosyayı indirebilir ve sitenizi yöneten ajansa/yazılımcıya doğrudan gönderebilirsiniz.
                </p>
              </div>

              {/* 4 Files Checklist Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <FileCode className="h-4 w-4 text-indigo-600" />
                      <span>1_head_seo_meta.html</span>
                    </span>
                    <button
                      onClick={() => handleCopy(fileHeadMeta, "m1")}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] cursor-pointer"
                    >
                      {copiedKey === "m1" ? "Kopyalandı!" : "Kopyala"}
                    </button>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Title, CTR odaklı Meta Description ve OpenGraph sosyal etiketleri.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <Code className="h-4 w-4 text-emerald-600" />
                      <span>2_schema_jsonld.json</span>
                    </span>
                    <button
                      onClick={() => handleCopy(fileSchemaJson, "m2")}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] cursor-pointer"
                    >
                      {copiedKey === "m2" ? "Kopyalandı!" : "Kopyala"}
                    </button>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    LocalBusiness ve FAQPage yapılandırılmış verisi (Sitede görünmez, Google okur).
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <span>3_akordeon_icerik.html</span>
                    </span>
                    <button
                      onClick={() => handleCopy(fileAccordionHtml, "m3")}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] cursor-pointer"
                    >
                      {copiedKey === "m3" ? "Kopyalandı!" : "Kopyala"}
                    </button>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Sitenin görselini bozmayan, footer üstünde kapalı duran 600 kelimelik zengin içerik.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <FileSpreadsheet className="h-4 w-4 text-amber-600" />
                      <span>4_robots_ve_sitemap.txt</span>
                    </span>
                    <button
                      onClick={() => handleCopy(fileRobotsTxt, "m4")}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] cursor-pointer"
                    >
                      {copiedKey === "m4" ? "Kopyalandı!" : "Kopyala"}
                    </button>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Googlebot tarayıcı izinleri ve XML site haritası bildirim satırları.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "meta" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Web sitenizin &lt;head&gt; ... &lt;/head&gt; etiketleri arasına yapıştırın:
                </span>
                <button
                  onClick={() => handleCopy(fileHeadMeta, "meta-tab")}
                  className="inline-flex items-center space-x-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedKey === "meta-tab" ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
              </div>
              <pre className="rounded-2xl bg-slate-900 p-4 text-[11px] font-mono leading-relaxed text-indigo-200 overflow-x-auto">
                <code>{fileHeadMeta}</code>
              </pre>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  &lt;head&gt; arasına ekleyin (Ziyaretçiye tamamen görünmez, sıfır risk):
                </span>
                <button
                  onClick={() => handleCopy(fileSchemaJson, "schema-tab")}
                  className="inline-flex items-center space-x-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedKey === "schema-tab" ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
              </div>
              <pre className="rounded-2xl bg-slate-900 p-4 text-[11px] font-mono leading-relaxed text-emerald-300 overflow-x-auto">
                <code>{fileSchemaJson}</code>
              </pre>
            </div>
          )}

          {activeTab === "accordion" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Sayfa tasarımını bozmadan eklemek için sayfanın en altına (&lt;footer&gt; üstüne) yapıştırın:
                </span>
                <button
                  onClick={() => handleCopy(fileAccordionHtml, "acc-tab")}
                  className="inline-flex items-center space-x-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedKey === "acc-tab" ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
              </div>
              <pre className="rounded-2xl bg-slate-900 p-4 text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto">
                <code>{fileAccordionHtml}</code>
              </pre>
            </div>
          )}

          {activeTab === "robots" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Sunucunuzun ana dizinindeki <code>robots.txt</code> dosyasına ekleyin:
                </span>
                <button
                  onClick={() => handleCopy(fileRobotsTxt, "robots-tab")}
                  className="inline-flex items-center space-x-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedKey === "robots-tab" ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
              </div>
              <pre className="rounded-2xl bg-slate-900 p-4 text-[11px] font-mono leading-relaxed text-amber-200 overflow-x-auto">
                <code>{fileRobotsTxt}</code>
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5">
          <span className="text-xs text-slate-500">
            Google Sıralama &bull; Bu paket <strong>cloudmedya.com</strong> tarafından geliştirilmiştir.
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

"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileCode,
  Gauge,
  HelpCircle,
  Layers,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Type,
  X,
  Zap,
} from "lucide-react";

export type FixMetricType =
  | "schema"
  | "speed"
  | "reviews"
  | "word_count"
  | "authority"
  | "indexed_pages";

interface FixAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  metricType: FixMetricType | null;
  domain: string;
  companyName: string;
  location?: string;
  targetKeyword?: string;
  logoUrl?: string;
  phone?: string;
  address?: string;
}

export const FixAssistantModal: React.FC<FixAssistantModalProps> = ({
  isOpen,
  onClose,
  metricType,
  domain,
  companyName,
  location = "İstanbul",
  targetKeyword = "metal kaplama",
  logoUrl,
  phone,
  address,
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!isOpen || !metricType) return null;

  const resolvedLogo = logoUrl || `https://${domain}/logo.png`;
  const resolvedPhone = phone || "+90 212 555 0199";
  const resolvedAddress = address || `İkitelli Organize Sanayi Bölgesi, ${location}`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Metrik tipine göre dinamik rehber içeriği
  const getGuideData = () => {
    switch (metricType) {
      case "schema":
        return {
          title: "Schema.org LocalBusiness Kodunu Sitenize Ekleyin",
          icon: <FileCode className="h-5 w-5 text-indigo-600" />,
          category: "Teknik SEO & Zengin Sonuçlar",
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
          summary:
            "Google arama botları sitenizin bir yerel sanayi işletmesi olduğunu, gerçek logonuzu, adresinizi ve iletişim numaranızı bu Schema.org JSON-LD kodları sayesinde %100 kesinlikle anlar. Sitenizden çekilen güncel kurumsal verilerle hazırlandı:",
          steps: [
            "Aşağıdaki firmanıza özel üretilmiş JSON-LD script kodunu kopyalayın.",
            "Web sitenizin ana şablonundaki <head>...</head> etiketlerinin arasına yapıştırın.",
            "Eğer WordPress kullanıyorsanız: 'RankMath', 'Yoast SEO' eklentisinden veya 'WPCode / Insert Headers and Footers' eklentisiyle ekleyin.",
            "Google Zengin Sonuçlar Testi (Rich Results Test) aracına sitenizi yazıp yeşil onay aldığınızı doğrulayın.",
          ],
          codeSnippet: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "${companyName}",
  "image": "${resolvedLogo}",
  "@id": "https://${domain}",
  "url": "https://${domain}",
  "telephone": "${resolvedPhone}",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "${resolvedAddress}",
    "addressLocality": "${location}",
    "addressRegion": "TR",
    "addressCountry": "TR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.0682,
    "longitude": 28.8012
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ],
    "opens": "08:30",
    "closes": "18:30"
  }
}
</script>`,
          testToolUrl: "https://search.google.com/test/rich-results",
          testToolLabel: "Google Zengin Sonuçlar Test Aracını Aç",
        };

      case "speed":
        return {
          title: "Mobil Hızı (LCP) ve Core Web Vitals Skorunu Yükseltin",
          icon: <Gauge className="h-5 w-5 text-rose-600" />,
          category: "Performans & Kullanıcı Deneyimi",
          badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
          summary:
            "Mobil hız skorunuz 34/100 seviyesindedir. Google, mobil aramalarda geç açılan sitelerin sıralamasını doğrudan düşürür. Rakiplerinizin ortalaması 79/100'dür.",
          steps: [
            "Sitenizdeki büyük PNG ve JPEG fabrika/ürün fotoğraflarını TinyPNG veya Squoosh ile WebP formatına çevirin (%70 boyut kazancı).",
            "Hero banner görseline 'fetchpriority=\"high\"' ekleyerek LCP (En Büyük İçerikli Boyama) süresini 1.8 saniyenin altına indirin.",
            "Harici JavaScript kütüphanelerini 'defer' veya 'async' özelliğiyle yükleyerek ana sayfa engellemesini kaldırın.",
            "Sunucunuzda Gzip / Brotli sıkıştırmasını ve Tarayıcı Önbelleğe Alma (Browser Caching) kurallarını aktif edin.",
          ],
          codeSnippet: `<!-- .htaccess veya Nginx için Görsel ve Varlık Önbellekleme Örneği -->
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>`,
          testToolUrl: `https://pagespeed.web.dev/analysis?url=https://${domain}`,
          testToolLabel: "Canlı Google PageSpeed Testini Başlat",
        };

      case "reviews":
        return {
          title: "Google Haritalar (GBP) Yorum Açığını Kapatma Stratejisi",
          icon: <MessageSquare className="h-5 w-5 text-amber-600" />,
          category: "Yerel Harita SEO (Local 3-Pack)",
          badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
          summary:
            "Harita lideri rakip 142 yoruma sahipken sizde 14 yorum bulunmaktadır. Google Haritalar Local 3-Pack kutusunda ilk 3 sıraya girmenin en büyük faktörü (%32 ağırlık) güncel ve bol anahtar kelimeli yorumlardır.",
          steps: [
            "Google İşletme Profilinize (GBP) giriş yapın ve 'Yorum iste' kısa bağlantınızı kopyalayın.",
            "Faturası kesilen veya siparişi teslim edilen her kurumsal müşterinize WhatsApp üzerinden teşekkür ve yorum bağlantısı iletin.",
            "Müşterilerin yorumlarında 'metal kaplama', 'hızlı teslimat' gibi kelimeleri geçirmesini rica edin (harita sıralamasını uçurur).",
            "Gelen her yoruma (olumlu veya olumsuz) işletme sahibi olarak 24 saat içinde profesyonel ve sektörel kelimelerle yanıt verin.",
          ],
          codeSnippet: `WhatsApp Müşteri Şablonu:
"Sayın müşterimiz, ${companyName} ile çalıştığınız için teşekkür ederiz. 
İş teslimatımızı ve kaplama kalitemizi değerlendirmek için 30 saniyenizi ayırıp Google profilimize puan verir misiniz?
[BURAYA_GOOGLE_KISA_BAGLANTINIZI_YAPISTIRIN]"`,
          testToolUrl: "https://business.google.com",
          testToolLabel: "Google İşletme Profilini Aç",
        };

      case "word_count":
        return {
          title: "Sayfa İçerik Hacmini Artırın ve Eksik Konuları Ekleyin",
          icon: <Type className="h-5 w-5 text-indigo-600" />,
          category: "İçerik Stratejisi & Semantik SEO",
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
          summary:
            "Sitenizde 390 kelime varken ilk 3 rakip ortalama 1.380 kelimelik teknik rehberler sunuyor. Google, sektörel sorulara derinlemesine yanıt veren kapsamlı sayfaları ödüllendirir.",
          steps: [
            "Ana sayfanıza ve hizmet sayfalarınıza '${targetKeyword}' süreci, standartlar ve uygulama alanları hakkında en az 600 kelimelik özgün metin ekleyin.",
            "Rakiplerinizin sık kullandığı 'eloksal', 'kataforez', 'korozyon dayanımı', 'mikron toleransı' terimlerini doğal şekilde cümle içinde geçirin.",
            "Sayfanın en altına 4 maddelik Sıkça Sorulan Sorular (SSS) bölümü ekleyin ve FAQPage şemasıyla işaretleyin.",
            "Alt başlıkları (H2 ve H3) soru kalıplarıyla yapılandırın (örn: 'Metal Kaplama Ne Kadar Dayanır?').",
          ],
          codeSnippet: `Önerilen İçerik Hiyerarşisi (H2 ve H3):
- H1: ${companyName} | Profesyonel ${targetKeyword.toUpperCase()} Çözümleri
- H2: ${targetKeyword.toUpperCase()} Standartları ve Mikron Hassasiyeti
- H2: Korozyon ve Tuz Sisi Dayanım Testleri
- H2: Hangi Sektörlere Hizmet Veriyoruz? (Otomotiv, Makine, Savunma)
- H2: Sıkça Sorulan Sorular (SSS)`,
          testToolUrl: "https://trends.google.com",
          testToolLabel: "Google Trends'te Popüler Aramaları Gör",
        };

      case "authority":
        return {
          title: "Domain Otoritesini (DA / PR Skoru) Güçlendirme Adımları",
          icon: <Award className="h-5 w-5 text-indigo-600" />,
          category: "Alan Adı Gücü & Backlink Sinyalleri",
          badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
          summary:
            "Domain Otoriteniz 26/100 iken rakip lider 68/100 güç puanına sahiptir. Domain Yaşı, güvenli SSL, köklü sanayi rehberleri ve sektörel backlinkler ile bu açık kapatılır.",
          steps: [
            "Sanayi Odası (İSO/İTO), Organize Sanayi Bölgesi (OSB) ve sektörel derneklerin resmi web sitelerindeki üye dizinlerine firmanızı ekleyin.",
            "Türkiye'nin güvenilir yerel firma rehberlerinde (YellowPages, Bulurum vb.) aynı şirket adı, adres ve telefon (NAP) ile profil oluşturun.",
            "Sektörel haber sitelerine veya dergilere röportaj / basın bülteni vererek sitenize kaliteli kurumsal bağlantı kazandırın.",
            "Google İşletme Profili, LinkedIn ve kurumsal sosyal medya hesaplarınızdan web sitenize aktif bağlantı verin.",
          ],
          codeSnippet: `Kontrol Listesi (NAP Tutarlılığı):
1. Kurumsal Firma Adı: ${companyName}
2. Tam Açık Adres: Sanayi Sitesi, ${location}
3. Telefon: +90 212 555 0199
4. Web Sitesi: https://${domain}
(Tüm rehber ve harita kayıtlarında noktalama işaretine kadar birebir aynı olmalıdır!)`,
          testToolUrl: "https://www.google.com/search?q=" + encodeURIComponent(`site:${domain}`),
          testToolLabel: "Google'daki İndeks Durumunuzu Kontrol Edin",
        };

      case "indexed_pages":
        return {
          title: "Google İndeks Sayısını Artırma ve Alt Hizmet Sayfaları Açma",
          icon: <Layers className="h-5 w-5 text-emerald-600" />,
          category: "Site Mimarisi & Dizinleme",
          badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
          summary:
            "Sitenizde Google'da dizine eklenmiş yalnızca 14 sayfa var; rakiplerde ise 420+ sayfa bulunuyor. Her bir kaplama türü için ayrı alt hizmet sayfası açarak indeks hacminizi katlayabilirsiniz.",
          steps: [
            "Tek bir 'Hizmetlerimiz' sayfası yerine her işlem için ayrı URL oluşturun (örn: /eloksal-kaplama, /cinko-kaplama, /nikelaj-kaplama).",
            "Sitenizin 'sitemap.xml' (Site Haritası) dosyasını oluşturun ve Google Search Console'a gönderin.",
            "İç bağlantı (Internal Linking) yapısı kurarak ana sayfadan tüm alt hizmet sayfalarına menüden ve metin içinden link verin.",
            "Google Search Console'da 'URL Denetimi' aracını kullanarak yeni sayfalarınızın indekslenmesini talep edin.",
          ],
          codeSnippet: `Önerilen Site Haritası Sayfa Mimarisi:
https://${domain}/
├── /hizmetler/
│   ├── /eloksal-kaplama
│   ├── /kataforez-kaplama
│   ├── /cinko-nikel-kaplama
│   └── /korozyon-testleri
├── /sektorler/ (Otomotiv, Beyaz Eşya, Havacılık)
└── /blog-rehber/ (Doğru Kaplama Seçimi Nasıl Yapılır?)`,
          testToolUrl: "https://search.google.com/search-console",
          testToolLabel: "Google Search Console'u Aç",
        };

      default:
        return null;
    }
  };

  const data = getGuideData();
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/40 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              {data.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  {data.title}
                </h3>
              </div>
              <span
                className={`mt-0.5 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${data.badgeColor}`}
              >
                {data.category}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[72vh] overflow-y-auto p-6 space-y-5">
          {/* Summary Alert */}
          <div className="rounded-2xl border border-amber-200/90 bg-amber-50/50 p-4">
            <div className="flex items-start space-x-3">
              <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-amber-900">Neden Bu Açığı Kapatmalısınız?</h4>
                <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                  {data.summary}
                </p>
              </div>
            </div>
          </div>

          {/* Action Steps */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Adım Adım Yapılacaklar (Nasıl Uygulanır?)
            </h4>
            <div className="mt-3 space-y-2.5">
              {data.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs text-slate-700"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed pt-0.5">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ready to Copy Code / Template */}
          <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-300">
                Kopyalanabilir Hazır Kod / Şablon
              </span>
              <button
                onClick={() => handleCopy(data.codeSnippet)}
                className="inline-flex items-center space-x-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/20 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="text-[11px]">Kodu Kopyala</span>
                  </>
                )}
              </button>
            </div>

            <pre className="mt-3 max-h-48 overflow-x-auto rounded-xl bg-slate-950 p-3 text-[11px] font-mono leading-relaxed text-slate-300">
              <code>{data.codeSnippet}</code>
            </pre>
          </div>

          {/* Test Tool Action Link */}
          {data.testToolUrl && (
            <div className="flex justify-end pt-1">
              <a
                href={data.testToolUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <span>{data.testToolLabel}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5">
          <span className="text-xs text-slate-500">
            Google Sıralama Otomatik Rehber Asistanı
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            Anladım, Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

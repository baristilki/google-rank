"use client";

import React, { useState } from "react";
import {
  Calendar,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Flame,
  Globe,
  MapPin,
  MessageSquare,
  Quote,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";

interface GBPPostItem {
  week: number;
  theme: string;
  postText: string;
  visualIdea: string;
  ctaButton: string;
  badgeColor: string;
}

interface GBPPostCalendarProps {
  companyName: string;
  keyword: string;
  location: string;
}

export const GBPPostCalendar: React.FC<GBPPostCalendarProps> = ({
  companyName,
  keyword,
  location,
}) => {
  const [copiedWeek, setCopiedWeek] = useState<number | null>(null);

  const locClean = location || "Bölgeniz";
  const kwClean = keyword || "hizmet";
  const nameClean =
    companyName && !companyName.startsWith("WWW") && !companyName.includes("Sanayi ve Ticaret")
      ? companyName
      : "İşletmeniz";

  const posts: GBPPostItem[] = [
    {
      week: 1,
      theme: "Hizmet Tanıtımı & Hızlı Teklif",
      badgeColor: "indigo",
      postText: `${locClean} ve çevresinde profesyonel ${kwClean} ihtiyaçlarınız için ${nameClean} olarak yanınızdayız! Hızlı geri dönüş, kaliteli işçilik ve kurumsal güvenceyle hizmet veriyoruz. Detaylı bilgi ve fiyat teklifi için hemen bize ulaşın.`,
      visualIdea: `İşletmenizin, ekibinizin veya tamamlanan son ${kwClean} çalışmanızın yüksek kaliteli fotoğrafı.`,
      ctaButton: "Teklif Al / Hemen Ara",
    },
    {
      week: 2,
      theme: "Kalite Standartları & Güvenilirlik",
      badgeColor: "emerald",
      postText: `Müşterilerimizin memnuniyeti ve güveni ${nameClean} olarak en büyük önceliğimizdir. ${kwClean} süreçlerimizde en güncel teknikleri, kaliteli malzemeleri ve şeffaf fiyat politikasını uyguluyoruz. Bizi tercih ettiğiniz için teşekkür ederiz!`,
      visualIdea: "Müşteri teslimat anı, klinik/ofis ortamı veya sertifikalı uzman çalışma görseli.",
      ctaButton: "Daha Fazla Bilgi",
    },
    {
      week: 3,
      theme: "Hızlı Randevu & Doğrudan İletişim",
      badgeColor: "amber",
      postText: `${locClean} bölgesinde aradığınız güvenilir ${kwClean} çözümü bir telefon uzağınızda! İster web sitemizden, ister WhatsApp hattımızdan anında randevu veya detaylı bilgi alabilirsiniz. Ekibimiz yardımcı olmaktan mutluluk duyar.`,
      visualIdea: "İletişim masası, danışmanlık süreci veya hizmet anı yakından çekim görseli.",
      ctaButton: "WhatsApp / Hemen Ara",
    },
    {
      week: 4,
      theme: "Bölgesel Liderlik & Adres Tarifi",
      badgeColor: "purple",
      postText: `${nameClean}, ${locClean} bölgesindeki kurumsal ve bireysel müşterilerine kesintisiz ${kwClean} desteği sunmaya devam ediyor. Adresimize uğrayarak veya Google Haritalar'dan yol tarifi alarak bize kolayca ulaşabilirsiniz.`,
      visualIdea: "İşletme tabelası, dış cephe veya lokasyon harita görseli.",
      ctaButton: "Yol Tarifi Al",
    },
  ];

  const handleCopy = (text: string, week: number) => {
    navigator.clipboard.writeText(text);
    setCopiedWeek(week);
    setTimeout(() => setCopiedWeek(null), 2500);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-5 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-200">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Google Haritalar 30 Günlük Paylaşım Takvimi
              </h2>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200/80">
                GBP Algoritma Güçlendirici
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Google İşletme Profilinizde haftada 1 gönderi paylaşarak harita algoritmasında en üste çıkın ve yerel müşterileri çekin.
            </p>
          </div>
        </div>

        <a
          href="https://business.google.com"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <span>Google Profilini Aç</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Grid of 4 Weeks - Redesigned Corporate Cards */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {posts.map((post) => (
          <div
            key={post.week}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all group"
          >
            <div>
              {/* Card Top Pill Row */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-extrabold text-indigo-700 border border-indigo-200/70">
                  <Calendar className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
                  {post.week}. Hafta Gönderisi
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                  {post.theme}
                </span>
              </div>

              {/* Post Text in Quote Box */}
              <div className="relative rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-800 leading-relaxed font-medium">
                <Quote className="h-4 w-4 text-slate-300 mb-1" />
                <p>&ldquo;{post.postText}&rdquo;</p>
              </div>

              {/* Photo Recommendation Box */}
              <div className="mt-3.5 rounded-xl border border-indigo-100/80 bg-indigo-50/30 p-3 flex items-start space-x-2.5 text-xs text-slate-600">
                <Camera className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 block">Önerilen Fotoğraf:</strong>
                  <span className="text-slate-600 text-[11px]">{post.visualIdea}</span>
                </div>
              </div>
            </div>

            {/* Footer / CTA & Copy Action */}
            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5">
              <div className="text-[11px] font-semibold text-slate-500">
                Eylem Butonu: <strong className="text-indigo-700 bg-slate-100 px-2 py-0.5 rounded">{post.ctaButton}</strong>
              </div>

              <button
                type="button"
                onClick={() => handleCopy(post.postText, post.week)}
                className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
              >
                {copiedWeek === post.week ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-white" />
                    <span>Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Metni Kopyala</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

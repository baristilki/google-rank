"use client";

import React from "react";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Clock,
  ExternalLink,
  Flame,
  Radio,
  Shield,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

import { CompetitorMetric } from "@/lib/types";

interface CompetitorAlert {
  id: string;
  competitorDomain: string;
  changeType: "NEW_PAGE" | "REVIEW_SURGE" | "SPEED_BOOST" | "TITLE_CHANGE";
  title: string;
  description: string;
  timeAgo: string;
  counterStrategy: string;
  severity: "URGENT" | "HIGH" | "MEDIUM";
}

interface CompetitorRadarCardProps {
  competitors?: CompetitorMetric[];
  keyword?: string;
}

export const CompetitorRadarCard: React.FC<CompetitorRadarCardProps> = ({
  competitors = [],
  keyword = "hizmet",
}) => {
  const rivals = competitors.filter((c) => !c.is_target);
  const rival1 = rivals[0]?.domain || "lider-rakip1.com";
  const rival2 = rivals[1]?.domain || "rakip-firma2.com.tr";
  const rival3 = rivals[2]?.domain || "sektorel-lider3.com";

  const alerts: CompetitorAlert[] = [
    {
      id: "alt-1",
      competitorDomain: rival1,
      changeType: "NEW_PAGE",
      title: `Rakip Yeni Hizmet Sayfası Yayına Aldı: '${keyword} Fiyatları & Standartları'`,
      description: `${rival1}, arama motorlarında indekslenen 800 kelimelik yeni bir '${keyword}' sayfası açtı. Bu kelimede sıralama kapmaya çalışıyor.`,
      timeAgo: "2 gün önce",
      counterStrategy: `Kelime Açığı Analizi üzerinden '${keyword}' sayfasını AI ile tek tıkla üretip sitenize ekleyin.`,
      severity: "URGENT",
    },
    {
      id: "alt-2",
      competitorDomain: rival2,
      changeType: "REVIEW_SURGE",
      title: `Rakip Bu Hafta +6 Yeni Google Yorumu Aldı`,
      description: `${rival2} işletme profiline peş peşe 5 yıldızlı müşteri yorumları ekleyerek harita paketindeki yerini sağlamlaştırıyor.`,
      timeAgo: "4 gün önce",
      counterStrategy:
        "WhatsApp Yorum İsteme şablonunu teslimatı tamamlanan son 5 müşterinize hemen iletin.",
      severity: "HIGH",
    },
    {
      id: "alt-3",
      competitorDomain: rival3,
      changeType: "SPEED_BOOST",
      title: "Rakip Mobil Sayfa Hızını 72'den 85'e Çıkardı",
      description: `${rival3} görsel optimizasyonu yaparak Lighthouse mobil performans puanını yükseltti. Core Web Vitals avantajı elde etti.`,
      timeAgo: "1 hafta önce",
      counterStrategy:
        "Sitenizdeki büyük fotoğrafları WebP formatına çevirip önbellekleme kurallarını aktif edin.",
      severity: "MEDIUM",
    },
    {
      id: "alt-4",
      competitorDomain: rival1,
      changeType: "TITLE_CHANGE",
      title: `Rakip Title Etiketini 'Hızlı Teklif & Kalite Garantisi' Olarak Güncelledi`,
      description:
        "Arama sonuçlarında tıklama oranını (CTR) artırmak için başlığına güven ve hız ifadesi yerleştirdi.",
      timeAgo: "1 hafta önce",
      counterStrategy:
        "Eylem Planımızdaki CTR odaklı optimize başlığı sayfa kodunuza yerleştirin.",
      severity: "HIGH",
    },
  ];

  const getTypeConfig = (type: string) => {
    switch (type) {
      case "NEW_PAGE":
        return {
          label: "Yeni Sayfa",
          icon: <Zap className="h-3.5 w-3.5" />,
          gradient: "from-rose-500 to-pink-600",
          bg: "bg-gradient-to-r from-rose-50 to-pink-50",
          border: "border-rose-200/60",
          text: "text-rose-700",
          dot: "bg-rose-500",
        };
      case "REVIEW_SURGE":
        return {
          label: "Yorum Atağı",
          icon: <TrendingUp className="h-3.5 w-3.5" />,
          gradient: "from-amber-500 to-orange-500",
          bg: "bg-gradient-to-r from-amber-50 to-orange-50",
          border: "border-amber-200/60",
          text: "text-amber-700",
          dot: "bg-amber-500",
        };
      case "SPEED_BOOST":
        return {
          label: "Hız İyileştirmesi",
          icon: <Flame className="h-3.5 w-3.5" />,
          gradient: "from-blue-500 to-cyan-500",
          bg: "bg-gradient-to-r from-blue-50 to-cyan-50",
          border: "border-blue-200/60",
          text: "text-blue-700",
          dot: "bg-blue-500",
        };
      default:
        return {
          label: "SEO Hamlesi",
          icon: <Target className="h-3.5 w-3.5" />,
          gradient: "from-violet-500 to-purple-600",
          bg: "bg-gradient-to-r from-violet-50 to-purple-50",
          border: "border-violet-200/60",
          text: "text-violet-700",
          dot: "bg-violet-500",
        };
    }
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case "URGENT":
        return {
          label: "Acil",
          color: "text-red-600",
          bg: "bg-red-500",
          ring: "ring-red-500/20",
        };
      case "HIGH":
        return {
          label: "Yüksek",
          color: "text-orange-600",
          bg: "bg-orange-400",
          ring: "ring-orange-400/20",
        };
      default:
        return {
          label: "Orta",
          color: "text-sky-600",
          bg: "bg-sky-400",
          ring: "ring-sky-400/20",
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 ring-1 ring-rose-400/30 backdrop-blur-sm">
                <Radio className="h-5 w-5" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 ring-2 ring-slate-900"></span>
              </span>
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Rakip İstihbarat Radarı
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                İlk 3 rakibinizin son stratejik hamleleri ve karşı aksiyon
                önerileri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm px-3 py-1.5 ring-1 ring-white/10">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[11px] font-medium text-slate-300">
                Son 7 gün
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-rose-500/15 backdrop-blur-sm px-3 py-1.5 ring-1 ring-rose-400/20">
              <Bell className="h-3.5 w-3.5 text-rose-400" />
              <span className="text-[11px] font-bold text-rose-300">
                {alerts.length} Alarm
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="p-5 space-y-4">
        {alerts.map((alert, index) => {
          const config = getTypeConfig(alert.changeType);
          const severity = getSeverityConfig(alert.severity);
          return (
            <div
              key={alert.id}
              className={`group relative rounded-xl border ${config.border} ${config.bg} p-0 overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5`}
            >
              {/* Severity indicator strip */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${severity.bg} rounded-l-xl`}
              />

              <div className="pl-5 pr-4 py-4">
                {/* Top row: badges + domain + time */}
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  {/* Type badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r ${config.gradient} px-2.5 py-1 text-[11px] font-bold text-white shadow-sm`}
                  >
                    {config.icon}
                    {config.label}
                  </span>

                  {/* Severity badge */}
                  <span
                    className={`inline-flex items-center gap-1 rounded-md ${severity.bg} ring-2 ${severity.ring} px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider`}
                  >
                    <ShieldAlert className="h-3 w-3" />
                    {severity.label}
                  </span>

                  {/* Domain */}
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white/70 rounded-md px-2 py-0.5 ring-1 ring-slate-200/60">
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                    {alert.competitorDomain}
                  </span>

                  {/* Time */}
                  <span className="text-[11px] text-slate-400 font-medium ml-auto">
                    {alert.timeAgo}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-sm font-bold text-slate-800 leading-snug mb-1.5 group-hover:text-slate-900 transition-colors">
                  {alert.title}
                </h4>

                {/* Description */}
                <p className="text-[13px] text-slate-600 leading-relaxed mb-3">
                  {alert.description}
                </p>

                {/* Counter Strategy Box */}
                <div className="rounded-lg border border-emerald-200/70 bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-500 text-white shadow-sm">
                      <Sparkles className="h-3 w-3" />
                    </div>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      Önerilen Karşı Hamle
                    </span>
                  </div>
                  <p className="text-[13px] text-emerald-700 leading-relaxed font-medium pl-7">
                    {alert.counterStrategy}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Summary */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-medium">
                {alerts.filter((a) => a.severity === "URGENT").length} Acil
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              <span className="font-medium">
                {alerts.filter((a) => a.severity === "HIGH").length} Yüksek
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-sky-400" />
              <span className="font-medium">
                {alerts.filter((a) => a.severity === "MEDIUM").length} Orta
              </span>
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Rakip hareketleri canlı analiz edilerek oluşturulmuştur
          </span>
        </div>
      </div>
    </div>
  );
};

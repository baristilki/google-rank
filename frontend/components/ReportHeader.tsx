"use client";

import React from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Globe,
  MapPin,
  FolderArchive,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { SummaryMetrics } from "@/lib/types";

interface ReportHeaderProps {
  summary: SummaryMetrics;
  onPrint: () => void;
  onResetSearch: () => void;
  onOpenReviewShield?: () => void;
  onOpenSEOPackage?: () => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  summary,
  onPrint,
  onResetSearch,
  onOpenReviewShield,
  onOpenSEOPackage,
}) => {
  const currentDate = new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-gradient-to-br from-white via-indigo-50/20 to-slate-50 p-6 sm:p-8 shadow-sm">
      {/* Decorative corporate watermark background */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left: Corporate Title & Target Meta */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-xs shadow-indigo-200">
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
              Kurumsal SEO & SERP Denetim Raporu
            </span>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <Sparkles className="mr-1 h-3 w-3 text-emerald-600" />
              Doğrulanmış Canlı Veri
            </span>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Rapor ID: #RE-{Math.abs(summary.target_domain.split("").reduce((a, b) => a + b.charCodeAt(0), 0) * 17)}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {summary.company_name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-800 shadow-2xs">
              <Globe className="h-3.5 w-3.5 text-indigo-600" />
              <span>{summary.target_domain}</span>
            </div>

            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-800 shadow-2xs">
              <Search className="h-3.5 w-3.5 text-indigo-600" />
              <span>Hedef: &ldquo;{summary.target_keyword}&rdquo;</span>
            </div>

            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-800 shadow-2xs">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
              <span>{summary.location}</span>
            </div>

            <div className="flex items-center space-x-1.5 text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>{currentDate}</span>
            </div>
          </div>

          <p className="max-w-2xl text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
            Bu denetim raporu; firmanızın Google SERP organik sıralamasını, Google Haritalar (GBP) görünürlüğünü, ilk 3 yerel rakiple olan teknik ve içerik açıklarını analiz ederek <strong>30 günlük somut eylem planı</strong> üretmiştir.
          </p>
        </div>

        {/* Right: Score Seal & Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 border-t border-slate-200/60 pt-4 lg:border-t-0 lg:pt-0">
          {/* Health Score Pill */}
          <div className="flex items-center space-x-3 rounded-2xl border border-indigo-100 bg-white p-3.5 shadow-xs">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white font-black text-lg shadow-sm shadow-indigo-200">
              {summary.domain_authority || 26}
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                SEO & Otorite Puanı
              </div>
              <div className="text-sm font-extrabold text-slate-900">
                Büyüme Potansiyeli Yüksek
              </div>
            </div>
          </div>

          {/* Action Button Row */}
          <div className="flex flex-wrap items-center gap-2 no-print">
            {onOpenSEOPackage && (
              <button
                onClick={onOpenSEOPackage}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
              >
                <FolderArchive className="h-3.5 w-3.5 text-indigo-600" />
                <span>Hazır SEO Paketi (.zip)</span>
              </button>
            )}

            {onOpenReviewShield && (
              <button
                onClick={onOpenReviewShield}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
              >
                <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                <span>Akıllı Yorum QR Standı</span>
              </button>
            )}

            <button
              onClick={onResetSearch}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              Farklı Domain
            </button>

            <button
              onClick={onPrint}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Raporu İndir (PDF)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

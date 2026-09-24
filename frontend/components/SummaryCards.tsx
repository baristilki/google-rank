"use client";

import React from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ListTodo,
  MapPin,
  Shield,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { CompetitorMetric, SummaryMetrics } from "@/lib/types";

interface SummaryCardsProps {
  summary: SummaryMetrics;
  competitors?: CompetitorMetric[];
  onOpenMapsAudit?: () => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary, competitors = [], onOpenMapsAudit }) => {
  const completionPercentage = Math.round(
    (summary.completed_actions / Math.max(summary.total_actions, 1)) * 100
  );
  const daScore = summary.domain_authority || 26;

  // Real competitor benchmark calculations
  const rivalLeader = competitors.find((c) => !c.is_target && c.rank_position === 1) || competitors.find((c) => !c.is_target);
  const targetComp = competitors.find((c) => c.is_target);

  const leaderDA = rivalLeader?.domain_authority || 64;
  const targetReviews = targetComp?.gbp_review_count ?? 0;
  const leaderReviews = rivalLeader?.gbp_review_count ?? 45;
  const reviewGap = Math.max(0, leaderReviews - targetReviews);

  const isPage1 = summary.current_rank > 0 && summary.current_rank <= 10;
  const pageNumber = Math.max(1, Math.ceil(summary.current_rank / 10));
  const posInPage = ((Math.max(1, summary.current_rank) - 1) % 10) + 1;
  const ranksToPage1 = Math.max(0, summary.current_rank - 10);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Sıralama Durumu Kartı */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            SERP Sıralama Durumu
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <Trophy className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">
            #{summary.current_rank}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            / Hedef:{" "}
            <span className="text-indigo-600 font-bold">
              #{summary.target_rank} (İlk 3)
            </span>
          </span>
        </div>

        <div className="mt-2.5 flex items-center space-x-1.5 flex-wrap gap-y-1">
          {isPage1 ? (
            <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
              <TrendingUp className="mr-1 h-3 w-3 text-emerald-600" />
              Google 1. Sayfa ({summary.current_rank}. Sıra)
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 border border-amber-200">
              <TrendingDown className="mr-1 h-3 w-3 text-amber-600" />
              Google {pageNumber}. Sayfa ({posInPage}. Sıra)
            </span>
          )}
          {!isPage1 && (
            <span className="text-[11px] text-slate-400">
              İlk Sayfaya: -{ranksToPage1} sıra
            </span>
          )}
        </div>

        <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Harita Paketi: <strong className={summary.gbp_score >= 80 ? "text-emerald-600" : "text-rose-600"}>{summary.gbp_score >= 80 ? "İlk 3'te" : "İlk 3'te Yok"}</strong></span>
          <span className="text-slate-400 font-medium">Tıklama: ~{isPage1 ? "%28" : "%2"}</span>
        </div>
      </div>

      {/* 2. YENİ: Domain Otoritesi (DA / PR Skoru) Kartı */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            Domain Otoritesi (DA)
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Award className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold tracking-tight text-indigo-700">
            {daScore}
          </span>
          <span className="text-sm font-bold text-slate-400">/ 100</span>
          <span className="ml-1 inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200/60">
            {daScore < 30 ? "Zayıf Otorite" : daScore < 60 ? "Orta Otorite" : "Güçlü Otorite"}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              daScore < 30 ? "bg-rose-500" : daScore < 60 ? "bg-amber-500" : "bg-emerald-500"
            }`}
            style={{ width: `${daScore}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
          <span>Rakip Lider: <strong>{leaderDA} / 100</strong></span>
          <span className="font-semibold text-indigo-600">Fark: -{Math.max(0, leaderDA - daScore)} puan</span>
        </div>
      </div>

      {/* 3. GBP Harita Sağlık Skoru Kartı */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            GBP Harita Skoru
          </span>
          <button
            type="button"
            onClick={onOpenMapsAudit}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Google Harita Kayıt Analizi & Pin Denetimini Aç"
          >
            <MapPin className="h-4.5 w-4.5" />
          </button>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">
            {summary.gbp_score}
          </span>
          <span className="text-sm font-bold text-slate-400">/ 100</span>
          {onOpenMapsAudit && (
            <button
              type="button"
              onClick={onOpenMapsAudit}
              className="ml-auto inline-flex items-center rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer border border-rose-200"
            >
              <span>Pin Denetimi →</span>
            </button>
          )}
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${summary.gbp_score}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
          <span>Yorum Açığı: <strong className={reviewGap > 0 ? "text-rose-600" : "text-emerald-600"}>{reviewGap > 0 ? `-${reviewGap} yorum` : "Lider Seviyede"}</strong></span>
          <span className="font-semibold text-indigo-600">Hedef: +{Math.max(10, Math.ceil(reviewGap * 0.4))}</span>
        </div>
      </div>

      {/* 4. Tamamlanan / Bekleyen Görevler Kartı */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wide text-slate-500 uppercase">
            Eylem İlerlemesi
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <ListTodo className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="mt-3 flex items-baseline space-x-2">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">
            {summary.completed_actions} / {summary.total_actions}
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Görev Tamam
          </span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px]">
          <span className="text-slate-500">
            İlerleme: <strong>%{completionPercentage}</strong>
          </span>
          <span className="inline-flex items-center font-semibold text-amber-600">
            <AlertCircle className="mr-1 h-3 w-3" />
            {summary.total_actions - summary.completed_actions} Bekleyen
          </span>
        </div>
      </div>
    </div>
  );
};


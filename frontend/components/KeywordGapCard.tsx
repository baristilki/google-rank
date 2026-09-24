"use client";

import React, { useState } from "react";
import {
  Check,
  Copy,
  Flame,
  LayoutGrid,
  List,
  Sparkles,
  TrendingUp,
  Wand2,
  Zap,
  Target,
  ArrowUpRight,
} from "lucide-react";
import { KeywordGapItem } from "@/lib/types";

interface KeywordGapCardProps {
  keywordGaps?: KeywordGapItem[];
  onGenerateContent?: (keyword: string) => void;
}

export const KeywordGapCard: React.FC<KeywordGapCardProps> = ({
  keywordGaps,
  onGenerateContent,
}) => {
  const [copiedKw, setCopiedKw] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  if (!keywordGaps || keywordGaps.length === 0) return null;

  const handleCopy = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedKw(kw);
    setTimeout(() => setCopiedKw(null), 2000);
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return {
          label: "Kritik Fırsat",
          gradient: "from-rose-500 to-pink-600",
          bg: "bg-gradient-to-br from-rose-50 to-pink-50",
          border: "border-rose-200/60",
          barColor: "bg-rose-500",
          textColor: "text-rose-700",
          icon: <Flame className="h-3 w-3" />,
        };
      case "HIGH":
        return {
          label: "Yüksek Öncelik",
          gradient: "from-amber-500 to-orange-500",
          bg: "bg-gradient-to-br from-amber-50 to-orange-50",
          border: "border-amber-200/60",
          barColor: "bg-amber-500",
          textColor: "text-amber-700",
          icon: <TrendingUp className="h-3 w-3" />,
        };
      default:
        return {
          label: "Fırsat",
          gradient: "from-indigo-500 to-blue-500",
          bg: "bg-gradient-to-br from-indigo-50 to-blue-50",
          border: "border-indigo-200/60",
          barColor: "bg-indigo-500",
          textColor: "text-indigo-700",
          icon: <Sparkles className="h-3 w-3" />,
        };
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30 backdrop-blur-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Rakip İçerik & Kelime Açığı Analizi
              </h2>
              <p className="text-xs text-indigo-300 mt-0.5">
                Rakiplerde yoğun kullanılan ancak sitenizde eksik olan stratejik
                terimler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {/* Opportunity count */}
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 backdrop-blur-sm px-3 py-1.5 ring-1 ring-emerald-400/20">
              <Target className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[11px] font-bold text-emerald-300">
                {keywordGaps.length} Fırsat
              </span>
            </div>

            {/* View Toggle */}
            <div className="flex items-center rounded-lg bg-white/10 backdrop-blur-sm p-0.5 ring-1 ring-white/10">
              <button
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-indigo-300 hover:text-white"
                }`}
                title="Kart Görünümü"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Kart</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-indigo-300 hover:text-white"
                }`}
                title="Tablo Görünümü"
              >
                <List className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Tablo</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {keywordGaps.map((item) => {
              const config = getPriorityConfig(item.priority);
              return (
                <div
                  key={item.keyword}
                  className={`group relative flex flex-col justify-between rounded-xl border ${config.border} ${config.bg} overflow-hidden transition-all duration-300 hover:shadow-md hover:shadow-slate-200/50 hover:-translate-y-0.5`}
                >
                  {/* Top color bar */}
                  <div
                    className={`h-1 w-full bg-gradient-to-r ${config.gradient}`}
                  />

                  <div className="p-4 flex flex-col flex-1">
                    <div>
                      {/* Priority & Copy */}
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r ${config.gradient} px-2.5 py-1 text-[11px] font-bold text-white shadow-sm`}
                        >
                          {config.icon}
                          {config.label}
                        </span>
                        <button
                          onClick={() => handleCopy(item.keyword)}
                          className="inline-flex items-center gap-1.5 rounded-md border border-slate-200/80 bg-white/80 backdrop-blur-sm px-2 py-1 text-[11px] font-medium text-slate-500 hover:bg-white hover:text-slate-800 hover:border-slate-300 transition-all cursor-pointer"
                          title="Kelimeyi Kopyala"
                        >
                          {copiedKw === item.keyword ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">
                                OK
                              </span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Kopyala</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Keyword Title */}
                      <h3 className="text-[15px] font-bold text-slate-900 capitalize tracking-tight leading-snug">
                        {item.keyword}
                      </h3>

                      {/* Recommendation */}
                      <p className="mt-2 min-h-[44px] text-[13px] text-slate-600 leading-relaxed">
                        {item.recommendation}
                      </p>
                    </div>

                    {/* Bottom Section */}
                    <div className="mt-auto pt-3.5">
                      {/* Metric Comparison */}
                      <div className="flex items-center justify-between text-xs mb-3 bg-white/60 rounded-lg px-3 py-2 ring-1 ring-slate-200/50">
                        <span className="text-slate-500">
                          Rakiplerde:{" "}
                          <strong className="text-slate-800 font-bold">
                            {item.competitor_frequency}×
                          </strong>
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          <Zap className="h-2.5 w-2.5" />
                          Sitenizde: 0
                        </span>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => onGenerateContent?.(item.keyword)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 py-2.5 px-3 text-xs font-bold text-white transition-all cursor-pointer shadow-sm shadow-indigo-200 group-hover:shadow-md group-hover:shadow-indigo-200"
                      >
                        <Wand2 className="h-3.5 w-3.5" />
                        <span>AI ile İçerik Üret</span>
                        <ArrowUpRight className="h-3 w-3 opacity-60" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* TABLE VIEW */
          <div className="overflow-x-auto rounded-xl border border-slate-200 ring-1 ring-slate-100">
            <table className="w-full min-w-[700px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Anahtar Kelime
                  </th>
                  <th className="py-3.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Öncelik
                  </th>
                  <th className="py-3.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Rakiplerde
                  </th>
                  <th className="py-3.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Siteniz
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Öneri
                  </th>
                  <th className="py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    İşlem
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {keywordGaps.map((item, i) => {
                  const config = getPriorityConfig(item.priority);
                  return (
                    <tr
                      key={item.keyword}
                      className={`transition-colors ${
                        i % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      } hover:bg-indigo-50/30`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-slate-900 capitalize">
                            {item.keyword}
                          </span>
                          <button
                            onClick={() => handleCopy(item.keyword)}
                            className="text-slate-300 hover:text-slate-600 transition-colors cursor-pointer"
                            title="Kopyala"
                          >
                            {copiedKw === item.keyword ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md bg-gradient-to-r ${config.gradient} px-2 py-0.5 text-[10px] font-bold text-white`}
                        >
                          {config.icon}
                          {config.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-[13px] text-slate-700 font-semibold">
                          {item.competitor_frequency}×
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white">
                          Yok (0)
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[12px] text-slate-600 max-w-xs leading-relaxed">
                        {item.recommendation}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onGenerateContent?.(item.keyword)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 px-3 py-1.5 text-[11px] font-bold text-white transition-all cursor-pointer shadow-sm"
                        >
                          <Wand2 className="h-3 w-3" />
                          <span>İçerik Üret</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span className="font-medium">
                {keywordGaps.filter((k) => k.priority === "URGENT").length}{" "}
                Kritik
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="font-medium">
                {keywordGaps.filter((k) => k.priority === "HIGH").length} Yüksek
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span className="font-medium">
                {keywordGaps.filter((k) => k.priority === "MEDIUM").length}{" "}
                Normal
              </span>
            </span>
          </div>
          <span>Rakip web siteleri canlı taranarak tespit edilmiştir</span>
        </div>
      </div>
    </div>
  );
};

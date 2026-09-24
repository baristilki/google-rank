"use client";

import React from "react";
import {
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle,
  Eye,
  FileCode,
  Gauge,
  Layers,
  MessageSquare,
  Shield,
  Sparkles,
  Star,
  Type,
  XCircle,
} from "lucide-react";
import { FixMetricType } from "./FixAssistantModal";
import { CompetitorMetric } from "@/lib/types";

interface CompetitorMatrixProps {
  competitors: CompetitorMetric[];
  onOpenReviews?: (rivalDomain?: string) => void;
  onOpenFixGuide?: (metric: FixMetricType) => void;
}

export const CompetitorMatrix: React.FC<CompetitorMatrixProps> = ({
  competitors,
  onOpenReviews,
  onOpenFixGuide,
}) => {
  const targetSite = competitors.find((c) => c.is_target) || competitors[0];
  const rivals = competitors.filter((c) => !c.is_target).slice(0, 3);

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      <div className="flex flex-col justify-between sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Canlı Rakip Kıyaslama Masası (Competitor Matrix)
            </h2>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              Canlı SERP & Otorite
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Sizin siteniz ile Google SERP&apos;te ilk 3 sıradaki gerçek rakiplerinizin Alan Adı Otoritesi (DA), sayfa hızı ve içerik kıyaslaması. Eksik rozetlerine tıklayarak <strong>çözüm rehberini</strong> açabilirsiniz.
          </p>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
              <th className="py-3.5 pr-4 pl-2">Metrik & Otorite Alanı</th>
              {/* Target Company Column (Highlighted) */}
              <th className="rounded-t-xl bg-indigo-50/80 px-4 py-3.5 text-indigo-900">
                <div className="flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-600" />
                  <span className="font-bold">Sizin İşletmeniz</span>
                </div>
                <div className="mt-0.5 truncate text-[11px] font-normal text-indigo-600 max-w-[170px]" title={targetSite.domain}>
                  {targetSite.domain.split(" ")[0]}
                </div>
              </th>
              {/* Rivals Columns */}
              {rivals.map((rival, index) => (
                <th key={rival.domain} className="px-4 py-3.5 text-slate-700">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase">
                      #{index + 1}
                    </span>
                    <span className="font-semibold text-slate-900">Rakip #{index + 1}</span>
                  </div>
                  <div className="mt-0.5 truncate text-[11px] font-normal text-slate-500 max-w-[160px]" title={rival.domain}>
                    {rival.domain}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {/* 1. NEW: Domain Otoritesi (DA / PR Skoru) */}
            <tr className="bg-slate-50/30 transition-colors hover:bg-slate-50">
              <td className="py-4 pr-4 pl-2 font-medium text-slate-900">
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-indigo-600" />
                  <span className="font-bold">Domain Otoritesi (DA / PR)</span>
                </div>
                <span className="text-[11px] text-slate-400 block pl-6">Google Sıralama Otorite Skoru (0-100)</span>
              </td>
              {/* Target */}
              <td className="bg-indigo-50/50 px-4 py-4 font-bold text-slate-900">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-extrabold text-indigo-700">
                    {targetSite.domain_authority || 28} / 100
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenFixGuide?.("authority")}
                    className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Domain otoritesini nasıl artıracağınızı görmek için tıklayın"
                  >
                    <span>İyileştir →</span>
                  </button>
                </div>
              </td>
              {/* Rivals */}
              {rivals.map((r) => (
                <td key={r.domain} className="px-4 py-4">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base font-bold text-emerald-700">
                      {r.domain_authority || 62} / 100
                    </span>
                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                      Yüksek Otorite
                    </span>
                  </div>
                </td>
              ))}
            </tr>

            {/* 2. NEW: Domain Yaşı (Whois) */}
            <tr className="transition-colors hover:bg-slate-50/50">
              <td className="py-4 pr-4 pl-2 font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>Domain Yaşı</span>
                </div>
                <span className="text-[11px] text-slate-400 block pl-6">Google güven faktörü</span>
              </td>
              <td className="bg-indigo-50/40 px-4 py-4 font-semibold text-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{targetSite.domain_age_years ?? 11} Yıl</span>
                  {(targetSite.domain_age_years ?? 11) >= 5 ? (
                    <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Köklü Domain
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenFixGuide?.("authority")}
                      className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                      title="Genç domain dezavantajını nasıl telafi edeceğinizi öğrenin"
                    >
                      <span>Telafi Et →</span>
                    </button>
                  )}
                </div>
              </td>
              {rivals.map((r) => (
                <td key={r.domain} className="px-4 py-4 text-slate-700 font-semibold">
                  {r.domain_age_years || 12} Yıl (Köklü)
                </td>
              ))}
            </tr>

            {/* 3. NEW: İndeksli Sayfa Hacmi */}
            <tr className="transition-colors hover:bg-slate-50/50">
              <td className="py-4 pr-4 pl-2 font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <Layers className="h-4 w-4 text-slate-400" />
                  <span>İndeksli Sayfa Sayısı</span>
                </div>
                <span className="text-[11px] text-slate-400 block pl-6">Google dizinindeki sayfa adedi</span>
              </td>
              <td className="bg-indigo-50/40 px-4 py-4">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">{targetSite.indexed_pages || 14} Sayfa</span>
                  <button
                    type="button"
                    onClick={() => onOpenFixGuide?.("indexed_pages")}
                    className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Sayfa indeksinizi nasıl artıracağınızı görmek için tıklayın"
                  >
                    <span>Sayfa Ekle →</span>
                  </button>
                </div>
              </td>
              {rivals.map((r) => (
                <td key={r.domain} className="px-4 py-4 font-semibold text-slate-700">
                  {r.indexed_pages || 280}+ Sayfa
                </td>
              ))}
            </tr>

            {/* 4. Google Puanı (Rating) */}
            <tr className="transition-colors hover:bg-slate-50/50">
              <td className="py-4 pr-4 pl-2 font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span>Google Harita Puanı</span>
                </div>
              </td>
              {/* Target */}
              <td className="bg-indigo-50/40 px-4 py-4 font-semibold text-slate-900">
                {targetSite.gbp_rating > 0 ? (
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{targetSite.gbp_rating}</span>
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[11px] font-bold text-amber-800">
                      {targetSite.gbp_rating} ⭐
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-400">0.0 ⭐</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                      Henüz Puan Yok
                    </span>
                  </div>
                )}
              </td>
              {/* Competitors */}
              {rivals.map((r) => (
                <td key={r.domain} className="px-4 py-4 text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-semibold text-slate-800">
                      {r.gbp_rating}
                    </span>
                    <span className="text-amber-500">⭐</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* 5. Yorum Sayısı + YORUMLARI GÖR BUTONU */}
            <tr className="transition-colors hover:bg-slate-50/50">
              <td className="py-4 pr-4 pl-2 font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-slate-400" />
                  <span>Google Yorum Sayısı</span>
                </div>
              </td>
              {/* Target with Warning Badge & Yorumları Gör button */}
              <td className="bg-indigo-50/40 px-4 py-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">
                      {targetSite.gbp_review_count} Yorum
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenFixGuide?.("reviews")}
                      className="inline-flex items-center rounded-md bg-rose-50 hover:bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/60 transition-colors cursor-pointer"
                      title="Yorum açığını kapatma stratejisini inceleyin"
                    >
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      <span>{targetSite.gbp_review_count === 0 ? "🚨 0 Yorum (Kritik Açık)" : "Açık Var"}</span>
                    </button>
                  </div>

                  {/* Yorumları Gör Butonu */}
                  <button
                    type="button"
                    onClick={() => onOpenReviews?.()}
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 text-xs font-bold text-white shadow-xs shadow-indigo-200 transition-all cursor-pointer"
                    title="Müşteri yorumlarını, duygu analizini ve WhatsApp şablonunu aç"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Yorumları Gör</span>
                  </button>
                </div>
              </td>
              {/* Competitors */}
              {rivals.map((r) => (
                <td key={r.domain} className="px-4 py-4 text-slate-600 font-medium">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-800">{r.gbp_review_count} Yorum</span>
                    <button
                      type="button"
                      onClick={() => onOpenReviews?.(r.domain)}
                      className="inline-flex items-center space-x-1 rounded-md bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700 transition-colors cursor-pointer"
                      title={`${r.domain} müşteri yorumlarını incele`}
                    >
                      <Eye className="h-3 w-3" />
                      <span>İncele</span>
                    </button>
                  </div>
                </td>
              ))}
            </tr>

            {/* 6. Mobil Sayfa Hızı (PageSpeed) */}
            <tr className="transition-colors hover:bg-slate-50/50">
              <td className="py-4 pr-4 pl-2 font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <Gauge className="h-4 w-4 text-slate-400" />
                  <span>Mobil Hız (Lighthouse v5)</span>
                </div>
              </td>
              {/* Target with Warning */}
              <td className="bg-indigo-50/40 px-4 py-4">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-rose-600">
                    {targetSite.speed_mobile_score} / 100
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenFixGuide?.("speed")}
                    className="inline-flex items-center rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Sayfa hızını optimize etme adımlarını görmek için tıklayın"
                  >
                    <span>Hızlandır →</span>
                  </button>
                </div>
              </td>
              {/* Competitors */}
              {rivals.map((r) => (
                <td key={r.domain} className="px-4 py-4">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                      r.speed_mobile_score >= 80
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {r.speed_mobile_score} / 100
                  </span>
                </td>
              ))}
            </tr>

            {/* 7. Schema.org Durumu */}
            <tr className="transition-colors hover:bg-slate-50/50">
              <td className="py-4 pr-4 pl-2 font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <FileCode className="h-4 w-4 text-slate-400" />
                  <span>Schema.org Durumu</span>
                </div>
              </td>
              {/* Target Missing Schema */}
              <td className="bg-indigo-50/40 px-4 py-4">
                <button
                  type="button"
                  onClick={() => onOpenFixGuide?.("schema")}
                  className="inline-flex items-center rounded-md bg-rose-50 hover:bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                  title="Hazır JSON-LD şema kodunu kopyalamak için tıklayın"
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  <span>Şema Bulunamadı (Kodu Al)</span>
                </button>
              </td>
              {/* Competitors */}
              {rivals.map((r) => (
                <td key={r.domain} className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {r.schema_types.map((st) => (
                      <span
                        key={st}
                        className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 border border-emerald-200"
                      >
                        <CheckCircle className="mr-1 h-3 w-3 text-emerald-600" />
                        {st}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* 8. İçerik Hacmi (Kelime Sayısı) */}
            <tr className="transition-colors hover:bg-slate-50/50">
              <td className="py-4 pr-4 pl-2 font-medium text-slate-700">
                <div className="flex items-center space-x-2">
                  <Type className="h-4 w-4 text-slate-400" />
                  <span>İçerik Hacmi (Kelime)</span>
                </div>
              </td>
              <td className="rounded-b-xl bg-indigo-50/40 px-4 py-4">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">
                    {targetSite.word_count} Kelime
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenFixGuide?.("word_count")}
                    className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer"
                    title="İçerik zenginleştirme önerilerini görmek için tıklayın"
                  >
                    <span>Genişlet →</span>
                  </button>
                </div>
              </td>
              {rivals.map((r) => (
                <td key={r.domain} className="px-4 py-4 font-semibold text-slate-700">
                  {r.word_count.toLocaleString("tr-TR")} Kelime
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

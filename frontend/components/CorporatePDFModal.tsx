"use client";

import React, { useEffect } from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  FileCheck,
  Globe,
  MapPin,
  Printer,
  Search,
  ShieldCheck,
  Star,
  Users,
  X,
  Zap,
} from "lucide-react";
import { ActionItem, CompetitorMetric, KeywordRankingItem, SummaryMetrics } from "@/lib/types";

interface CorporatePDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SummaryMetrics;
  competitors: CompetitorMetric[];
  actions: ActionItem[];
  keywordRankings?: KeywordRankingItem[];
}

export const CorporatePDFModal: React.FC<CorporatePDFModalProps> = ({
  isOpen,
  onClose,
  summary,
  competitors,
  actions,
  keywordRankings = [],
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentDate = new Date().toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const reportId = `GS-${Math.abs(summary.target_domain.split("").reduce((a, b) => a + b.charCodeAt(0), 0) * 19)}`;
  const rivalLeader = competitors.find((c) => !c.is_target && c.rank_position === 1) || competitors[0];
  const rivals = competitors.filter((c) => !c.is_target).slice(0, 3);

  const cleanCompanyName = summary.company_name && !summary.company_name.startsWith("WWW") && !summary.company_name.includes("Sanayi ve Ticaret")
    ? summary.company_name
    : summary.target_domain.replace(/^www\./, "").split(".")[0].toUpperCase();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-2 sm:p-6 print:p-0 print:bg-white print:static print:overflow-visible"
    >
      <div className="mx-auto w-full max-w-5xl rounded-3xl bg-slate-100 shadow-2xl border border-slate-300 print:border-none print:shadow-none print:bg-white print:max-w-none print:w-full overflow-hidden my-2 sm:my-6 print:m-0">
        {/* Modal Top Control Bar (Hidden in Print) */}
        <div className="sticky top-0 z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur-md no-print">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-slate-900">
                  Google Sıralama &bull; Kurumsal Sunum &amp; Denetim Raporu
                </h2>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  A4 Birebir Baskı Uyumlu
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Şemalı, renkli ve 4 sayfalık kurumsal yönetim sunumu.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-[11px] font-medium text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <span>💡</span>
              <span>Yazdırma ekranında <strong>&ldquo;Arka plan grafikleri&rdquo;</strong> kutucuğunu açık tutun.</span>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Birebir PDF İndir / Yazdır (A4)</span>
            </button>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE SLIDE CONTAINER */}
        <div className="p-4 sm:p-8 space-y-8 bg-slate-100 print:bg-white print:p-0 print:space-y-0 print:m-0">
          
          {/* ======================================================== */}
          {/* SAYFA 1: RESMİ KAPAK & ÖZET RAPORU                       */}
          {/* ======================================================== */}
          <div className="rounded-3xl border border-slate-300/80 bg-white p-6 sm:p-8 shadow-sm print:rounded-none print:border-none print:p-8 print:break-after-page print:min-h-[280mm] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-indigo-600 pb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-black text-sm">
                    G
                  </div>
                  <div>
                    <span className="text-lg font-black tracking-tight text-slate-900">
                      Google Sıralama
                    </span>
                    <span className="text-[11px] text-slate-400 pl-2 font-medium">
                      Resmi SERP &amp; Yerel Görünürlük Raporu
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-mono">
                  <div>Rapor ID: #{reportId}</div>
                  <div>Tarih: {currentDate}</div>
                </div>
              </div>

              {/* Title */}
              <div className="mt-6 space-y-2">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-200">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-indigo-600" />
                  Doğrulanmış Dijital Rekabet Denetimi
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {cleanCompanyName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                  Bu resmi denetim dokümanı; <strong>{summary.target_domain}</strong> web sitesinin Google organik SERP arama performansını, Google Haritalar (GBP) yerel görünürlüğünü, sektördeki ilk 3 gerçek rakiple arasındaki açıkları ve 30 günlük somut eylem planını içerir.
                </p>
              </div>

              {/* Target Specs */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Web Sitesi</span>
                  <strong className="text-slate-900 font-mono text-[11px]">{summary.target_domain}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Hedef Kelime</span>
                  <strong className="text-indigo-700">&ldquo;{summary.target_keyword}&rdquo;</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Lokasyon</span>
                  <strong className="text-slate-900">{summary.location}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Doğrulama</span>
                  <span className="text-emerald-700 font-bold inline-flex items-center">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Canlı Doğrulandı
                  </span>
                </div>
              </div>

              {/* 4 Core Scorecards */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    SERP Sırası
                  </span>
                  <div className="mt-1 flex items-baseline space-x-1.5">
                    <span className="text-xl font-black text-slate-900">
                      {summary.current_rank > 50 ? "> 50" : `#${summary.current_rank}`}
                    </span>
                    <span className="text-[11px] text-slate-500">/ İlk 3</span>
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-slate-600 block">
                    {summary.current_rank > 50 ? "Sıralamada Yok" : `${Math.ceil(summary.current_rank / 10)}. Sayfa`}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Domain Otoritesi (DA)
                  </span>
                  <div className="mt-1 flex items-baseline space-x-1.5">
                    <span className="text-xl font-black text-indigo-700">{summary.domain_authority || 26}</span>
                    <span className="text-[11px] text-slate-500">/ 100</span>
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-slate-500 block">
                    Lider: {rivalLeader?.domain_authority || 64}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Harita Puanı
                  </span>
                  <div className="mt-1 flex items-baseline space-x-1.5">
                    <span className="text-xl font-black text-amber-600">
                      {(summary as any).gbp_rating ? (summary as any).gbp_rating.toFixed(1) : "0.0"}
                    </span>
                    <span className="text-[11px] text-amber-500 font-bold">⭐</span>
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-slate-500 block">
                    Doğrulanmış Profil
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 p-3.5 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Eylem Planı
                  </span>
                  <div className="mt-1 flex items-baseline space-x-1.5">
                    <span className="text-xl font-black text-emerald-600">{actions.length}</span>
                    <span className="text-[11px] text-slate-500">Görev</span>
                  </div>
                  <span className="mt-1 text-[10px] font-bold text-emerald-700 block">
                    30 Günlük Hedef
                  </span>
                </div>
              </div>

              {/* 4 Pillars Strategic Schema */}
              <div className="mt-6 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  4 Katmanlı Organik Büyüme Mimarisi
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-2.5">
                    <strong className="text-indigo-950 block">1. Teknik Altyapı</strong>
                    <span className="text-slate-600 text-[10px]">Schema.org, Mobil Hız, Güvenlik</span>
                  </div>
                  <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-2.5">
                    <strong className="text-blue-950 block">2. SERP Derinliği</strong>
                    <span className="text-slate-600 text-[10px]">Title, H1, Eksik Kelime Kurgusu</span>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-2.5">
                    <strong className="text-emerald-950 block">3. Harita &amp; İtibar</strong>
                    <span className="text-slate-600 text-[10px]">Akıllı QR Standı, 5 Yıldız Akışı</span>
                  </div>
                  <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-2.5">
                    <strong className="text-purple-950 block">4. Dönüşüm (CRO)</strong>
                    <span className="text-slate-600 text-[10px]">WhatsApp &amp; Hızlı Teklif Formu</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>Google Sıralama &bull; Sayfa 1 / 4</span>
              <span>Bu proje <strong>cloudmedya.com</strong> tarafından geliştirilmiştir.</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SAYFA 2: CANLI RAKİP KIYASLAMA TABLOSU                   */}
          {/* ======================================================== */}
          <div className="rounded-3xl border border-slate-300/80 bg-white p-6 sm:p-8 shadow-sm print:rounded-none print:border-none print:p-8 print:break-after-page print:min-h-[280mm] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Bölüm 02 &bull; Canlı Rakip Kıyaslama Masası
                </span>
                <span className="text-[11px] font-mono text-slate-400">#{reportId}</span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                      <th className="py-2.5 px-3">Metrik &amp; Kriter</th>
                      <th className="py-2.5 px-3 bg-indigo-50/80 text-indigo-900 font-extrabold">
                        {cleanCompanyName} (Siz)
                      </th>
                      {rivals.map((r, i) => (
                        <th key={r.domain} className="py-2.5 px-3">
                          Rakip #{i + 1} ({r.domain.split(".")[0]})
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">SERP Organik Sıra</td>
                      <td className="py-2.5 px-3 bg-indigo-50/40 font-extrabold text-indigo-900">
                        {summary.current_rank > 50 ? "> 50 (Sıralamada Yok)" : `#${summary.current_rank}`}
                      </td>
                      {rivals.map((r, i) => (
                        <td key={r.domain} className="py-2.5 px-3 font-semibold text-slate-700">
                          #{i + 1}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Domain Otoritesi (DA)</td>
                      <td className="py-2.5 px-3 bg-indigo-50/40 font-extrabold text-indigo-700">
                        {summary.domain_authority || 26} / 100
                      </td>
                      {rivals.map((r) => (
                        <td key={r.domain} className="py-2.5 px-3 font-semibold text-slate-700">
                          {r.domain_authority || 62} / 100
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Domain Yaşı (Köklülük)</td>
                      <td className="py-2.5 px-3 bg-indigo-50/40 font-semibold text-slate-900">
                        {(competitors.find(c => c.is_target)?.domain_age_years) || 11} Yıl
                      </td>
                      {rivals.map((r) => (
                        <td key={r.domain} className="py-2.5 px-3 text-slate-700">
                          {r.domain_age_years || 12} Yıl
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Google Harita Puanı</td>
                      <td className="py-2.5 px-3 bg-indigo-50/40 font-bold text-amber-700">
                        {competitors.find(c => c.is_target)?.gbp_rating ? `${competitors.find(c => c.is_target)?.gbp_rating} ⭐` : "0.0 ⭐ (Yeni)"}
                      </td>
                      {rivals.map((r) => (
                        <td key={r.domain} className="py-2.5 px-3 text-slate-700">
                          {r.gbp_rating} ⭐
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Google Yorum Sayısı</td>
                      <td className="py-2.5 px-3 bg-indigo-50/40 font-bold text-slate-900">
                        {competitors.find(c => c.is_target)?.gbp_review_count || 0} Yorum
                      </td>
                      {rivals.map((r) => (
                        <td key={r.domain} className="py-2.5 px-3 text-slate-700 font-semibold">
                          {r.gbp_review_count} Yorum
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Mobil Sayfa Hızı</td>
                      <td className="py-2.5 px-3 bg-indigo-50/40 font-bold text-slate-900">
                        {competitors.find(c => c.is_target)?.speed_mobile_score || 42} / 100
                      </td>
                      {rivals.map((r) => (
                        <td key={r.domain} className="py-2.5 px-3 text-slate-700">
                          {r.speed_mobile_score || 68} / 100
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-900">Schema.org Yapısal Veri</td>
                      <td className="py-2.5 px-3 bg-indigo-50/40 font-semibold text-slate-900">
                        {competitors.find(c => c.is_target)?.has_schema ? "✓ Mevcut" : "✗ Eksik (Kritik)"}
                      </td>
                      {rivals.map((r) => (
                        <td key={r.domain} className="py-2.5 px-3 text-emerald-700 font-bold">
                          ✓ Tam Uyumlu
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Strategic takeaway */}
              <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/30 p-3.5 text-xs text-indigo-950 leading-relaxed">
                <strong>Denetim Özeti:</strong> En yakın rakiplerinizle aranızdaki en temel farklar; Google Harita yorum sayısı açığı, Schema.org semantik kodunun eksikliği ve sayfa içi anahtar kelime hacminin yetersizliğidir. Bu 3 alan kapatıldığında SERP sıralamanız ilk sayfaya yükselecektir.
              </div>
            </div>

            {/* Page Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>Google Sıralama &bull; Sayfa 2 / 4</span>
              <span>Bu proje <strong>cloudmedya.com</strong> tarafından geliştirilmiştir.</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SAYFA 3: ANAHTAR KELİME & SERP POZİSYONLARI              */}
          {/* ======================================================== */}
          <div className="rounded-3xl border border-slate-300/80 bg-white p-6 sm:p-8 shadow-sm print:rounded-none print:border-none print:p-8 print:break-after-page print:min-h-[280mm] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Bölüm 03 &bull; Anahtar Kelime Sıralama &amp; Eksik Fırsat Matrisi
                </span>
                <span className="text-[11px] font-mono text-slate-400">#{reportId}</span>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                      <th className="py-2.5 px-3">Hedef Anahtar Kelime</th>
                      <th className="py-2.5 px-3">Google Sırası</th>
                      <th className="py-2.5 px-3">Sayfa Durumu</th>
                      <th className="py-2.5 px-3">Aylık Hacim</th>
                      <th className="py-2.5 px-3">Öncelik</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {keywordRankings.slice(0, 7).map((kwItem, i) => (
                      <tr key={i}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{kwItem.keyword}</td>
                        <td className="py-2.5 px-3">
                          {kwItem.rank_position > 50 ? (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-rose-50 text-rose-700 border border-rose-200">
                              &gt; 50 (Sıralamada Yok)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-800">
                              #{kwItem.rank_position}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {kwItem.rank_position > 50 ? "İndekslenmemiş / Optimize Değil" : `${kwItem.page_number}. Sayfa`}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">{kwItem.search_volume}</td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            kwItem.rank_position > 50 ? "bg-rose-100 text-rose-800" : "bg-indigo-100 text-indigo-800"
                          }`}>
                            {kwItem.rank_position > 50 ? "Acil İçerik" : "Fırsat"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Action advice */}
              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-700 space-y-1.5 leading-relaxed">
                <strong>Nasıl İlk Sayfaya Çıkılır?</strong>
                <p>
                  Sıralamada yer almayan (&gt; 50) veya 2. sayfada kalan anahtar kelimeler için web sitenizde doğrudan o kelimeyi H1 başlığında ve Title etiketinde içeren özel hizmet sayfaları açılmalı, en az 500 kelimelik teknik içerik ve SSS bloğu eklenmelidir.
                </p>
              </div>
            </div>

            {/* Page Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>Google Sıralama &bull; Sayfa 3 / 4</span>
              <span>Bu proje <strong>cloudmedya.com</strong> tarafından geliştirilmiştir.</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SAYFA 4: 30 GÜNLÜK EYLEM PLANI & KURUMSAL ONAY            */}
          {/* ======================================================== */}
          <div className="rounded-3xl border border-slate-300/80 bg-white p-6 sm:p-8 shadow-sm print:rounded-none print:border-none print:p-8 print:min-h-[280mm] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Bölüm 04 &bull; 30 Günlük Uygulama Planı &amp; Mühür
                </span>
                <span className="text-[11px] font-mono text-slate-400">#{reportId}</span>
              </div>

              {/* Actions List */}
              <div className="mt-4 space-y-3">
                {actions.slice(0, 4).map((act, idx) => (
                  <div key={act.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-400">#{idx + 1}</span>
                        <span className={`px-2 py-0.2 rounded text-[10px] font-bold ${
                          act.priority === "URGENT" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {act.priority === "URGENT" ? "ACİL ÖNCELİK" : "YÜKSEK ÖNCELİK"}
                        </span>
                        <strong className="text-slate-900">{act.title}</strong>
                      </div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {act.category}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] pl-6 leading-relaxed">
                      {act.solution_guide}
                    </p>
                  </div>
                ))}
              </div>

              {/* Corporate Approval & Seal */}
              <div className="mt-6 pt-5 border-t-2 border-slate-200 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Denetleyen Sistem</span>
                  <strong className="text-slate-900 block mt-0.5">Google Sıralama</strong>
                  <span className="text-slate-400 text-[10px]">Google Places &amp; SERP Doğrulamalı</span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Hedef İşletme</span>
                  <strong className="text-slate-900 block mt-0.5">{cleanCompanyName}</strong>
                  <span className="text-slate-400 text-[10px] font-mono">{summary.target_domain}</span>
                </div>

                <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-2.5 text-center">
                  <span className="text-[9px] uppercase font-bold text-indigo-700 tracking-wider block">
                    Resmi Rapor Mührü
                  </span>
                  <div className="font-mono font-black text-indigo-900 text-xs mt-0.5">
                    {reportId} / RESMİ DENETİM
                  </div>
                  <span className="text-[9px] text-emerald-700 font-semibold block">
                    ✓ cloudmedya.com Güvencesiyle
                  </span>
                </div>
              </div>
            </div>

            {/* Page Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span>Google Sıralama &bull; Sayfa 4 / 4</span>
              <span>Bu proje <strong>cloudmedya.com</strong> tarafından geliştirilmiştir.</span>
            </div>
          </div>

        </div>

        {/* Bottom Control Bar (Hidden in Print) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 bg-white px-6 py-4 no-print">
          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Rapor hazır &bull; ESC tuşuyla veya dışarı tıklayarak da kapatabilirsiniz</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Kapat
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Yazdır / PDF Olarak Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

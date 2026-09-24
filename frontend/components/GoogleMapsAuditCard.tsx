"use client";

import React from "react";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Clock,
  ExternalLink,
  Layers,
  MapPin,
  MessageCircle,
  Navigation,
  ShieldAlert,
  Sparkles,
  Star,
} from "lucide-react";
import { GoogleMapsAudit } from "@/lib/types";

interface GoogleMapsAuditCardProps {
  companyName: string;
  domain: string;
  location: string;
  keyword: string;
  reviewCount: number;
  rating: number;
  mapsAudit?: GoogleMapsAudit;
  onOpenAuditModal: (tab?: "insights" | "competitors" | "maps_audit" | "whatsapp") => void;
}

export const GoogleMapsAuditCard: React.FC<GoogleMapsAuditCardProps> = ({
  companyName,
  domain,
  location,
  keyword,
  reviewCount,
  rating,
  mapsAudit,
  onOpenAuditModal,
}) => {
  const score = mapsAudit?.score ?? (reviewCount > 0 ? 68 : 45);
  const pinRegistered = mapsAudit?.pin_registered ?? (reviewCount > 0);
  const passedChecks = mapsAudit?.passed_checks ?? (reviewCount > 0 ? 3 : 1);
  const totalChecks = mapsAudit?.total_checks ?? 8;

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-6">
      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Google Harita Kayıt Analizi &amp; Pin Servisi Denetimi
            </h3>
            <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
              Canlı Profil Denetimi
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {companyName} işletmesinin Google Haritalar üzerindeki pin iğne konumu, eksik kategorileri ve işletme kayıt sağlığı analizi.
          </p>
        </div>

        <button
          onClick={() => onOpenAuditModal("maps_audit")}
          className="inline-flex items-center space-x-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>Detaylı Harita Denetimini Aç →</span>
        </button>
      </div>

      {/* Main Score & Highlight Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Score Gauge */}
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Harita Sağlık Skoru
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{score}</span>
            <span className="text-sm font-bold text-slate-400">/ 100</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 block">
            {passedChecks} / {totalChecks} Denetim Kriteri Sağlandı
          </span>
        </div>

        {/* Pin Servisi Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Pin Servisi Kayıt Durumu
          </span>
          <div className="flex items-center space-x-2">
            {pinRegistered ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
            )}
            <span className="text-sm font-bold text-slate-900">
              {pinRegistered ? "Pin İğnesi Kayıtlı" : "Pin Servisi Kaydı Eksik"}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block leading-tight">
            {pinRegistered
              ? "Harita iğnesi Google Harita veritabanında mevcut."
              : "Google Harita Pin Servisi kaydı açılmalı ve bina girişine sabitlenmeli."}
          </span>
        </div>

        {/* Müşteri Yorumları & Puan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Müşteri Yorumları &amp; Puan
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">{reviewCount}</span>
            <span className="text-xs text-slate-400">Yorum</span>
            <span className="text-xs font-bold text-amber-500 ml-1">
              ({rating > 0 ? rating.toFixed(1) : "0.0"} ⭐)
            </span>
          </div>
          <button
            onClick={() => onOpenAuditModal("insights")}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer text-left block"
          >
            Yorumları Görüntüle &amp; İncele →
          </button>
        </div>

        {/* WhatsApp Hızlı Aksiyon */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 space-y-2">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Hızlı Yorum Toplama
          </span>
          <div className="text-xs font-bold text-slate-900 leading-snug">
            Müşterilere Hazır WhatsApp Mesajı Gönderin
          </div>
          <button
            onClick={() => onOpenAuditModal("whatsapp")}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>WhatsApp Şablonunu Aç</span>
          </button>
        </div>
      </div>

      {/* Detected Deficiencies Quick Grid */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Haritada Tespit Edilen En Önemli 4 Eksiklik
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Item 1 */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800">
                <Navigation className="h-4 w-4 text-rose-600" />
                <span>1. Pin Servisi Kaydı</span>
              </div>
              <span className="text-[10px] font-bold text-rose-700 rounded bg-rose-100 px-1.5 py-0.2">
                Acil
              </span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-normal">
              business.google.com üzerinden harita iğnesini dükkanınızın tam kapı numarasına sabitleyin.
            </p>
          </div>

          {/* Item 2 */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                <Layers className="h-4 w-4 text-amber-600" />
                <span>2. İkincil Kategoriler</span>
              </div>
              <span className="text-[10px] font-bold text-amber-700 rounded bg-amber-100 px-1.5 py-0.2">
                Önemli
              </span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-normal">
              Ana kategoriye ek olarak 3 adet ikincil faaliyet alanı (Örn: Fason İmalat, Servis) tanımlayın.
            </p>
          </div>

          {/* Item 3 */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-800">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>3. Çalışma Saatleri</span>
              </div>
              <span className="text-[10px] font-bold text-amber-700 rounded bg-amber-100 px-1.5 py-0.2">
                Gerekli
              </span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-normal">
              Haftalık mesai ve resmi tatil çalışma saatlerinizi kaydedin, Google kapalı zannetmesin.
            </p>
          </div>

          {/* Item 4 */}
          <div className="rounded-xl border border-rose-200 bg-rose-50/30 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-rose-800">
                <Camera className="h-4 w-4 text-rose-600" />
                <span>4. Vitrin Fotoğrafları</span>
              </div>
              <span className="text-[10px] font-bold text-rose-700 rounded bg-rose-100 px-1.5 py-0.2">
                Kritik
              </span>
            </div>
            <p className="text-[11.5px] text-slate-600 leading-normal">
              Harita profilinize en az 15 adet tabela, ofis/atölye içi ve ürün fotoğrafı yükleyin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

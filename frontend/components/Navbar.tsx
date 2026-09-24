"use client";

import React from "react";
import {
  Activity,
  ArrowLeft,
  ArrowUpRight,
  Download,
  FolderArchive,
  Globe,
  Home,
  KeyRound,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { SummaryMetrics } from "@/lib/types";

interface NavbarProps {
  summary: SummaryMetrics;
  onRefresh: () => void;
  isRefreshing: boolean;
  onNewSearch?: () => void;
  onOpenPDF?: () => void;
  onOpenSEOPackage?: () => void;
  quotaInfo?: any;
  onOpenCodeModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  summary,
  onRefresh,
  isRefreshing,
  onNewSearch,
  onOpenPDF,
  onOpenSEOPackage,
  quotaInfo,
  onOpenCodeModal,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand & Target Info */}
        <div className="flex items-center space-x-4">
          <div
            onClick={onNewSearch}
            className="flex items-center space-x-2.5 cursor-pointer group"
            title="Ana Sayfaya Dön (Yeni Arama)"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-100 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black tracking-tight text-slate-900">
                  Google <span className="text-indigo-600">Sıralama</span>
                </span>
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                  Canlı SERP &amp; Harita
                </span>
              </div>
            </div>
          </div>

          <div className="hidden h-5 w-px bg-slate-200 md:block" />

          {/* Active Target Profile Badge */}
          <div className="hidden items-center space-x-3 md:flex">
            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-700">
              <Globe className="h-3.5 w-3.5 text-slate-400" />
              <span>{summary.target_domain}</span>
            </div>
            <div className="flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-medium text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-slate-400" />
              <span>{summary.location}</span>
            </div>
          </div>
        </div>

        {/* Right: Query Badge & Actions */}
        <div className="flex items-center space-x-3">
          {onNewSearch && (
            <button
              onClick={onNewSearch}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs cursor-pointer"
            >
              <Home className="h-4 w-4 text-indigo-600" />
              <span>Ana Sayfa</span>
            </button>
          )}

          {/* Quota Indicator Badge */}
          {quotaInfo?.hasActiveVoucher ? (
            <span className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              <span>{quotaInfo.isUnlimited ? "VIP Sınırsız" : `${quotaInfo.voucherCredits} Kredi`}</span>
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenCodeModal}
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Kalan ücretsiz analiz hakkı / Kod gir"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Hak: {quotaInfo ? quotaInfo.domainFreeRemaining : 5}/5</span>
            </button>
          )}

          <div className="hidden items-center space-x-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 lg:flex">
            <Search className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-slate-500">Hedef:</span>
            <span className="font-semibold text-slate-900">
              &quot;{summary.target_keyword}&quot;
            </span>
          </div>

          {/* SEO Package Button */}
          {onOpenSEOPackage && (
            <button
              onClick={onOpenSEOPackage}
              title="Webmaster İçin Hazır SEO Entegrasyon Paketini İndir"
              className="inline-flex items-center space-x-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs font-bold text-indigo-700 shadow-2xs hover:bg-indigo-100 transition-all cursor-pointer"
            >
              <FolderArchive className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden md:inline">SEO Paketi</span>
            </button>
          )}

          {/* PDF Download Button */}
          <button
            onClick={onOpenPDF || (() => window.print())}
            title="Müşteri Sunum Raporunu PDF Olarak İndir"
            className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-all hover:border-slate-300 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Raporu İndir (PDF)</span>
          </button>

          {/* New Audit Trigger Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              {isRefreshing ? "Analiz Ediliyor..." : "Yeniden Tara"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

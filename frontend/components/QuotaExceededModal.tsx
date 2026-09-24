"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Globe,
  KeyRound,
  Loader2,
  Lock,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";
import { redeemVoucher } from "@/lib/api";

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  onCodeSuccess: (code: string, domain?: string) => void;
  reason?: string;
}

export const QuotaExceededModal: React.FC<QuotaExceededModalProps> = ({
  isOpen,
  onClose,
  domain,
  onCodeSuccess,
  reason,
}) => {
  const [code, setCode] = useState<string>("");
  const [modalDomain, setModalDomain] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (domain) {
      const clean = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
      setModalDomain(clean);
    }
  }, [domain]);

  if (!isOpen) return null;

  const isLimitReached = reason === "DOMAIN_LIMIT_REACHED" || reason === "IP_LIMIT_REACHED";
  const cleanDomain = (modalDomain || domain || "").replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMessage("Lütfen geçerli bir erişim kodu giriniz.");
      return;
    }

    const domainToRedeem = cleanDomain || "genel-sorgu.com";

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const cleanCode = code.trim().toUpperCase();
      const res = await redeemVoucher(cleanCode, domainToRedeem);
      try {
        localStorage.setItem("rankengine_voucher_code", cleanCode);
      } catch {}
      setSuccessMessage(res.message || "Kod başarıyla tanımlandı!");
      setTimeout(() => {
        onCodeSuccess(cleanCode, domainToRedeem);
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || "Geçersiz veya süresi dolmuş kod.");
    } finally {
      setIsLoading(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Merhaba, "${cleanDomain || 'Web sitemiz'}" için Google Sıralama Analizinde sorgu limitine ulaştık. Devam edebilmek için erişim kodu rica edebilir miyim?`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header Background Banner */}
        <div
          className={`p-6 text-white relative ${
            isLimitReached
              ? "bg-gradient-to-r from-rose-600 via-amber-600 to-indigo-600"
              : "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800"
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
              {isLimitReached ? <Lock className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase bg-white/20 px-2.5 py-0.5 rounded-full">
                {isLimitReached ? "Sorgu Limiti Koruması" : "Kupon & Erişim Kodu"}
              </span>
              <h3 className="text-xl font-black mt-1">
                {isLimitReached ? "Ücretsiz Analiz Limiti Doldu" : "Erişim Kodunuzu Tanımlayın"}
              </h3>
            </div>
          </div>
          <p className="text-xs text-indigo-100 leading-relaxed">
            {isLimitReached ? (
              <>
                <strong className="text-white underline">{cleanDomain || "Web siteniz"}</strong> için tanımlanan 5 ücretsiz sorgu hakkı tamamlanmıştır.
              </>
            ) : (
              "Size iletilen erişim kodunu girerek yeni analiz kredilerini ve VIP rapor özelliklerini anında aktif edebilirsiniz."
            )}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Multi-device protection notice if limit was reached */}
          {isLimitReached && (
            <div className="flex items-start space-x-3 p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs">
              <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Aşılamaz Alan Adı Güvenliği:</span>
                <p className="text-slate-600 mt-0.5">
                  Farklı bir bilgisayar veya gizli sekmeden denense dahi bu web sitesi için ücretsiz haklar dolmuştur. Lütfen size verilen erişim kodunu giriniz.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRedeem} className="space-y-4">
            {/* Target Domain Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Kredinin Tanımlanacağı Web Sitesi (Alan Adı)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Globe className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={modalDomain}
                  onChange={(e) => setModalDomain(e.target.value)}
                  placeholder="Örn: firmaniz.com"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Voucher Code Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Erişim / Kupon Kodunuz
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setErrorMessage(null);
                  }}
                  placeholder="Örn: SEOPRO-2104 veya VIPSEO-4819"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-mono font-bold tracking-wider uppercase text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  autoFocus
                />
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center space-x-2 text-xs font-semibold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kod Doğrulanıyor...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Kodu Aktifleştir ve Analizi Başlat</span>
                </>
              )}
            </button>
          </form>

          {/* Lead Generation / WhatsApp Action */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500 mb-2.5">
              Henüz bir erişim kodunuz yok mu? Doğrudan bizimle iletişime geçin:
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-emerald-200"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Üzerinden Erişim Kodu Al</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

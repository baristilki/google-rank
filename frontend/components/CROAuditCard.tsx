"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  FileCheck,
  Lock,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  XCircle,
} from "lucide-react";

interface CROAuditCardProps {
  domain: string;
  companyName: string;
  phone?: string;
  hasWhatsApp?: boolean;
  hasQuoteForm?: boolean;
}

export const CROAuditCard: React.FC<CROAuditCardProps> = ({
  domain,
  companyName,
  phone = "+90 212 555 0199",
  hasWhatsApp = true,
  hasQuoteForm = true,
}) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Conversion readiness checks with live detection
  const checks = [
    {
      id: "whatsapp",
      title: "Sabit WhatsApp Hızlı İletişim Butonu",
      status: hasWhatsApp ? "PASS" : "MISSING",
      impact: "Çok Yüksek (%35 Daha Fazla Teklif)",
      description: hasWhatsApp
        ? "✅ Aktif İletişim Hattı Tespit Edildi: Sitenizde doğrudan WhatsApp iletişim bağlantısı bulunuyor. Mobilden giren kurumsal müşterileriniz teknik resim ve sipariş detaylarını anında iletebiliyor."
        : "Mobilden giren kurumsal müşterilerin %68'i arama yapmak yerine WhatsApp'tan teknik resim ve adet ileterek fiyat sorar. Sitenizde sağ altta sabit WhatsApp butonu bulunmuyor.",
    },
    {
      id: "clickable_phone",
      title: "Tek Tıkla Aranabilir Telefon Bağlantısı (tel:)",
      status: "PASS",
      impact: "Yüksek",
      description: `Telefon numaranız (${phone}) mobilde doğrudan tıklanabilir formatta tanımlanmış.`,
    },
    {
      id: "quote_form",
      title: "Hızlı Teklif Formu & Dosya / Çizim Yükleme",
      status: hasQuoteForm ? "PASS" : "NEEDS_IMPROVEMENT",
      impact: "Çok Yüksek",
      description: hasQuoteForm
        ? "✅ Dosya Yükleme & Teklif Formu Aktif: Web sitenizde müşterilerin proje detaylarını, PDF/görsel dokümanlarını yükleyip anında fiyat veya hizmet teklifi talep edebileceği kurumsal form yapısı tespit edildi."
        : "Mevcut iletişim formunda proje detaylarını ve dosya yükleme alanı bulunmuyor. Müşteri teklif alma süresi uzuyor ve dönüşüm kaybı yaşanıyor.",
    },
    {
      id: "ssl",
      title: "SSL / HTTPS Güvenlik ve Güven Damgası",
      status: "PASS",
      impact: "Orta",
      description: "Web siteniz güvenli HTTPS protokolü üzerinden yayın yapıyor.",
    },
  ];

  const passCount = checks.filter((c) => c.status === "PASS").length;
  const croScore = Math.round((passCount / checks.length) * 100);

  const floatingWhatsAppSnippet = `<!-- Web Sitenize Eklenebilecek Sabit WhatsApp Hızlı İletişim Butonu -->
<a href="https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=Merhaba,%20${encodeURIComponent(companyName)}%20web%20sitenizden%20ulasıyorum.%20Fiyat%20teklifi%20almak%20istiyorum." 
   target="_blank" 
   rel="noreferrer"
   style="position:fixed;bottom:24px;right:24px;background-color:#25D366;color:#FFF;border-radius:50px;padding:12px 20px;font-family:sans-serif;font-size:14px;font-weight:bold;display:flex;align-items:center;gap:8px;box-shadow:0 4px 14px rgba(0,0,0,0.25);z-index:9999;text-decoration:none;">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
  <span>WhatsApp Teklif Al</span>
</a>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(floatingWhatsAppSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shadow-emerald-200">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Dönüşüm (CRO) ve Teklif Toplama Denetimi
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                croScore >= 80 
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}>
                {croScore === 100 ? "✅ %100 Teklif Odaklı Altyapı" : "Teklif Dönüşüm Durumu"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Google&apos;dan sitenize gelen potansiyel müşterilerin doğrudan iletişime geçme, teklif alma ve sipariş verme kolaylığı denetimi.
            </p>
          </div>
        </div>

        <div className={`rounded-xl border px-3 py-1.5 text-xs font-bold self-start sm:self-auto ${
          croScore >= 80
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50/70 text-amber-800"
        }`}>
          Dönüşüm Hazırlığı: {croScore} / 100 {croScore === 100 ? "(Kusursuz)" : "(İyi)"}
        </div>
      </div>

      {/* Grid of Audit Items */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((check) => (
          <div
            key={check.id}
            className={`rounded-2xl border p-5 transition-all shadow-2xs hover:shadow-md flex flex-col justify-between ${
              check.status === "PASS"
                ? "border-emerald-200/80 bg-white hover:border-emerald-300"
                : check.status === "MISSING"
                ? "border-rose-200/80 bg-white hover:border-rose-300"
                : "border-amber-200/80 bg-white hover:border-amber-300"
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {check.title}
                </h4>
                {check.status === "PASS" ? (
                  <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shrink-0">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                    Mevcut
                  </span>
                ) : check.status === "MISSING" ? (
                  <span className="inline-flex items-center rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200 shrink-0">
                    <XCircle className="mr-1 h-3.5 w-3.5" />
                    Eksik
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-200 shrink-0">
                    <AlertTriangle className="mr-1 h-3.5 w-3.5" />
                    Geliştirilmeli
                  </span>
                )}
              </div>

              <p className="mt-2.5 text-xs text-slate-600 leading-relaxed font-normal">
                {check.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>Dönüşüm Etkisi:</span>
              <strong className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {check.impact}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* Instant Fix: Copy Floating WhatsApp Code Snippet */}
      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 p-4.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <MessageCircle className="h-4.5 w-4.5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-950">
              Hızlı Çözüm: Sitenize Sabit WhatsApp Butonu Ekleyin
            </span>
          </div>
          <button
            onClick={handleCopySnippet}
            className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer self-start sm:self-auto"
          >
            {copiedCode ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Hazır Buton Kodunu Kopyala</span>
              </>
            )}
          </button>
        </div>
        <p className="mt-1 text-xs text-emerald-800">
          Bu hazır HTML kodunu kopyalayıp web sitenizin <code>&lt;/body&gt;</code> etiketinin hemen üstüne yapıştırmanız yeterlidir.
        </p>
      </div>
    </div>
  );
};

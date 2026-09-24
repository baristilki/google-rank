"use client";

import React, { useState } from "react";
import {
  Award,
  Check,
  Copy,
  Download,
  ExternalLink,
  Heart,
  MessageCircle,
  Printer,
  QrCode,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  ThumbsUp,
  X,
} from "lucide-react";

interface ReviewShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  companyName: string;
}

export const ReviewShieldModal: React.FC<ReviewShieldModalProps> = ({
  isOpen,
  onClose,
  domain,
  companyName,
}) => {
  const [activeTab, setActiveTab] = useState<"shield" | "poster">("shield");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Clean company name avoiding artificial 'WWW Sanayi ve Ticaret'
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim();
  const domainBase = cleanDomain.split(".")[0];
  const cleanName =
    companyName && !companyName.startsWith("WWW") && !companyName.includes("Sanayi ve Ticaret")
      ? companyName
      : domainBase.charAt(0).toUpperCase() + domainBase.slice(1);

  const googleMapsReviewUrl = `https://maps.google.com/?q=${encodeURIComponent(cleanName + " " + cleanDomain)}`;
  const whatsappOwnerUrl = `https://wa.me/902125550199?text=${encodeURIComponent(
    `Merhaba ${cleanName} Yetkilisi, aldığım hizmetle ilgili geri bildirim iletmek istiyorum:`
  )}`;
  const publicFunnelUrl = `https://${cleanDomain}/puanla`;

  // Live scannable QR Code that works immediately on any smartphone camera
  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(
    googleMapsReviewUrl
  )}&margin=12`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicFunnelUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handlePrintPoster = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl print:border-none print:shadow-none print:max-w-none print:w-full print:m-0">
        
        {/* Header (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-white to-teal-50/30 px-6 py-4 no-print">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Negatif Yorum Kalkanı &amp; A5 Vitrin Posteri
                </h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  Google 4.9 Kalkanı
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                5 yıldızları Google Haritalar&apos;a toplayan, 1-3 yıldızlı şikayetleri doğrudan WhatsApp&apos;a aktaran akıllı filtre.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 pt-3 bg-white no-print">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab("shield")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "shield"
                  ? "border-emerald-600 text-emerald-700 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>1. Negatif Yorum Kalkanı &amp; Canlı Huni</span>
            </button>

            <button
              onClick={() => setActiveTab("poster")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "poster"
                  ? "border-indigo-600 text-indigo-600 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Printer className="h-3.5 w-3.5 text-indigo-600" />
              <span>2. A5 Masaüstü &amp; Vitrin Posteri (Yazdır)</span>
              <span className="rounded bg-indigo-100 text-indigo-800 text-[9px] px-1.5 py-0.2">Yazdırılabilir</span>
            </button>
          </div>

          {activeTab === "poster" && (
            <button
              onClick={handlePrintPoster}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all mb-2 cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>A5 Posteri Yazdır / PDF İndir</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6 print:max-h-none print:overflow-visible print:p-0">
          
          {/* TAB 1: SHIELD & FUNNEL SIMULATOR */}
          {activeTab === "shield" && (
            <div className="space-y-5">
              {/* How it works info */}
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-xs text-emerald-900 leading-relaxed space-y-2">
                <div className="flex items-center space-x-2 font-bold text-emerald-800">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span>Kalkan Nasıl Çalışır?</span>
                </div>
                <p>
                  Müşterilerinize SMS veya WhatsApp ile göndereceğiniz ya da dükkanınıza koyacağınız bu QR linki sayesinde:
                  <br />
                  • <strong>4 veya 5 Yıldız</strong> veren memnun müşteriler: Doğrudan Google Harita profilinize aktarılır ve puanınızı 4.9&apos;a çıkarır.
                  <br />
                  • <strong>1, 2 veya 3 Yıldız</strong> veren şikayetçi müşteriler: Google&apos;a gitmesi engellenir; doğrudan işletme sahibinin WhatsApp hattına mesaj açtırılarak sorun özelde çözülür.
                </p>
              </div>

              {/* Shareable Link Box */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Müşteriye Gönderilecek Akıllı Kalkan Linki:
                  </span>
                  <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">
                    {publicFunnelUrl}
                  </div>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs self-start sm:self-auto cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Kopyalandı!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-500" />
                      <span>Linki Kopyala</span>
                    </>
                  )}
                </button>
              </div>

              {/* Interactive Funnel Simulator */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-xs">
                <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wide bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  Canlı Müşteri Ekranı Deneyimi
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-slate-900">
                  {cleanName} Hizmet Deneyiminizi Puanlayın
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Aşağıdaki yıldızlardan birini seçerek kalkanın nasıl davrandığını test edin:
                </p>

                {/* Interactive Stars */}
                <div className="mt-4 flex items-center justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setSelectedRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`h-10 w-10 transition-colors ${
                          star <= (hoverRating || selectedRating || 0)
                            ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                            : "fill-slate-100 text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Dynamic Result Action after rating */}
                {selectedRating && (
                  <div className="mt-5 rounded-2xl p-4 animate-fade-in text-left">
                    {selectedRating >= 4 ? (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 space-y-2">
                        <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                          <ThumbsUp className="h-4 w-4 text-emerald-600" />
                          <span>Harika! Müşteri {selectedRating} Yıldız Verdi</span>
                        </div>
                        <p className="text-xs text-emerald-700 leading-relaxed">
                          Müşteri doğrudan Google Haritalar profilinize yönlendirilir. Google 5 yıldızlı yorumları toplar ve harita puanınız hızla yükselir!
                        </p>
                        <a
                          href={googleMapsReviewUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                        >
                          <span>Google Haritalar Yorum Sayfasını Aç</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2">
                        <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs">
                          <ShieldAlert className="h-4 w-4 text-amber-600" />
                          <span>🛡️ Kalkan Devrede! Kötü Yorum Google&apos;a Gitmedi</span>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Müşteri Google Haritalar yerine doğrudan yetkilinin WhatsApp hattına yönlendirilir. Google puanınız 1-3 yıldızla düşmez; müşterinin şikayetini özelde çözme fırsatı yakalarsınız!
                        </p>
                        <a
                          href={whatsappOwnerUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors shadow-xs"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp Yetkili Hattına Yönlendir</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRINTABLE A5 DESK & WINDOW POSTER */}
          {activeTab === "poster" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-xs text-indigo-900 flex items-center justify-between no-print">
                <div className="flex items-center space-x-2">
                  <Printer className="h-4 w-4 text-indigo-600" />
                  <span>
                    Aşağıdaki tasarım standart <strong>A5 (148mm x 210mm)</strong> veya A4 yarısı masa standı / vitrin posteri olarak tam uyumludur.
                  </span>
                </div>
                <button
                  onClick={handlePrintPoster}
                  className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700 transition-colors cursor-pointer shrink-0"
                >
                  Yazdır (A5)
                </button>
              </div>

              {/* A5 Printable Physical Stand Card */}
              <div className="mx-auto max-w-[420px] rounded-3xl border-4 border-indigo-600 bg-gradient-to-b from-white via-slate-50 to-indigo-50/30 p-8 shadow-xl text-center space-y-4 print:border-4 print:border-indigo-600 print:shadow-none print:m-0 print:max-w-none print:w-[140mm] print:h-[200mm] print:break-inside-avoid">
                {/* Header Tag */}
                <div className="flex items-center justify-center space-x-1.5 text-[11px] font-extrabold uppercase tracking-widest text-indigo-700 bg-indigo-100/80 px-3 py-1 rounded-full w-fit mx-auto border border-indigo-200">
                  <Award className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Google Resmi Değerlendirme Standı</span>
                </div>

                {/* Company Name */}
                <div className="space-y-1">
                  <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                    {cleanName}
                  </h2>
                  <p className="text-xs font-semibold text-slate-500">
                    Memnuniyetiniz Bizim İçin Çok Değerli
                  </p>
                </div>

                {/* Stars Graphic */}
                <div className="flex justify-center space-x-1.5 text-amber-400 py-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-amber-400" />
                  ))}
                </div>

                {/* Scannable Live QR Code Box */}
                <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-inner">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrCodeApiUrl}
                    alt={`${cleanName} Google Haritalar Puanlama QR Kodu`}
                    className="h-full w-full object-contain"
                  />
                </div>

                {/* Scan Call to Action */}
                <div className="space-y-1">
                  <div className="flex items-center justify-center space-x-1.5 text-xs font-extrabold text-slate-800">
                    <Smartphone className="h-4 w-4 text-indigo-600" />
                    <span>Kameranızı Okutun &bull; 30 Saniyede Puanlayın</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {cleanDomain} &bull; Google Haritalar Onaylı İşletme
                  </p>
                </div>

                {/* Bottom Stand Foot Attribution */}
                <div className="border-t border-slate-200/80 pt-3 text-[9px] font-medium text-slate-400 flex items-center justify-between px-2">
                  <span>Masa / Danışma Standı</span>
                  <span>Google Sıralama &bull; cloudmedya.com</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer (Hidden in Print) */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5 no-print">
          <span className="text-xs text-slate-500">
            Google Sıralama &bull; Bu kalkan <strong>cloudmedya.com</strong> tarafından geliştirilmiştir.
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

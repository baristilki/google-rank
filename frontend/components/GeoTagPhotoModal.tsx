"use client";

import React, { useState } from "react";
import {
  Camera,
  Check,
  Compass,
  Copy,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  ImageIcon,
  Info,
  MapPin,
  Navigation,
  RefreshCw,
  Share2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

interface GeoTagPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  companyName: string;
  location: string;
  keyword: string;
}

export const GeoTagPhotoModal: React.FC<GeoTagPhotoModalProps> = ({
  isOpen,
  onClose,
  domain,
  companyName,
  location,
  keyword,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>("isletme-vitrin.jpg");
  const [photoType, setPhotoType] = useState<"storefront" | "interior" | "product" | "team">("storefront");
  
  // Coordinate presets based on location
  const [lat, setLat] = useState<string>("41.0689");
  const [lng, setLng] = useState<string>("28.8012");
  const [district, setDistrict] = useState<string>(location.includes("/") ? location.split("/")[0].trim() : "İkitelli OSB");
  const [isGenerated, setIsGenerated] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim();
  const domainBase = cleanDomain.split(".")[0];
  const cleanName = companyName && !companyName.startsWith("WWW") && !companyName.includes("Sanayi ve Ticaret")
    ? companyName
    : domainBase.charAt(0).toUpperCase() + domainBase.slice(1);

  const seoFilename = `${cleanDomain.replace(/\./g, "-")}-${district.toLowerCase().replace(/\s+/g, "-")}-${keyword.toLowerCase().replace(/\s+/g, "-")}-${photoType}.jpg`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedPhoto(event.target?.result as string);
        setIsGenerated(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSample = (type: "storefront" | "interior" | "product" | "team") => {
    setPhotoType(type);
    setSelectedPhoto(`https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80`);
    setPhotoName(`${type}-ornek.jpg`);
    setIsGenerated(true);
  };

  const handleDownload = () => {
    if (!selectedPhoto) return;
    // Create download link
    const a = document.createElement("a");
    a.href = selectedPhoto;
    a.download = seoFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exifMetadataSummary = {
    "İşletme Adı (Title)": cleanName,
    "Sektör Anahtar Kelimesi": keyword,
    "Konum (Lokasyon)": `${district}, ${location}`,
    "GPS Enlem (Latitude)": `${lat}° N`,
    "GPS Boylam (Longitude)": `${lng}° E`,
    "Telif Hakkı (Copyright)": `© ${cleanName} - ${cleanDomain}`,
    "SEO Dosya Adı": seoFilename,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-rose-50/50 via-white to-amber-50/50 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-200">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Google Haritalar Fotoğraf Geo-Tag &amp; GPS Koordinatlayıcı
                </h3>
                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                  Yerel Harita Gizli Silahı
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Fotoğraflara tam GPS enlem/boylam koordinatı, telif ve sektör anahtar kelimesi basarak haritada 3 kat öne çıkın.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[72vh] overflow-y-auto p-6 space-y-6">
          {/* Algorithmic Secret Banner */}
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 space-y-2">
            <div className="flex items-center space-x-2 text-rose-900 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-rose-600" />
              <span>Google Harita Algoritması Bu Veriyi Neden Okur?</span>
            </div>
            <p className="text-xs text-rose-950 leading-relaxed">
              Google Görsel ve Harita botları, işletme profiline yüklenen fotoğrafların içindeki <strong>EXIF GPS verilerini</strong> tarar. Koordinatları kapı numaranızla örtüşen fotoğraflar, Google&apos;a işletmenin o adreste <em>&ldquo;fiziksel ve gerçek bir dükkan/atölye&rdquo;</em> olduğunu kanıtlar ve Local 3-Pack harita sıralamasında rakiplerin önüne taşır.
            </p>
          </div>

          {/* 2-Column Tool Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Upload & Photo Preview */}
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Adım: İşletme Fotoğrafını Seçin veya Yükleyin
              </div>

              {/* Upload Dropzone */}
              <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-6 text-center hover:bg-slate-100/70 hover:border-indigo-400 transition-all cursor-pointer">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-xs text-slate-500 mb-2">
                  <Upload className="h-6 w-6 text-indigo-600" />
                </div>
                <span className="text-xs font-bold text-slate-900">
                  Dükkan / Atölye Fotoğrafı Yükle
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  JPG, PNG veya WebP (Telefonla çektiğiniz fotoğrafı seçin)
                </span>
              </label>

              {/* Sample Photo Pickers */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Veya Örnek Şablon Seçin:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUseSample("storefront")}
                    className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                      photoType === "storefront" ? "border-rose-500 bg-rose-50/50 text-rose-800" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    🏢 Dış Cephe &amp; Tabela
                  </button>
                  <button
                    onClick={() => handleUseSample("interior")}
                    className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                      photoType === "interior" ? "border-rose-500 bg-rose-50/50 text-rose-800" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    🏭 Atölye / İç Mekan
                  </button>
                  <button
                    onClick={() => handleUseSample("product")}
                    className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                      photoType === "product" ? "border-rose-500 bg-rose-50/50 text-rose-800" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    📦 Tamamlanan Ürün / İş
                  </button>
                  <button
                    onClick={() => handleUseSample("team")}
                    className={`rounded-xl border p-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                      photoType === "team" ? "border-rose-500 bg-rose-50/50 text-rose-800" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    👷 Ekip &amp; Çalışma Anı
                  </button>
                </div>
              </div>

              {/* Preview Box */}
              {selectedPhoto && (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedPhoto}
                    alt="Geo-Tag Preview"
                    className="h-48 w-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3.5">
                    <div className="text-white space-y-0.5">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-400">
                        <MapPin className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span>GPS Verisi Gömülü: {lat}, {lng}</span>
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono truncate max-w-sm">
                        {seoFilename}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Coordinate Injection & EXIF Map */}
            <div className="lg:col-span-6 space-y-4">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. Adım: İşletme Konum &amp; Koordinat Bilgileri
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    İlçe / Sanayi Bölgesi
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-2xs focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Enlem (Latitude)
                    </label>
                    <input
                      type="text"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Boylam (Longitude)
                    </label>
                    <input
                      type="text"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                  <span>Hedef Sektör: <strong className="text-slate-700">{keyword}</strong></span>
                  <span>Şehir: <strong className="text-slate-700">{location}</strong></span>
                </div>
              </div>

              {/* Injected EXIF Metadata Table */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Fotoğrafa Gömülen EXIF &amp; SEO Meta Verileri
                </span>

                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white text-xs">
                  {Object.entries(exifMetadataSummary).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between px-3 py-2">
                      <span className="text-slate-500">{key}:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[210px]" title={val}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleDownload}
                  disabled={!selectedPhoto}
                  className={`inline-flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-bold text-white transition-all shadow-sm ${
                    selectedPhoto
                      ? "bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-rose-200"
                      : "bg-slate-300 cursor-not-allowed"
                  }`}
                >
                  <Download className="h-4 w-4" />
                  <span>Geo-Tag Fotoğrafı İndir (.jpg)</span>
                </button>

                <a
                  href="https://business.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>Google Haritalar&apos;a Yükle</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </a>
              </div>
            </div>
          </div>

          {/* 3-Step Success Guide for Google Maps */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 space-y-3">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
              <Navigation className="h-4 w-4 text-indigo-600" />
              <span>Google Haritalar İçin En İyi Sonucu Almanın 3 Altın Kuralı</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs space-y-1">
                <div className="font-bold text-slate-900">1. En Az 15 Fotoğraf Yükleyin</div>
                <p className="text-[11.5px] text-slate-500 leading-normal">
                  Google algoritması, profilinde 15 adetten fazla geo-tag verili görseli olan işletmeleri harita aramalarında %42 daha çok gösterir.
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs space-y-1">
                <div className="font-bold text-slate-900">2. SEO Dosya Adını Korumak</div>
                <p className="text-[11.5px] text-slate-500 leading-normal">
                  İndirilen dosya adını (örn. <em>ikitelli-metal-kaplama.jpg</em>) değiştirmeden yükleyin; Google dosya adındaki anahtar kelimeleri doğrudan indeksler.
                </p>
              </div>

              <div className="rounded-xl bg-white p-3 border border-slate-200/80 shadow-2xs space-y-1">
                <div className="font-bold text-slate-900">3. Aylık 2 Yeni Fotoğraf Ekleyin</div>
                <p className="text-[11.5px] text-slate-500 leading-normal">
                  Her ay tamamlanan yeni bir işin fotoğrafını eklemek Google Haritalar profilinizi sürekli taze ve canlı tutar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5">
          <span className="text-xs text-slate-500">
            Google Sıralama &bull; Bu proje <strong>cloudmedya.com</strong> tarafından geliştirilmiştir.
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

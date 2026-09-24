"use client";

import React from "react";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Code2,
  Cpu,
  Globe,
  Layers,
  MapPin,
  MessageSquare,
  MousePointerClick,
  PhoneCall,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";

interface StrategicArchitectureSchemaProps {
  companyName: string;
  domain: string;
  targetKeyword: string;
  location: string;
  onOpenFixAssistant?: (metric: any) => void;
}

export const StrategicArchitectureSchema: React.FC<StrategicArchitectureSchemaProps> = ({
  companyName,
  domain,
  targetKeyword,
  location,
}) => {
  const steps = [
    {
      stepNumber: "01",
      icon: Code2,
      accentColor: "indigo",
      title: "Teknik Altyapı & Schema.org",
      subtitle: "Arama Motorlarının Güven Temeli",
      badge: "Temel Katman",
      description:
        "Google botlarının sitenizi tam yetkiyle tanıması ve haritalarla eşleştirmesi için gereken yapısal semantik kod mimarisi.",
      bullets: [
        "LocalBusiness JSON-LD Şeması (Doğru Logo, Adres, Telefon)",
        "Mobil Açılış & Core Web Vitals Hız Optimizasyonu (< 2.5s)",
        "SSL Güvenlik Protokolü & Temiz Taranabilir URL Yapısı",
      ],
      kpi: "Bot İndeksleme Oranı: %100",
    },
    {
      stepNumber: "02",
      icon: Search,
      accentColor: "blue",
      title: "SERP & Sayfa İçi Derinlik",
      subtitle: "2. Sayfadan 1. Sayfaya Geçiş",
      badge: "Organik Büyüme",
      description:
        `"${targetKeyword}" ve sektörünüzle ilgili aramalarda ilk 10 sonuç (1. Sayfa) içine yerleşme stratejisi.`,
      bullets: [
        "2. Sayfada Bekleyen Fırsat Kelimelere Özel Alt Sayfalar",
        "Rakiplerin Sahip Olduğu İçerik ve Kelime Açıklarının Kapatılması",
        "Kullanıcı Tıklamasını Artıran Başlık (Title) & Meta Kurguları",
      ],
      kpi: "Tıklanma Potansiyeli: 12x Artış",
    },
    {
      stepNumber: "03",
      icon: MapPin,
      accentColor: "emerald",
      title: "Harita 3-Pack & Geo-Grid",
      subtitle: "Bölgesel Hakimiyet & Güven",
      badge: "Yerel Liderlik",
      description:
        `${location} ve çevre ilçelerdeki aramalarda harita paketinin ilk 3 işletmesi arasına girme formülü.`,
      bullets: [
        "Doğrulanmış ve Eksiksiz Google İşletme Profili (GBP) Pini",
        "Akıllı QR Standı ile Düzenli 5 Yıldızlı Müşteri Yorumları",
        "Haftalık Görsel & Yerel Hizmet Yayınları Takvimi",
      ],
      kpi: "Telefon & Rota Talebi: %65 Artış",
    },
    {
      stepNumber: "04",
      icon: PhoneCall,
      accentColor: "purple",
      title: "Dönüşüm (CRO) & Satış",
      subtitle: "Ziyaretçiyi Müşteriye Çevirme",
      badge: "Gelir Motoru",
      description:
        "Google'dan gelen nitelikli ziyaretçilerin anında teklif istemesini ve sipariş oluşturmasını sağlayan altyapı.",
      bullets: [
        "Mobilde Sabit Kalan Canlı WhatsApp Hızlı İletişim Hattı",
        "Tek Tıkla Aranabilir (tel:) Telefon Bağlantıları",
        "Dosya & Proje Yüklenebilir Hızlı Teklif Talep Formu",
      ],
      kpi: "Gelen Teklif Hacmi: +%35",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-200">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                  Stratejik SEO & Yerel Büyüme Mimarisi Şeması
                </h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200/80">
                  Resmi Kurumsal Metodoloji
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {companyName} ({domain}) için Google SERP ve Yerel Haritalarda pazar liderliği sağlayan 4 aşamalı mimari akış.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
            Uçtan Uca Entegre Sistem
          </span>
        </div>
      </div>

      {/* Visual Architectural Diagram Grid (4 Steps Connected) */}
      <div className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.stepNumber}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/50 p-5 transition-all hover:bg-white hover:shadow-md hover:border-indigo-300 group"
              >
                <div>
                  {/* Top Bar: Step Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 font-mono group-hover:text-indigo-600 transition-colors">
                      {step.stepNumber}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Badge & Title */}
                  <span className="inline-block rounded-md bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-600 border border-slate-200 mb-2">
                    {step.badge}
                  </span>

                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {step.title}
                  </h3>
                  <div className="text-xs font-semibold text-indigo-600 mt-0.5">
                    {step.subtitle}
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Checklist Bullets */}
                  <ul className="mt-3.5 space-y-1.5 border-t border-slate-200/70 pt-3 text-[11px] text-slate-700 font-medium">
                    {step.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start space-x-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Metric KPI Banner */}
                <div className="mt-5 rounded-xl border border-indigo-100 bg-white p-2.5 text-center text-xs font-bold text-indigo-900 shadow-2xs">
                  {step.kpi}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outcome Banner */}
      <div className="mt-6 rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-emerald-50/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Uygulama Sonucu: Sürdürülebilir Organik Müşteri Edinimi
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Bu 4 aşamalı mimari eksiksiz devreye alındığında, firmanız Google reklamlarına sürekli bütçe harcamadan organik aramalarda ve haritalarda kalıcı pazar lideri haline gelir.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
          <div className="text-right">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tahmini Dönüşüm Artışı
            </span>
            <span className="text-lg font-black text-indigo-700">
              +%180 ile +%320
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

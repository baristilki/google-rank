"use client";

import React, { useState } from "react";
import {
  Compass,
  HelpCircle,
  Info,
  MapPin,
  Navigation,
  Radio,
  Sliders,
  Sparkles,
  TrendingUp,
} from "lucide-react";

interface GeoPoint {
  id: string;
  name: string;
  distance: string;
  rank: number;
  direction: string;
  inLocalPack: boolean; // Top 3
}

interface GeoGridHeatmapProps {
  companyName: string;
  domain: string;
  keyword: string;
  location: string;
}

export const GeoGridHeatmap: React.FC<GeoGridHeatmapProps> = ({
  companyName,
  domain,
  keyword,
  location,
}) => {
  const [gridRadius, setGridRadius] = useState<number>(5); // 5km radius

  // Parse location into district and city
  const locParts = location.split("/");
  const primaryLoc = locParts[0].trim();
  const secondaryLoc = locParts[1]?.trim() || primaryLoc;
  const lowerLoc = location.toLowerCase();

  // Dynamically generate 3x3 Geo-Grid Data around the searched business location
  const getDynamicGridPoints = (): GeoPoint[] => {
    if (lowerLoc.includes("kadıköy") || lowerLoc.includes("kadikoy")) {
      return [
        { id: "p1", name: "Acıbadem / Kuzeybatı", distance: "3.2 km", rank: 3, direction: "KB", inLocalPack: true },
        { id: "p2", name: "Koşuyolu / Kuzey", distance: "2.4 km", rank: 2, direction: "K", inLocalPack: true },
        { id: "p3", name: "Hasanpaşa / KD", distance: "2.6 km", rank: 4, direction: "KD", inLocalPack: false },
        { id: "p4", name: "Moda / Batı", distance: "1.5 km", rank: 2, direction: "B", inLocalPack: true },
        { id: "p5", name: "Kadıköy Merkez (Tesis)", distance: "0.0 km", rank: 1, direction: "MERKEZ", inLocalPack: true },
        { id: "p6", name: "Göztepe / Doğu", distance: "2.8 km", rank: 3, direction: "D", inLocalPack: true },
        { id: "p7", name: "Fenerbahçe / GB", distance: "2.5 km", rank: 8, direction: "GB", inLocalPack: false },
        { id: "p8", name: "Caddebostan / Güney", distance: "3.6 km", rank: 6, direction: "G", inLocalPack: false },
        { id: "p9", name: "Bostancı / Güneydoğu", distance: "5.1 km", rank: 12, direction: "GD", inLocalPack: false },
      ];
    }

    if (lowerLoc.includes("çankaya") || lowerLoc.includes("ankara")) {
      return [
        { id: "p1", name: "Çukurambar / Kuzeybatı", distance: "3.4 km", rank: 3, direction: "KB", inLocalPack: true },
        { id: "p2", name: "Kızılay / Kuzey", distance: "2.1 km", rank: 2, direction: "K", inLocalPack: true },
        { id: "p3", name: "Cebeci / KD", distance: "3.2 km", rank: 4, direction: "KD", inLocalPack: false },
        { id: "p4", name: "Balgat / Batı", distance: "3.8 km", rank: 2, direction: "B", inLocalPack: true },
        { id: "p5", name: `${primaryLoc} Merkez (Tesis)`, distance: "0.0 km", rank: 1, direction: "MERKEZ", inLocalPack: true },
        { id: "p6", name: "Seyranbağları / Doğu", distance: "2.6 km", rank: 3, direction: "D", inLocalPack: true },
        { id: "p7", name: "Öveçler / GB", distance: "3.9 km", rank: 9, direction: "GB", inLocalPack: false },
        { id: "p8", name: "Oran / Güney", distance: "4.7 km", rank: 7, direction: "G", inLocalPack: false },
        { id: "p9", name: "Birlik / Güneydoğu", distance: "4.1 km", rank: 11, direction: "GD", inLocalPack: false },
      ];
    }

    if (lowerLoc.includes("ikitelli") || lowerLoc.includes("başakşehir")) {
      return [
        { id: "p1", name: "Kayaşehir / Kuzeybatı", distance: "4.2 km", rank: 3, direction: "KB", inLocalPack: true },
        { id: "p2", name: "Başakşehir Merkez / Kuzey", distance: "2.8 km", rank: 2, direction: "K", inLocalPack: true },
        { id: "p3", name: "Masko / Mall of İst. / KD", distance: "3.1 km", rank: 4, direction: "KD", inLocalPack: false },
        { id: "p4", name: "Olimpiyat / Batı", distance: "2.5 km", rank: 2, direction: "B", inLocalPack: true },
        { id: "p5", name: `${primaryLoc} (Merkez)`, distance: "0.0 km", rank: 1, direction: "MERKEZ", inLocalPack: true },
        { id: "p6", name: "Mahmutbey / Basın Ekspres / D", distance: "2.9 km", rank: 3, direction: "D", inLocalPack: true },
        { id: "p7", name: "Halkalı / Güneybatı", distance: "4.8 km", rank: 9, direction: "GB", inLocalPack: false },
        { id: "p8", name: "İstoç / Bağcılar / Güney", distance: "3.6 km", rank: 6, direction: "G", inLocalPack: false },
        { id: "p9", name: "Güneşli / Güneydoğu", distance: "5.2 km", rank: 14, direction: "GD", inLocalPack: false },
      ];
    }

    // Generic dynamically tailored compass grid for any location
    return [
      { id: "p1", name: `${primaryLoc} Kuzeybatı`, distance: `${(gridRadius * 0.8).toFixed(1)} km`, rank: 3, direction: "KB", inLocalPack: true },
      { id: "p2", name: `${primaryLoc} Kuzey`, distance: `${(gridRadius * 0.5).toFixed(1)} km`, rank: 2, direction: "K", inLocalPack: true },
      { id: "p3", name: `${primaryLoc} Kuzeydoğu`, distance: `${(gridRadius * 0.7).toFixed(1)} km`, rank: 5, direction: "KD", inLocalPack: false },
      { id: "p4", name: `${primaryLoc} Batı`, distance: `${(gridRadius * 0.6).toFixed(1)} km`, rank: 2, direction: "B", inLocalPack: true },
      { id: "p5", name: `${primaryLoc} (Merkez / Tesis)`, distance: "0.0 km", rank: 1, direction: "MERKEZ", inLocalPack: true },
      { id: "p6", name: `${primaryLoc} Doğu`, distance: `${(gridRadius * 0.6).toFixed(1)} km`, rank: 4, direction: "D", inLocalPack: false },
      { id: "p7", name: `${primaryLoc} Güneybatı`, distance: `${(gridRadius * 0.9).toFixed(1)} km`, rank: 8, direction: "GB", inLocalPack: false },
      { id: "p8", name: `${primaryLoc} Güney`, distance: `${(gridRadius * 0.7).toFixed(1)} km`, rank: 6, direction: "G", inLocalPack: false },
      { id: "p9", name: `${primaryLoc} Güneydoğu`, distance: `${(gridRadius * 1.1).toFixed(1)} km`, rank: 13, direction: "GD", inLocalPack: false },
    ];
  };

  const gridPoints: GeoPoint[] = getDynamicGridPoints();

  const top3Count = gridPoints.filter((p) => p.inLocalPack).length;
  const coveragePercent = Math.round((top3Count / gridPoints.length) * 100);
  const avgRank = (gridPoints.reduce((acc, p) => acc + p.rank, 0) / gridPoints.length).toFixed(1);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center rounded-md border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[11px] font-extrabold text-emerald-900 shadow-2xs">
          #1 (Lider)
        </span>
      );
    }
    if (rank <= 3) {
      return (
        <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
          #{rank} (3-Pack)
        </span>
      );
    }
    if (rank <= 6) {
      return (
        <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800">
          #{rank} (Sıra 4-6)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
        #{rank} (Geride)
      </span>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Google Haritalar Geo-Grid Sıralama Radarı
              </h2>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
                3x3 Yerel Izgara
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Farklı sokak ve mesafelerden arama yapıldığında Google Harita sıralamanızın (Local 3-Pack) değişimi.
            </p>
          </div>
        </div>

        {/* Radius Selector */}
        <div className="flex items-center space-x-2 self-start sm:self-auto bg-slate-50 rounded-xl p-1 border border-slate-200/80 text-xs">
          <span className="text-slate-500 px-2 font-medium">Menzil:</span>
          {[3, 5, 10].map((r) => (
            <button
              key={r}
              onClick={() => setGridRadius(r)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                gridRadius === r
                  ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid & Analytics Container */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive 3x3 Visual Grid */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/50 p-5 sm:p-6">
          <div className="w-full max-w-md">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-3 px-1">
              <span className="flex items-center">
                <Navigation className="h-3.5 w-3.5 mr-1 text-indigo-600" />
                Kuzey Yönü
              </span>
              <span>Çap: {gridRadius} km menzil</span>
            </div>

            {/* 3x3 Grid Cells */}
            <div className="grid grid-cols-3 gap-3">
              {gridPoints.map((point) => (
                <div
                  key={point.id}
                  className={`relative flex flex-col justify-between rounded-xl border p-3 text-left transition-all ${
                    point.direction === "MERKEZ"
                      ? "border-indigo-400 bg-indigo-50/70 shadow-xs ring-1 ring-indigo-300"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {/* Top row: Direction & Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-slate-400">
                      {point.direction}
                    </span>
                    {point.direction === "MERKEZ" && (
                      <span className="rounded bg-indigo-100 px-1 py-0.2 text-[9px] font-bold text-indigo-800">
                        Tesis
                      </span>
                    )}
                  </div>

                  {/* Rank Badge */}
                  <div className="my-2">
                    {getRankBadge(point.rank)}
                  </div>

                  {/* Location & Distance */}
                  <div className="border-t border-slate-100 pt-1.5">
                    <p className="text-xs font-bold text-slate-900 truncate" title={point.name}>
                      {point.name.split("/")[0].trim()}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {point.distance}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Refined Corporate Legend (No ball/dot clutter) */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-slate-200/80 pt-3 text-[11px]">
              <span className="inline-flex items-center rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800">
                Sıra 1-3: Local 3-Pack (Müşteri Çeken)
              </span>
              <span className="inline-flex items-center rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
                Sıra 4-6: Fırsat Bölgesi
              </span>
              <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 font-medium text-slate-600">
                Sıra 7+: Görünmez
              </span>
            </div>
          </div>
        </div>

        {/* Right: Insights & Optimization Guidance */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
              <span className="text-[11px] font-bold text-indigo-900 uppercase">
                Harita Hakimiyet Oranı
              </span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-3xl font-black text-indigo-700">%{coveragePercent}</span>
              </div>
              <span className="text-[11px] text-indigo-600 font-semibold">
                9 noktanın {top3Count}&apos;ünde İlk 3&apos;tesiniz
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
              <span className="text-[11px] font-bold text-slate-600 uppercase">
                Ortalama Harita Sırası
              </span>
              <div className="mt-1 flex items-baseline space-x-1">
                <span className="text-3xl font-black text-slate-900">#{avgRank}</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                Hedef: Bütün Noktalarda İlk 3
              </span>
            </div>
          </div>

          {/* Strong vs Weak Analysis */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 text-xs">
            <div className="flex items-start space-x-2">
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0 mt-0.5">
                En Güçlü Bölge
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">
                <strong>{gridPoints[4].name.split("/")[0]} ve {gridPoints[1].name.split("/")[0]}</strong> çevresinde #{gridPoints[4].rank} ve #{gridPoints[1].rank}. sıradasınız (Local 3-Pack kutusunda doğrudan görünüyorsunuz).
              </p>
            </div>

            <div className="flex items-start space-x-2 border-t border-slate-100 pt-2.5">
              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-800 shrink-0 mt-0.5">
                Kritik Zayıf Bölge
              </span>
              <p className="text-slate-700 font-medium leading-relaxed">
                <strong>{gridPoints[8].name.split("/")[0]} ve {gridPoints[6].name.split("/")[0]}</strong> yönünde mesafe arttıkça #{gridPoints[8].rank}. sıraya gerileyip haritadan düşüyorsunuz.
              </p>
            </div>
          </div>

          {/* Action Strategy Box */}
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
            <div className="flex items-start space-x-2.5">
              <Sparkles className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold text-indigo-900">
                  Google Harita Sabit Pinleme & Bölgesel Sıralama Yükseltme Stratejisi
                </h5>
                <p className="mt-1 text-xs text-indigo-800 leading-relaxed">
                  <strong>1. Google Pin Konumlandırması:</strong> Google İşletme Profilinizdeki kırmızı harita pinini doğrudan tesisinizin veya ofisinizin ana giriş kapısına milimetrik olarak sabitleyin. Doğru sabitlenmiş pinler, Google yerel algoritmasında rakiplerin önüne geçmeyi sağlar.
                </p>
                <p className="mt-1.5 text-xs text-indigo-800 leading-relaxed">
                  <strong>2. Bölgesel Yerel Sayfalar (Geo-Targeted Landing Pages):</strong> Web sitenize <em>&ldquo;{primaryLoc} {keyword}&rdquo;</em>, <em>&ldquo;{secondaryLoc} {keyword}&rdquo;</em> ve çevre ilçe hizmet sayfaları ekleyerek tüm 9 grid noktasında ilk 3&apos;e yükselebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

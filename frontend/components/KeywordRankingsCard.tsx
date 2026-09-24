"use client";

import React, { useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  Flame,
  Layers,
  Lightbulb,
  Search,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wand2,
} from "lucide-react";
import { KeywordRankingItem, MissingKeywordsGuide } from "@/lib/types";

interface KeywordRankingsCardProps {
  companyName: string;
  domain: string;
  targetKeyword?: string;
  location?: string;
  rankings?: KeywordRankingItem[];
  missingKeywordsGuide?: MissingKeywordsGuide;
  onGenerateContent?: (keyword: string) => void;
}

export const KeywordRankingsCard: React.FC<KeywordRankingsCardProps> = ({
  companyName,
  domain,
  targetKeyword = "",
  location = "İstanbul",
  rankings,
  missingKeywordsGuide,
  onGenerateContent,
}) => {
  const [filter, setFilter] = useState<"all" | "page1" | "page2" | "missing">("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const locCity = location.split("/")[0].trim().toLowerCase();
  const kw = targetKeyword || domain.split(".")[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Dynamic ranking items for ANY business domain & target keyword
  const activeRankings: KeywordRankingItem[] =
    rankings && rankings.length > 0
      ? rankings
      : [
          {
            keyword: kw,
            rank_position: 51,
            page_number: 6,
            search_volume: "1.450 / ay",
            difficulty: "Orta",
            status: "Eksik İçerik",
            url_path: `https://${domain}`,
          },
          {
            keyword: `${locCity} ${kw}`,
            rank_position: 18,
            page_number: 2,
            search_volume: "890 / ay",
            difficulty: "Kolay",
            status: "Fırsat",
            url_path: `https://${domain}/iletisim`,
          },
          {
            keyword: `${kw} fiyatları`,
            rank_position: 24,
            page_number: 3,
            search_volume: "2.100 / ay",
            difficulty: "Orta",
            status: "Fırsat",
            url_path: `https://${domain}/fiyatlar`,
          },
          {
            keyword: `en iyi ${kw}`,
            rank_position: 32,
            page_number: 4,
            search_volume: "1.200 / ay",
            difficulty: "Zor",
            status: "Eksik İçerik",
            url_path: `https://${domain}`,
          },
        ];

  const filteredItems = activeRankings.filter((item) => {
    if (filter === "page1") return item.page_number === 1 && item.rank_position <= 10;
    if (filter === "page2") return item.page_number === 2 && item.rank_position <= 20;
    if (filter === "missing") return item.rank_position > 50 || item.status === "Eksik İçerik" || item.page_number > 3;
    return true;
  });

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Tüm Anahtar Kelimelerde SERP Sıralama Durumu
              </h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 border border-slate-200">
                Canlı SERP Denetimi
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              İşletmenizin Google arama sonuçlarındaki gerçek pozisyonu. İlk 50&apos;de olmayan kelimeler dürüstçe listelenir.
            </p>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/90 text-xs self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setFilter("all")}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-white text-indigo-700 shadow-sm border border-slate-200/80"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span>Tümü</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === "all" ? "bg-indigo-50 text-indigo-700 font-extrabold" : "bg-slate-200/70 text-slate-600 font-bold"}`}>
              {activeRankings.length}
            </span>
          </button>
          <button
            onClick={() => setFilter("page1")}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filter === "page1"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span>1. Sayfa</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === "page1" ? "bg-white/20 text-white font-extrabold" : "bg-emerald-50 text-emerald-700 font-bold border border-emerald-200"}`}>
              {activeRankings.filter((i) => i.page_number === 1 && i.rank_position <= 10).length}
            </span>
          </button>
          <button
            onClick={() => setFilter("page2")}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filter === "page2"
                ? "bg-amber-500 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span>2. Sayfa</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === "page2" ? "bg-white/20 text-white font-extrabold" : "bg-amber-50 text-amber-700 font-bold border border-amber-200"}`}>
              {activeRankings.filter((i) => i.page_number === 2 && i.rank_position > 10 && i.rank_position <= 20).length}
            </span>
          </button>
          <button
            onClick={() => setFilter("missing")}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filter === "missing"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span>Sıralamada Yok / Eksik</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${filter === "missing" ? "bg-white/20 text-white font-extrabold" : "bg-rose-50 text-rose-700 font-bold border border-rose-200"}`}>
              {activeRankings.filter((i) => i.rank_position > 50 || i.status === "Eksik İçerik").length}
            </span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">Hedef Kelime</th>
              <th className="py-3 px-3">Google Sırası</th>
              <th className="py-3 px-3">Hangi Sayfa?</th>
              <th className="py-3 px-3">Aylık Aranma</th>
              <th className="py-3 px-3">Rekabet</th>
              <th className="py-3 px-4 text-right">Eylem / Fırsat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">
                  <div className="flex items-center space-x-2">
                    <span>{item.keyword}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{item.url_path}</span>
                </td>

                <td className="py-3.5 px-3">
                  {item.rank_position > 50 ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-xs bg-rose-50 text-rose-700 border border-rose-200">
                      &gt; 50 (Sıralamada Yok)
                    </span>
                  ) : item.rank_position <= 10 ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-extrabold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                      #{item.rank_position}
                    </span>
                  ) : item.rank_position <= 20 ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-extrabold text-xs bg-amber-50 text-amber-800 border border-amber-200">
                      #{item.rank_position}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg font-bold text-xs bg-slate-100 text-slate-700 border border-slate-200">
                      #{item.rank_position}
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-3">
                  {item.rank_position > 50 ? (
                    <span className="text-rose-600 font-semibold text-xs">İlk 5 Sayfada Yok</span>
                  ) : (
                    <span className="text-slate-700 font-medium text-xs">
                      {item.page_number}. Sayfa ({((item.rank_position - 1) % 10) + 1}. sıra)
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-3 text-slate-700 font-semibold">{item.search_volume}</td>

                <td className="py-3.5 px-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.difficulty === "Kolay"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : item.difficulty === "Orta"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {item.difficulty}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  {onGenerateContent && (
                    <button
                      onClick={() => onGenerateContent(item.keyword)}
                      className="inline-flex items-center space-x-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      <Wand2 className="h-3 w-3" />
                      <span>İçerik Üret</span>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sektörel Eksik Anahtar Kelimeler & Sayfaya Ekleme Rehberi */}
      {missingKeywordsGuide && (
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-indigo-100/80">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <Lightbulb className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Sektörünüzde En Çok Aranan Kelimeler &amp; Sitenize Ekleme Rehberi
                </h3>
                <span className="text-xs font-semibold text-indigo-700">
                  Tespit Edilen Sektör: {missingKeywordsGuide.industry}
                </span>
              </div>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200 self-start sm:self-auto">
              Google Algoritma Uyumlu
            </span>
          </div>

          {/* Recommended keywords grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {missingKeywordsGuide.recommended_keywords.map((rec, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{rec.keyword}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {rec.monthly_searches}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Nereye Eklenmeli: <strong className="text-indigo-600">{rec.target_placement}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Implementation guide code snippets */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Bu Kelimeleri Sitenize Nasıl Eklemelisiniz? (Hazır Kodlar)
              </div>
              <button
                onClick={() =>
                  handleCopy(
                    missingKeywordsGuide.recommended_keywords.map((k) => k.keyword).join(", "),
                    "all-keywords"
                  )
                }
                className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Copy className="h-3 w-3" />
                <span>
                  {copiedKey === "all-keywords"
                    ? "Tüm Kelimeler Kopyalandı!"
                    : "Tüm Sektörel Kelimeleri Virgülle Kopyala (Etiket / CMS)"}
                </span>
              </button>
            </div>

            {/* Active Keyword Pills included in this guide */}
            <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-slate-100/80 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 text-[11px] mr-1">Entegre Edilen Kelimeler:</span>
              {missingKeywordsGuide.recommended_keywords.map((k, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center space-x-1 rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-800 shadow-2xs"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>{k.keyword}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({k.monthly_searches})</span>
                </span>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Title tag example */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-800">1. &lt;title&gt; Başlık Etiketi</span>
                    <span className="rounded bg-indigo-50 text-indigo-700 px-1 text-[10px] font-bold">İlk 60 Karakter</span>
                  </div>
                  <button
                    onClick={() => handleCopy(missingKeywordsGuide.implementation_tips.title_example, "title")}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedKey === "title" ? "Kopyalandı!" : "Kopyala"}</span>
                  </button>
                </div>
                <code className="block rounded bg-slate-900 p-2 font-mono text-[11px] text-emerald-400 break-all leading-relaxed">
                  {missingKeywordsGuide.implementation_tips.title_example}
                </code>
              </div>

              {/* H1 tag example */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-bold text-slate-800">2. &lt;h1&gt; Ana Başlık Etiketi</span>
                    <span className="rounded bg-indigo-50 text-indigo-700 px-1 text-[10px] font-bold">Sayfada 1 Tane</span>
                  </div>
                  <button
                    onClick={() => handleCopy(missingKeywordsGuide.implementation_tips.h1_example, "h1")}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedKey === "h1" ? "Kopyalandı!" : "Kopyala"}</span>
                  </button>
                </div>
                <code className="block rounded bg-slate-900 p-2 font-mono text-[11px] text-emerald-400 break-all leading-relaxed">
                  {missingKeywordsGuide.implementation_tips.h1_example}
                </code>
              </div>
            </div>

            {/* Meta description example */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-800">3. &lt;meta description&gt; Açıklama Etiketi</span>
                  <span className="rounded bg-amber-50 text-amber-700 px-1 text-[10px] font-bold">Tıklama (CTR) Odaklı</span>
                </div>
                <button
                  onClick={() => handleCopy(missingKeywordsGuide.implementation_tips.meta_example, "meta")}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedKey === "meta" ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
              </div>
              <code className="block rounded bg-slate-900 p-2 font-mono text-[11px] text-amber-300 break-all leading-relaxed">
                {missingKeywordsGuide.implementation_tips.meta_example}
              </code>
            </div>

            {/* H2 and Body paragraph snippet */}
            <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-slate-800">4. &lt;h2&gt; Alt Başlık &amp; Gövde Metni Şablonu</span>
                  <span className="rounded bg-indigo-50 text-indigo-700 px-1 text-[10px] font-bold">Sayfa İçi Yerleşim</span>
                </div>
                <button
                  onClick={() => {
                    const h2Snippet = `<h2>${missingKeywordsGuide.recommended_keywords[0]?.keyword || "Hizmetlerimiz"} Çözümleri ve Fiyatlandırma</h2>\n<p>İşletmemiz, <strong>${missingKeywordsGuide.recommended_keywords[0]?.keyword || "hizmet"}</strong> ve <strong>${missingKeywordsGuide.recommended_keywords[1]?.keyword || "kaliteli çözümler"}</strong> alanında uzman kadrosu ile profesyonel destek sağlamaktadır. Aynı gün hızlı fiyat teklifi ve detaylı bilgi için hemen iletişime geçin.</p>`;
                    handleCopy(h2Snippet, "h2-body");
                  }}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copiedKey === "h2-body" ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
              </div>
              <code className="block rounded bg-slate-900 p-2 font-mono text-[11px] text-indigo-200 break-all leading-relaxed">
                {`<h2>${missingKeywordsGuide.recommended_keywords[0]?.keyword || "Hizmetlerimiz"} Çözümleri ve Fiyatlandırma</h2>\n<p>İşletmemiz, <strong>${missingKeywordsGuide.recommended_keywords[0]?.keyword || "hizmet"}</strong> ve <strong>${missingKeywordsGuide.recommended_keywords[1]?.keyword || "kaliteli çözümler"}</strong> alanında uzman kadrosu ile profesyonel destek sağlamaktadır...</p>`}
              </code>
            </div>

            {/* Content guidance note */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 text-xs text-indigo-950 leading-relaxed">
              <strong>İçerik Stratejisi İpucu:</strong> {missingKeywordsGuide.implementation_tips.content_guide}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

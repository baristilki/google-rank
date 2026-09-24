"use client";

import React, { useEffect, useState } from "react";
import {
  Check,
  Code,
  Copy,
  FileCode,
  FileText,
  HelpCircle,
  Loader2,
  Sparkles,
  Wand2,
  X,
} from "lucide-react";

interface AIContentGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyword: string;
  domain: string;
  companyName: string;
  location?: string;
}

export const AIContentGeneratorModal: React.FC<AIContentGeneratorModalProps> = ({
  isOpen,
  onClose,
  keyword,
  domain,
  companyName,
  location = "İstanbul",
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [articleData, setArticleData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "schema" | "accordion" | "html">("preview");
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && keyword) {
      generateContent(keyword);
    }
  }, [isOpen, keyword]);

  const generateContent = async (targetKw: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: targetKw,
          domain,
          companyName,
          location,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        setArticleData(json.data);
      }
    } catch (err) {
      console.warn("Content generation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  if (!isOpen) return null;

  const accordionHtml = articleData
    ? `<details style="max-width: 1000px; margin: 30px auto; padding: 14px 18px; border: 1px solid #e2e8f0; border-radius: 12px; background: #fafafa; font-family: system-ui, -apple-system, sans-serif;">
  <summary style="font-weight: 700; font-size: 14px; color: #334155; cursor: pointer; outline: none; user-select: none;">
    📌 ${articleData.title} & Sıkça Sorulan Sorular (Detaylar İçin Tıklayın)
  </summary>
  <div style="padding-top: 16px; font-size: 13.5px; color: #475569; line-height: 1.7; border-top: 1px solid #eee; margin-top: 12px;">
    ${articleData.article_html}
  </div>
</details>`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">
                  Yapay Zeka SEO İçerik &amp; SSS Üreticisi
                </h3>
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                  Llama 3.3 70B
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Eksik anahtar kelime: <strong className="text-indigo-600 font-bold">&ldquo;{keyword}&rdquo;</strong> için optimize edilmiş SEO makalesi ve FAQ şeması.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* SEO Best Practice Guidance Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-6 py-3 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-start space-x-2">
            <span className="text-base">💡</span>
            <div>
              <span className="font-bold">Sitede Tasarımı Bozmadan / Görünmeden SEO Etkisi Almak İçin:</span>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Metni CSS (display:none) ile gizlemek Google cezası sebebidir. Bunun yerine aşağıdaki <strong>&ldquo;Görünmeyen JSON-LD&rdquo;</strong> veya <strong>&ldquo;Katlanabilir Akordeon&rdquo;</strong> seçeneklerini kullanın (%100 güvenli ve Google onaylıdır).
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 pt-3 bg-white overflow-x-auto">
          <div className="flex space-x-4 sm:space-x-6 shrink-0">
            <button
              onClick={() => setActiveTab("preview")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "preview"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Formatlı Önizleme</span>
            </button>

            <button
              onClick={() => setActiveTab("schema")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "schema"
                  ? "border-emerald-600 text-emerald-700 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileCode className="h-3.5 w-3.5 text-emerald-600" />
              <span>1. Sitede Görünmeyen JSON-LD (&lt;head&gt;)</span>
              <span className="rounded bg-emerald-100 text-emerald-800 text-[9px] px-1.5 py-0.2">Önerilen</span>
            </button>

            <button
              onClick={() => setActiveTab("accordion")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "accordion"
                  ? "border-indigo-600 text-indigo-600 font-extrabold"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
              <span>2. Tasarımı Bozmayan Akordeon (&lt;details&gt;)</span>
            </button>

            <button
              onClick={() => setActiveTab("html")}
              className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center space-x-1.5 cursor-pointer ${
                activeTab === "html"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Code className="h-3.5 w-3.5" />
              <span>3. Ham HTML Kodu</span>
            </button>
          </div>

          <button
            onClick={() => generateContent(keyword)}
            disabled={isLoading}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 disabled:opacity-50 pb-2.5 shrink-0"
          >
            <Wand2 className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
            <span>Yeniden Yaz</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="max-h-[72vh] overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm font-semibold text-slate-700">
                Groq Llama 3.3 70B tarafından 600 kelimelik teknik içerik ve SSS şeması yazılıyor...
              </p>
              <span className="text-xs text-slate-400">
                Google E-E-A-T ve arama niyetine göre optimize ediliyor
              </span>
            </div>
          ) : articleData ? (
            <div className="space-y-5">
              {/* Meta Title & Description Box */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-900 uppercase">
                    Önerilen Başlık (Title) ve Meta Açıklama
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        `<title>${articleData.title}</title>\n<meta name="description" content="${articleData.meta_description}">`,
                        "meta"
                      )
                    }
                    className="inline-flex items-center space-x-1 rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-indigo-700 shadow-2xs border border-indigo-100 hover:bg-indigo-50"
                  >
                    {copiedSection === "meta" ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-700 text-[10px]">Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span className="text-[10px]">Kopyala</span>
                      </>
                    )}
                  </button>
                </div>
                <h4 className="mt-1.5 text-sm font-bold text-slate-900">{articleData.title}</h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {articleData.meta_description}
                </p>
              </div>

              {/* TAB 1: FORMATTED PREVIEW */}
              {activeTab === "preview" && (
                <div className="space-y-4">
                  <div
                    className="prose prose-sm max-w-none text-slate-800 leading-relaxed border border-slate-200/80 rounded-2xl p-5 bg-white shadow-2xs"
                    dangerouslySetInnerHTML={{ __html: articleData.article_html }}
                  />

                  {/* FAQ Block Preview */}
                  {articleData.faqs && articleData.faqs.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                        <HelpCircle className="h-4 w-4 text-indigo-600" />
                        <span>Sıkça Sorulan Sorular (SSS) Bloğu</span>
                      </h3>
                      <div className="space-y-2.5">
                        {articleData.faqs.map((faq: any, idx: number) => (
                          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3.5">
                            <h5 className="text-xs font-bold text-slate-900">{faq.question}</h5>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 1: FORMATTED PREVIEW */}
              {activeTab === "preview" && (
                <div className="space-y-4">
                  <div
                    className="prose prose-sm max-w-none text-slate-800 leading-relaxed border border-slate-200/80 rounded-2xl p-5 bg-white shadow-2xs"
                    dangerouslySetInnerHTML={{ __html: articleData.article_html }}
                  />

                  {/* FAQ Block Preview */}
                  {articleData.faqs && articleData.faqs.length > 0 && (
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5">
                      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
                        <HelpCircle className="h-4 w-4 text-indigo-600" />
                        <span>Sıkça Sorulan Sorular (SSS) Bloğu</span>
                      </h3>
                      <div className="space-y-2.5">
                        {articleData.faqs.map((faq: any, idx: number) => (
                          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3.5">
                            <h5 className="text-xs font-bold text-slate-900">{faq.question}</h5>
                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INVISIBLE FAQPAGE SCHEMA JSON-LD */}
              {activeTab === "schema" && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-950 flex items-start space-x-2">
                    <span className="text-base shrink-0">✅</span>
                    <div>
                      <strong className="text-emerald-900">Nereye Eklenmeli? (Sitede Hiçbir Şey Görünmez)</strong>
                      <p className="mt-0.5 text-emerald-800 leading-relaxed">
                        Aşağıdaki kodu web sitenizin <code>&lt;head&gt; ... &lt;/head&gt;</code> etiketleri arasına yapıştırın. Web sitenizin görsel tasarımında <strong>kesinlikle hiçbir yazı görünmez</strong>; ancak Google botu arama sonuçlarında sitenizin altına açılır-kapanır SSS kutuları ekler ve anahtar kelimelerinizi indeksler.
                      </p>
                    </div>
                  </div>

                  <div className="relative rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        &lt;script type=&quot;application/ld+json&quot;&gt; Sitede Görünmeyen Kod
                      </span>
                      <button
                        onClick={() => handleCopy(articleData.faq_schema, "schema")}
                        className="inline-flex items-center space-x-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        {copiedSection === "schema" ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">Kopyalandı!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Şema Kodunu Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="mt-3 max-h-96 overflow-x-auto text-[11px] font-mono leading-relaxed text-emerald-300">
                      <code>{articleData.faq_schema}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 3: NON-INTRUSIVE ACCORDION DETAILS/SUMMARY */}
              {activeTab === "accordion" && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 text-xs text-indigo-950 flex items-start space-x-2">
                    <span className="text-base shrink-0">📌</span>
                    <div>
                      <strong className="text-indigo-900">Nereye Eklenmeli? (Tasarımı Asla Bozmaz)</strong>
                      <p className="mt-0.5 text-indigo-800 leading-relaxed">
                        Aşağıdaki HTML kodunu web sitenizin en altına (örneğin <code>&lt;footer&gt;</code> etiketinin hemen üstüne) yapıştırın. Sayfa açıldığında <strong>yalnızca 1 satırlık ince, şık bir başlık olarak kapalı durur</strong>; kullanıcı tıklamadıkça dev metin yığını oluşmaz. <strong>Google botu ise içeriği %100 açık kabul edip tüm metni indeksler.</strong>
                      </p>
                    </div>
                  </div>

                  <div className="relative rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-mono font-bold text-indigo-300">
                        HTML5 &lt;details&gt;&lt;summary&gt; Katlanabilir Akordeon Kodu
                      </span>
                      <button
                        onClick={() => handleCopy(accordionHtml, "accordion")}
                        className="inline-flex items-center space-x-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        {copiedSection === "accordion" ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">Kopyalandı!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Akordeon Kodunu Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="mt-3 max-h-96 overflow-x-auto text-[11px] font-mono leading-relaxed text-indigo-200">
                      <code>{accordionHtml}</code>
                    </pre>
                  </div>
                </div>
              )}

              {/* TAB 4: RAW HTML CODE */}
              {activeTab === "html" && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                    <strong>Kullanım Alanı:</strong> WordPress, blog gönderileri veya doğrudan hizmet alt sayfası (<code>hizmet-detay.html</code>) olarak yayınlamak için standart ham HTML bloğu.
                  </div>

                  <div className="relative rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        WordPress / Klasik CMS İçin Ham HTML
                      </span>
                      <button
                        onClick={() => handleCopy(articleData.article_html, "html")}
                        className="inline-flex items-center space-x-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        {copiedSection === "html" ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-emerald-400 text-[11px]">Kopyalandı!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span className="text-[11px]">Tüm HTML'i Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="mt-3 max-h-96 overflow-x-auto text-[11px] font-mono leading-relaxed text-slate-300">
                      <code>{articleData.article_html}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500">
              İçerik yüklenemedi. Lütfen tekrar deneyin.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-6 py-3.5">
          <span className="text-xs text-slate-500">
            Kopyaladığınız içeriği doğrudan web sitenizin ilgili hizmet sayfasına yapıştırabilirsiniz.
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

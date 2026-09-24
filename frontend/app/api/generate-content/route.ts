import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { keyword, domain, companyName, location } = await req.json();

    if (!keyword) {
      return NextResponse.json({ error: "Anahtar kelime gereklidir" }, { status: 400 });
    }

    const cleanKeyword = keyword.trim();
    const cleanDomain = domain ? domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "").trim() : "isletmeniz.com";
    const compName = companyName && companyName !== "WWW Sanayi ve Ticaret" 
      ? companyName.trim() 
      : cleanDomain.split(".")[0].charAt(0).toUpperCase() + cleanDomain.split(".")[0].slice(1);
    const loc = location || "Türkiye";

    // Sector detection for tailored tone
    const kwLower = cleanKeyword.toLowerCase();
    const domainLower = cleanDomain.toLowerCase();

    let sectorContext = "Kurumsal Hizmet ve Ticaret";
    if (kwLower.includes("diş") || kwLower.includes("implant") || kwLower.includes("dent") || domainLower.includes("dent")) {
      sectorContext = "Ağız ve Diş Sağlığı, Estetik Gülüş ve Klinik Tedavileri";
    } else if (kwLower.includes("avukat") || kwLower.includes("hukuk") || kwLower.includes("dava") || domainLower.includes("hukuk")) {
      sectorContext = "Hukuki Danışmanlık, Avukatlık ve Dava Temsil Hizmetleri";
    } else if (kwLower.includes("nakliyat") || kwLower.includes("taşıma") || kwLower.includes("lojistik") || domainLower.includes("nakliyat")) {
      sectorContext = "Evden Eve Nakliyat, Asansörlü Taşımacılık ve Güvenli Lojistik";
    } else if (kwLower.includes("temizlik") || kwLower.includes("hijyen") || kwLower.includes("koltuk yıkama")) {
      sectorContext = "Profesyonel Ev ve Ofis Temizliği, Detaylı Hijyen Hizmetleri";
    } else if (kwLower.includes("kaplama") || kwLower.includes("metal") || kwLower.includes("galvano")) {
      sectorContext = "Endüstriyel Yüzey İşlemleri ve Metal Kaplama";
    }

    let generatedArticle = null;

    try {
      const prompt = `Sen Türkiye'nin en deneyimli SEO İçerik Stratejisti ve Metin Yazarısın.
Hedef Firma: ${compName} (${cleanDomain})
Sektör: ${sectorContext}
Lokasyon: ${loc}
Hedef Anahtar Kelime: '${cleanKeyword}'

Bu işletmenin web sitesine doğrudan eklenebilecek, Google Helpful Content ve E-E-A-T standartlarına tam uyumlu, profesyonel bir hizmet/tanıtım içeriği yaz.
Sektör ne ise (${sectorContext}) kesinlikle o sektöre uygun terminoloji, güven veren detaylar ve müşteri faydası kullan. Başka sektörlerle karıştırma.

Kesinlikle saf ve geçerli JSON formatında şu yapıda döndür:
{
  "title": "H1 için tıklama tetikleyici profesyonel başlık",
  "meta_description": "150-160 karakter CTR odaklı açıklama",
  "article_html": "HTML formatında 400-500 kelimelik makale (<h2>, <h3>, <p>, <ul>, <li> etiketleriyle, kurumsal güvence, süreç adımları ve müşteri memnuniyeti içermeli)",
  "faqs": [
    {
      "question": "Müşterilerin sıkça sorduğu 1. soru",
      "answer": "Net, güven verici ve ikna edici cevap"
    },
    {
      "question": "Müşterilerin sıkça sorduğu 2. soru",
      "answer": "Net, güven verici ve ikna edici cevap"
    },
    {
      "question": "Müşterilerin sıkça sorduğu 3. soru",
      "answer": "Net, güven verici ve ikna edici cevap"
    }
  ],
  "faq_schema": "Google FAQPage JSON-LD <script type='application/ld+json'> formatında kod bloğu"
}`;

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          temperature: 0.3,
          messages: [
            {
              role: "system",
              content: "Sen profesyonel SEO içerik uzmanısın. Yanıtını kesinlikle saf JSON olarak ver.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (groqRes.ok) {
        const groqJson = await groqRes.json();
        const content = groqJson.choices?.[0]?.message?.content;
        generatedArticle = JSON.parse(content);
      }
    } catch (err) {
      console.warn("Groq content generation error, fallback to dynamic template:", err);
    }

    // High quality dynamic fallback tailored to the target domain & keyword
    if (!generatedArticle || !generatedArticle.article_html) {
      const upperKw = cleanKeyword.toUpperCase();
      generatedArticle = {
        title: `${upperKw} Hizmetleri | Profesyonel Çözümler & Hızlı Destek - ${compName}`,
        meta_description: `${loc} ve çevresinde güvenilir ${cleanKeyword} çözümleri. ${compName} güvencesiyle kaliteli hizmet, şeffaf fiyatlandırma ve hızlı iletişim için hemen tıklayın.`,
        article_html: `<h2>${upperKw} Nedir ve Neden ${compName}?</h2>
<p>Modern çağda alanında uzman, güvenilir ve sürdürülebilir hizmet almak her müşterinin en doğal hakkıdır. <strong>${compName}</strong>, ${loc} bölgesinde <strong>${cleanKeyword}</strong> ihtiyaçlarınız için en ileri yöntemlerle, yüksek müşteri memnuniyeti odaklı çözümler sunmaktadır.</p>

<h3>Kurumsal Yaklaşım ve Kalite Güvencesi</h3>
<p>${cleanDomain} olarak sektörümüzdeki en güncel standartları ve yenilikçi yaklaşımları uyguluyoruz. İster bireysel ister kurumsal talepleriniz olsun, her aşamada şeffaf iletişim ve profesyonel iş takibi ile yanınızdayız.</p>

<h3>Bizi Tercih Etmeniz İçin Başlıca Nedenler</h3>
<ul>
  <li><strong>Deneyimli ve Uzman Kadro:</strong> Sürecin her adımında tecrübeli uzmanlarımızla kusursuz hizmet.</li>
  <li><strong>Şeffaf ve Uygun Fiyat Politikası:</strong> Gizli maliyetler olmadan, bütçenize uygun rekabetçi teklifler.</li>
  <li><strong>Hızlı Geri Dönüş ve Termin Güvencesi:</strong> Taleplerinize aynı gün yanıt ve zamanında teslimat taahhüdü.</li>
  <li><strong>%100 Müşteri Memnuniyeti:</strong> Satış öncesi ve sonrası kesintisiz iletişim desteği.</li>
</ul>

<h2>Hizmet Süreci Nasıl İlerler?</h2>
<p>Bizimle iletişime geçtiğiniz andan itibaren ihtiyaçlarınız detaylı olarak analiz edilir. Size özel en uygun yol haritası ve teklif sunularak onayınız doğrultusunda süreç hızlıca başlatılır.</p>`,
        faqs: [
          {
            question: `${cleanKeyword} hizmeti için nasıl fiyat teklifi alabilirim?`,
            answer: `Web sitemizdeki iletişim formu, WhatsApp destek hattımız veya telefon numaramız üzerinden talebinizi ileterek kısa sürede size özel fiyat teklifi alabilirsiniz.`,
          },
          {
            question: `${compName} hangi bölgelere hizmet vermektedir?`,
            answer: `Başta ${loc} olmak üzere çevre il ve ilçelerdeki tüm kurumsal ve bireysel müşterilerimize kesintisiz hizmet sağlıyoruz.`,
          },
          {
            question: `Süreç ne kadar sürede tamamlanır?`,
            answer: `Talebinizin kapsamına göre planlama yapılarak en hızlı şekilde ve taahhüt edilen sürede teslimat gerçekleştirilir.`,
          },
        ],
        faq_schema: `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "${cleanKeyword} hizmeti için nasıl fiyat teklifi alabilirim?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Web sitemizdeki iletişim formu, WhatsApp destek hattımız veya telefon numaramız üzerinden talebinizi ileterek kısa sürede size özel fiyat teklifi alabilirsiniz."
      }
    },
    {
      "@type": "Question",
      "name": "${compName} hangi bölgelere hizmet vermektedir?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Başta ${loc} olmak üzere çevre il ve ilçelerdeki tüm kurumsal ve bireysel müşterilerimize kesintisiz hizmet sağlıyoruz."
      }
    },
    {
      "@type": "Question",
      "name": "Süreç ne kadar sürede tamamlanır?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Talebinizin kapsamına göre planlama yapılarak en hızlı şekilde ve taahhüt edilen sürede teslimat gerçekleştirilir."
      }
    }
  ]
}
</script>`,
      };
    }

    return NextResponse.json({
      success: true,
      data: generatedArticle,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "İçerik üretim hatası" }, { status: 500 });
  }
}

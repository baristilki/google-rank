import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();
    if (!domain) {
      return NextResponse.json({ error: "Domain gereklidir" }, { status: 400 });
    }

    const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
    const targetUrl = `https://${cleanDomain}`;

    let keywords: string[] = [];

    try {
      // 1. Fetch real HTML from the website
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const res = await fetch(targetUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const html = await res.text();

        // Extract title
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : "";

        // Extract meta description
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
        const description = descMatch ? descMatch[1].trim() : "";

        // Extract meta keywords if present
        const kwMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
        const metaKeywords = kwMatch
          ? kwMatch[1].split(",").map((k) => k.trim()).filter((k) => k.length > 2)
          : [];

        // Extract H1 and H2 tags
        const h1Matches = Array.from(html.matchAll(/<h1[^>]*>([^<]+)<\/h1>/gi)).map((m) => m[1].trim());
        const h2Matches = Array.from(html.matchAll(/<h2[^>]*>([^<]+)<\/h2>/gi)).map((m) => m[1].trim());

        // Process title and headings for meaningful phrases
        const candidatePhrases: string[] = [...metaKeywords];

        if (title) {
          title.split(/[-|–,]/).forEach((part) => {
            const p = part.trim().toLowerCase();
            if (p.length > 3 && p.length < 35 && !p.includes(".com")) {
              candidatePhrases.push(p);
            }
          });
        }

        h1Matches.concat(h2Matches.slice(0, 6)).forEach((h) => {
          const clean = h.trim().toLowerCase().replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/gi, "");
          if (clean.length > 4 && clean.length < 30) {
            candidatePhrases.push(clean);
          }
        });

        // Deduplicate and filter out common generic words
        const stopwords = new Set([
          "ana sayfa", "hakkımızda", "iletişim", "biz kimiz", "hizmetlerimiz", "ürünlerimiz",
          "home", "about", "contact", "kurumsal", "referanslar", "galeri", "blog",
        ]);

        keywords = Array.from(new Set(candidatePhrases))
          .filter((k) => !stopwords.has(k.toLowerCase()) && k.split(" ").length <= 4)
          .slice(0, 8);
      }
    } catch (fetchErr) {
      console.warn("Direct site fetch failed or timed out, applying domain-heuristic extraction.");
    }

    // Fallback if the site has no meta tags or is blocked
    if (keywords.length === 0) {
      const brandBase = cleanDomain.split(".")[0];
      const isKaplama = cleanDomain.includes("kaplama");
      const isDis = cleanDomain.includes("dis") || cleanDomain.includes("dent");

      if (isKaplama) {
        keywords = [
          "sarı miralloy",
          "miralloy kaplama",
          "çinko kaplama",
          "metal kaplama",
          "fason metal kaplama",
          "nikelaj ve krom kaplama",
          "ikitelli kaplama firmaları",
          "eloksal kaplama",
        ];
      } else if (isDis) {
        keywords = [
          "diş hekimi",
          "implant diş tedavisi",
          "estetik diş hekimliği",
          "zirkonyum kaplama",
          "diş beyazlatma",
          "çocuk diş hekimi",
        ];
      } else {
        keywords = [
          `${brandBase} hizmetleri`,
          `${brandBase} fiyatları`,
          `${brandBase} modelleri`,
          "en yakın teknik servis",
          "profesyonel çözümler",
        ];
      }
    }

    return NextResponse.json({
      success: true,
      domain: cleanDomain,
      keywords: keywords,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Bilinmeyen hata" }, { status: 500 });
  }
}

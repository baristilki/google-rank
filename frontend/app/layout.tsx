import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Google Sıralama - Canlı SEO & Google Haritalar Sıralama Analizi",
  description: "Google Sıralama & cloudmedya.com - İşletmeniz için canlı SERP, Google Harita görünürlüğü ve rakip analizi platformu.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}

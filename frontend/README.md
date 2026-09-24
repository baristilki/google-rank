# Google Sıralama - Canlı SERP & Yerel Harita Denetim Platformu

Bu proje, **cloudmedya.com** tarafından geliştirilmiş, KOBİ işletme sahipleri ve dijital ajanslar için tasarlanmış modern, sonuç odaklı Next.js 14 (App Router) canlı SERP ve Google Haritalar denetim platformudur.

## Özellikler

1. **Üst Özet Kartları (`SummaryCards.tsx`)**:
   - **SERP Sıralama Durumu**: Mevcut sıra (#14) vs Hedef sıra (#1-3) ve sayfa durumu.
   - **GBP Harita Sağlık Skoru**: 100 üzerinden yerel güç puanı (68/100) ve optimizasyon potansiyeli.
   - **Eylem Planı İlerlemesi**: Tamamlanan / Bekleyen görev sayısı ve anlık dolan ilerleme çubuğu.

2. **Rakip Kıyaslama Masası (`CompetitorMatrix.tsx`)**:
   - Sol tarafta "Sizin İşletmeniz", sağ tarafta ilk 3 rakip.
   - Karşılaştırma alanları: Google Puanı, Google Yorum Sayısı, Mobil Sayfa Hızı, Schema.org Durumu ve İçerik Hacmi (Kelime).
   - Eksik alanlar kırmızı/sarı uyarı rozetleriyle ("Eksik Şema", "Kritik Yavaş", "-166 Açık", "Yetersiz İçerik") anında göze çarpar.

3. **Akıllı Eylem Tahtası (`ActionBoard.tsx`)**:
   - Yapay zeka tarafından önceliklendirilmiş interaktif to-do görev kartları.
   - Kategori filtreleme (`Tüm Görevler`, `Local-GBP`, `Technical`, `Content-Gap`, `On-Page`).
   - Öncelik rozetleri (`Acil Öncelik`, `Yüksek Öncelik`, `Orta Öncelik`).
   - Açılır "Nasıl Yapılır?" akordeon rehberi (adım adım menü ve çözüm adımları).
   - "Kodu Kopyala" butonu (tek tıkla hazır JSON-LD şeması veya meta etiket kopyalama).
   - "Uyguladım, Tamamlandı Olarak İşaretle" butonu (üst karttaki sayacı ve ilerleme yüzdesini anında günceller).

## Kurulum ve Çalıştırma

```bash
# Frontend dizinine gidin
cd frontend

# Bağımlılıkları yükleyin
npm install

# Geliştirme sunucusunu başlatın
npm run dev
```

Tarayıcınızda açın:
```
http://localhost:3000
```

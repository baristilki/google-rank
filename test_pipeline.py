"""RankEngine AI - Hızlı Bağımsız Doğrulama ve Demo Betiği.

Bu betik, veritabanı veya harici ücretli API kurulumu gerektirmeden:
1. SERP Matcher ile hedef site ve ilk 3 rakibin metriklerini toplar.
2. GapAnalysis (Açık Analizi) hesaplar.
3. AI Action Generator ile öncelikli To-Do listesini ve hazır JSON-LD şemasını üretir.
4. Çıktıları konsola renkli/biçimli olarak yazdırır.

Çalıştırma:
    python test_pipeline.py
"""

import asyncio
import json
import sys

from action_generator import ActionGenerator
from serp_matcher import SERPMatcher


async def main():
    print("=" * 75)
    print("🚀 RankEngine AI - Denetim & Eylem Planı Doğrulama Testi Başlatılıyor...")
    print("=" * 75)

    matcher = SERPMatcher()
    generator = ActionGenerator()

    # Test Senaryosu: Yalçın Kaplama Sanayi
    target_url = "https://yalcinkaplama.com"
    keyword = "metal kaplama"
    city = "İstanbul"
    district = "İkitelli"
    company_name = "Yalçın Kaplama Sanayi ve Ticaret"

    print(f"\n[1/3] Hedef İşletme Analiz Ediliyor: {company_name}")
    print(f"      Hedef Domain  : {target_url}")
    print(f"      Hedef Anahtar : '{keyword}' ({district}/{city})")

    # 1. SERP & Rakip Karşılaştırma Matrisini Oluştur
    print("\n[2/3] Google SERP ve Harita Rakipleri Taranıyor...")
    matrix = await matcher.build_comparison_matrix(
        target_url=target_url,
        keyword=keyword,
        city=city,
        district=district,
    )

    print("\n" + "-" * 75)
    print("📊 KIYASLAMA MATRİSİ ÖZETİ (Comparison Matrix)")
    print("-" * 75)
    print(matrix.to_llm_prompt_summary())

    # 2. Akıllı Yapay Zeka Eylem Planını Üret
    print("\n" + "-" * 75)
    print("🧠 [3/3] AI Action Generator Çalıştırılıyor...")
    print("-" * 75)

    company_info = {
        "name": company_name,
        "primary_category": "Metal Yüzey Kaplama Sanayi",
        "city": city,
        "district": district,
        "phone": "+90 212 555 0199",
    }

    action_plan = await generator.generate_action_plan(
        matrix=matrix,
        company_name=company_name,
        company_info=company_info,
    )

    print(f"\n📌 YÖNETİCİ ÖZETİ:\n{action_plan.executive_summary}\n")

    print("=" * 75)
    print(f"📋 ÜRETİLEN ÖNCELİKLENDİRİLMİŞ EYLEM LİSTESİ ({len(action_plan.action_items)} Görev)")
    print("=" * 75)

    for idx, item in enumerate(action_plan.action_items, start=1):
        print(f"\n🔹 Görev #{idx}: [{item.priority.value}] {item.title}")
        print(f"   Kategori : {item.category.value} | Etki: {item.impact.value} | Zorluk: {item.effort.value}")
        print(f"   ⚠️  Sorun  : {item.problem}")
        print(f"   💡 Çözüm  : {item.solution_guide}")
        if item.suggested_fix:
            preview = item.suggested_fix.strip()
            if len(preview) > 160:
                preview = preview[:160] + "... [DEVAMI MEVCUT]"
            print(f"   🛠️  Hazır Kod/Öneri:\n      {preview}")

    # 3. Otomatik Meta Önerilerini Test Et
    print("\n" + "=" * 75)
    print("🎯 OTOMATİK CTR ODRAKLI META BAŞLIK & AÇIKLAMA ÖNERİLERİ")
    print("=" * 75)
    meta_recs = generator.generate_meta_recommendations(matrix, company_name)
    for opt in meta_recs.options:
        print(f"\n🏷️  Açı: {opt.angle}")
        print(f"    Title       : {opt.title}")
        print(f"    Description : {opt.description}")
        print(f"    H1          : {opt.h1}")

    print("\n" + "=" * 75)
    print("✅ Doğrulama Testi Başarıyla Tamamlandı! Sistem Çalışmaya Hazır.")
    print("=" * 75)


if __name__ == "__main__":
    asyncio.run(main())

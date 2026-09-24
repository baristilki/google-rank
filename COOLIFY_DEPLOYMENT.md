# 🚀 Coolify ile Canlıya Alma ve GitHub Dağıtım Rehberi

Bu rehber, **Google Sıralama & Canlı SERP Analiz** platformunu GitHub'a yükleyip **Coolify** üzerinde tek tıkla canlı yayına almak için hazırlanmıştır.

---

## 📦 1. Adım: Projeyi GitHub'a Gönderme

Projede gizli API anahtarlarının (`.env`, `.env.local`), `node_modules` ve geçici dosyaların GitHub'a sızmasını önleyen `.gitignore` yapılandırması tamamlanmıştır.

### Seçenek A: Tek Tıkla Hazır Batch Dosyasıyla (En Kolay)
1. Klasördeki [`push_to_github.bat`](file:///c:/Users/PC/Documents/claude/google-arama/push_to_github.bat) dosyasına çift tıklayın.
2. GitHub'da açtığınız boş reponun linkini (örneğin: `https://github.com/kullanici/google-arama.git`) yapıştırın.
3. Otomatik olarak commit atılacak ve GitHub'a yüklenecektir.

### Seçenek B: Terminal (CMD / PowerShell) ile:
```bash
git init
git branch -M main
git add .
git commit -m "feat: Google Sıralama platform with multi-device quota and Coolify setup"
git remote add origin https://github.com/KULLANICI_ADINIZ/REPO_ADINIZ.git
git push -u origin main
```

---

## 🌐 2. Adım: Coolify Paneline Projeyi Ekleme

Coolify, Docker Compose ve GitHub entegrasyonu sayesinde projeyi otomatik olarak algılar ve SSL (https) sertifikasını kendisi kurar.

1. **Coolify Panelinize Girin** (`https://coolify.siteniz.com`).
2. İlgili **Project** / **Environment** içine girip sağ üstten **"+ New Resource"** butonuna tıklayın.
3. **"Git Repository"** seçeneğini seçin (GitHub hesabınız bağlıysa doğrudan reponuzu seçebilirsiniz veya Public repo linkinizi yapıştırın).
4. **Build Pack Türü:**
   * Coolify otomatik olarak kök dizindeki `docker-compose.yml` dosyasını görecektir.
   * **"Docker Compose"** seçeneğini işaretleyin.

---

## ⚙️ 3. Adım: Coolify Ayarları & Domain Tanımlama

### A) Domain / FQDN Tanımlama
Coolify panelinde uygulamanızın ayarlarına gelin:
* **Domains:** Kendi domaininizi yazın:
  ```text
  https://siralama.siteniz.com
  ```
* Coolify, Traefik üzerinden `frontend:3000` portuna otomatik yönlendirme yapacak ve ücretsiz **Let's Encrypt SSL** kuracaktır.

### B) Ortam Değişkenleri (Environment Variables)
Coolify panelinde **"Environment Variables"** sekmesine girip aşağıdaki değişkenleri ekleyin (veya varsayılanları kullanın):

```env
GOOGLE_PAGESPEED_API_KEY=your_google_pagespeed_api_key_here
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
GROQ_API_KEY=your_groq_api_key_here
NEXT_PUBLIC_API_URL=http://backend:8000/api/v1
SECRET_KEY=super-guclu-bir-secret-key-buraya-yazin
```

### C) Kalıcı Veri (Persistent Volume)
`docker-compose.yml` dosyamızda **`rankengine_quota_data`** adında kalıcı bir volume tanımlanmıştır.  
Bu sayede:
* Kullanıcıların sorgu limitleri ve sizin verdiğiniz kupon kodları (`quota_db.json`), sunucu yeniden başlasa veya yeni kod push etseniz dahi **asla silinmez**.

---

## 🚀 4. Adım: Canlıya Alma (Deploy)

1. Coolify üzerinde sağ üstteki **"Deploy"** butonuna tıklayın.
2. Coolify otomatik olarak:
   * Next.js Frontend imajını (standalone optimize) ve FastAPI Backend imajını derler.
   * Konteynerları ayağa kaldırır.
   * SSL sertifikanızı üretir.
3. 2-3 dakika içinde siteniz `https://siralama.siteniz.com` adresinde canlı ve kullanıma hazır olacaktır!

> **Otomatik Güncelleme (Auto-Deploy):**  
> Kodda bir değişiklik yapıp `git push` yaptığınızda Coolify otomatik olarak webhook ile yeni kodu çeker ve kesintisiz şekilde günceller.

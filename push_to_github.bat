@echo off
chcp 65001 >nul
title GitHub'a Otomatik Yükle - RankEngine AI
color 0b
echo ======================================================================
echo       RANKENGINE AI - GITHUB'A OTOMATIK YUKLENIYOR
echo       Hedef: https://github.com/baristilki/google-rank.git
echo ======================================================================
echo.

:: 1. Git deposu baslat
if not exist ".git" (
    echo [1/4] Git deposu baslatiliyor...
    git init
    git branch -M main
) else (
    echo [1/4] Mevcut Git deposu kontrol ediliyor...
    git branch -M main
)

:: 2. Remote Origin ayarla
git remote remove origin 2>nul
git remote add origin https://github.com/baristilki/google-rank.git
echo [2/4] Remote origin baglandi: https://github.com/baristilki/google-rank.git

:: 3. Dosyalari hazirla ve commit at
echo [3/4] Dosyalar hazirlaniyor (.gitignore ile API key ve gereksiz dosyalar filtrelendi)...
git add .
git commit -m "feat: Google Rank platform with multi-device quota, vouchers and Coolify docker setup"

:: 4. GitHub'a gonder
echo [4/4] GitHub'a yukleniyor (git push -u origin main)...
echo.
git push -u origin main --force

if %errorlevel% equ 0 (
    color 0a
    echo.
    echo ======================================================================
    echo [BASARILI] Kodlar GitHub'a yuklendi!
    echo Simdi Coolify otomatik olarak bu repoyu algilayip calistirabilir.
    echo ======================================================================
) else (
    color 0e
    echo.
    echo [BILGI] Push sirasinda GitHub kimlik dogrulamasi penceresi acilmis olabilir.
    echo Lutfen tarayıcida GitHub ile girisi onaylayin.
)

echo.
pause

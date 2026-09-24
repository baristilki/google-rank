@echo off
title RankEngine AI - Tum Platformu Baslat
color 0b
echo ======================================================================
echo           RANKENGINE AI - B2B SAAS PLATFORMU BASLATILIYOR
echo ======================================================================
echo.
echo [1/2] FastAPI Backend Servisi (Port 8000) yeni pencerede baslatiliyor...
start "RankEngine AI - Backend (Port 8000)" cmd /k "title RankEngine Backend && py -m pip install -r requirements.txt && py -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/2] Next.js Dashboard (Port 3000) yeni pencerede baslatiliyor...
start "RankEngine AI - Frontend (Port 3000)" cmd /k "title RankEngine Dashboard && cd frontend && npm install && npm run dev"

echo.
echo ======================================================================
echo   Platform pencereleri acildi! Lutfen 10-15 saniye hazirlanmasini bekleyin.
echo.
echo   - Frontend Kullanici Paneli : http://localhost:3000
echo   - Backend Swagger Dokumani  : http://localhost:8000/docs
echo ======================================================================
echo.
pause

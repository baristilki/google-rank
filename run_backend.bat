@echo off
title RankEngine AI - Backend
echo ===================================================
echo   RankEngine AI - Backend Baslatiliyor (Port 8000)
echo ===================================================
py -m pip install -r requirements.txt
py -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause

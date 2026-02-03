@echo off
REM Development runner for Windows - LAN Party Edition

echo Starting Croppa v2 (LAN Mode)...
echo.

set CONDA_ACTIVATE=C:\Users\mu\miniconda3\Scripts\activate.bat

REM 1. Backend: Add --host 0.0.0.0 to let others hit the API
start "Croppa Backend" cmd /k "call %CONDA_ACTIVATE% croppa && cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8001"
REM 2. Frontend: Add -- --host to expose Vite to the network
start "Croppa Frontend" cmd /k "cd frontend && npm install && npm run dev -- --host"

echo.
echo Check the Frontend terminal window for your "Network" URL!
echo (It will look like http://192.168.1.X:5173)
echo.

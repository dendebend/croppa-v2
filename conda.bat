@echo off
REM Development runner for Windows

echo Starting Croppa v2...

REM --- CRITICAL: Force the new window to use the 'croppa' Conda env ---
set CONDA_ACTIVATE=C:\Users\mu\miniconda3\Scripts\activate.bat

start "Croppa Backend" cmd /k "call %CONDA_ACTIVATE% croppa && cd backend && python -m uvicorn main:app --reload --port 8001"

start "Croppa Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Backend:  http://localhost:8001
echo Frontend: http://localhost:5173

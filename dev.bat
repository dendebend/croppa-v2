@echo off
REM Development runner for Windows - run each in separate terminal

echo Starting Croppa v2 development environment...
echo.
echo This will open two terminals:
echo   1. Backend (FastAPI on :8000)
echo   2. Frontend (Vite on :5173)
echo.

REM Start backend in new window
start "Croppa Backend" cmd /k "cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt && uvicorn main:app --reload --port 8000"

REM Start frontend in new window
start "Croppa Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo Croppa v2 is starting!
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:8000
echo.

#!/bin/bash
# Development runner - starts both backend and frontend

echo "Starting Croppa v2 development environment..."

# Start backend in background
echo "Starting backend on :8000..."
cd backend
python -m venv venv 2>/dev/null
source venv/bin/activate
pip install -r requirements.txt -q
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Start frontend
echo "Starting frontend on :5173..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

# Trap to kill both on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

echo ""
echo "Croppa v2 is running!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo ""
echo "Press Ctrl+C to stop."

wait

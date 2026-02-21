#!/bin/bash
echo "🏛️  Starting GrievanceGPT..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python 3.10+"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Backend setup
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt -q

echo "🚀 Starting backend on http://localhost:8000..."
uvicorn main:app --port 8000 --reload &
BACKEND_PID=$!

cd ../frontend

echo "📦 Installing frontend dependencies..."
npm install --silent

echo "⚡ Starting frontend on http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ GrievanceGPT is running!"
echo "   🌐 Frontend:  http://localhost:5173"
echo "   🔧 Backend:   http://localhost:8000"
echo "   📖 API Docs:  http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop both servers."

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Servers stopped.'" EXIT
wait

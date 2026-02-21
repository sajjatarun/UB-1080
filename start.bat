@echo off
echo.
echo  =========================================
echo   GrievanceGPT - AI Civic Complaint Portal
echo  =========================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.10+ from https://python.org
    pause
    exit /b 1
)

:: Check Node
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

echo [1/4] Installing backend dependencies...
cd backend
pip install -r requirements.txt -q
if errorlevel 1 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b 1
)

echo [2/4] Starting backend on http://localhost:8000 ...
start "GrievanceGPT Backend" cmd /k "cd /d %~dp0backend && uvicorn main:app --port 8000 --reload"

cd ..\frontend

echo [3/4] Installing frontend dependencies...
call npm install --silent
if errorlevel 1 (
    echo [ERROR] Failed to install frontend dependencies.
    pause
    exit /b 1
)

echo [4/4] Starting frontend on http://localhost:5173 ...
start "GrievanceGPT Frontend" cmd /k "npm run dev"

echo.
echo  =========================================
echo   GrievanceGPT is running!
echo.
echo   Frontend:  http://localhost:5173
echo   Backend:   http://localhost:8000
echo   API Docs:  http://localhost:8000/docs
echo  =========================================
echo.
echo  Two new windows have opened for the servers.
echo  Close them to stop GrievanceGPT.
echo.
pause

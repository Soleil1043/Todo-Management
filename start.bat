@echo off
echo ==========================================
echo   Todo Management - 启动项目
echo ==========================================

echo 正在启动后端服务 (FastAPI)...
start "Todo Backend" cmd /k "python main.py --reload"

echo 正在启动前端应用 (Vite)...
cd frontend
npm run dev

pause

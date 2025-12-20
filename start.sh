#!/bin/bash

echo "=========================================="
echo "  Todo Management - 启动项目"
echo "=========================================="

# 启动后端服务
echo "正在启动后端服务 (FastAPI)..."
python main.py &
BACKEND_PID=$!

# 启动前端应用
echo "正在启动前端应用 (Vite)..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# 捕获退出信号，同时关闭前后端
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM EXIT

echo "项目已启动！"
echo "后端: http://localhost:8000"
echo "前端: http://localhost:3000"

wait

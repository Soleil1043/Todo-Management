#!/bin/bash

echo "=========================================="
echo "  TodoGravita - 安装依赖"
echo "=========================================="

echo "[1/2] 正在安装后端 Python 依赖..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "[错误] 后端依赖安装失败！"
    exit 1
fi

echo "[2/2] 正在安装前端 Node.js 依赖..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "[错误] 前端依赖安装失败！"
    exit 1
fi
cd ..

echo "=========================================="
echo "  安装完成！现在可以使用 ./start.sh 启动项目"
echo "=========================================="

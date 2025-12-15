import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.todos import router as todos_router
from database.init_db import init_db

# 初始化数据库
init_db()

app = FastAPI(
    title="待办事项API",
    description="FastAPI的后端文档界面",
    version="2.0.0",
)

app.include_router(todos_router, prefix="/api/v2.0.0", tags=["代办事项"])

@app.get("/", tags=["根目录"])
async def read_root():
    """欢迎用语发送"""
    return {"message": "欢迎使用代办事项API","docs": "/docs"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

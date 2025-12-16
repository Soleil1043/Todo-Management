import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.todos import router as todos_router
from database.init_db import init_db
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 初始化数据库
try:
    init_db()
    logger.info("数据库初始化成功")
except Exception as e:
    logger.error(f"数据库初始化失败: {e}")
    raise

app = FastAPI(
    title="待办事项API",
    description="FastAPI的后端文档界面",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todos_router, prefix="/api", tags=["代办事项"])

@app.get("/", tags=["根目录"])
async def read_root():
    """API根路径，返回欢迎信息和文档链接"""
    return {
        "message": "欢迎使用代办事项API",
        "docs": "/docs",
        "redoc": "/redoc",
        "version": "2.2.0"
    }

@app.get("/health", tags=["系统"])
async def health_check():
    """健康检查接口"""
    return {"status": "healthy", "service": "todo-api"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

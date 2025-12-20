import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routers.todos import router as todos_router
from routers.settings import router as settings_router
from database.init_db import init_db
from utils.logging_config import setup_logging
from utils.exceptions import TodoAppException
import logging
import time

# 配置详细日志
setup_logging()
logger = logging.getLogger(__name__)

# 初始化数据库
try:
    init_db()
    logger.info("数据库初始化成功")
except Exception as e:
    logger.critical(f"数据库初始化失败，程序无法启动: {e}", exc_info=True)
    raise

app = FastAPI(
    title="待办事项API",
    description="一个高性能、功能丰富的待办事项管理系统API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# 自定义应用异常处理器
@app.exception_handler(TodoAppException)
async def todo_app_exception_handler(request: Request, exc: TodoAppException):
    """处理应用定义的自定义异常"""
    logger.warning(f"应用异常: {request.method} {request.url} - {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )

# 自定义全局异常处理器
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理器，捕获所有未处理的异常并记录日志"""
    logger.error(f"全局捕获到未处理异常: {request.method} {request.url} - {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "服务器内部错误，请稍后重试或联系管理员"},
    )

# 请求处理时间中间件
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """记录每个请求的处理时间"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    
    # 记录慢请求
    if process_time > 1.0:
        logger.warning(f"检测到慢请求: {request.method} {request.url} 耗时: {process_time:.4f}s")
    
    return response

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(todos_router, prefix="/api", tags=["代办事项"])
app.include_router(settings_router, prefix="/api", tags=["系统设置"])

@app.get("/", tags=["根目录"])
async def read_root():
    """API根路径，返回欢迎信息和文档链接"""
    return {
        "message": "欢迎使用代办事项API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health", tags=["系统"])
async def health_check():
    """健康检查接口"""
    return {"status": "healthy", "service": "todo-api"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

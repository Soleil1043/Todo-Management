import uvicorn
from fastapi import FastAPI
from routers import todo

app = FastAPI(
    title="待办事项API",
    description="FastAPI自用练习项目",
    version="1.0.0",
)

app.include_router(todo.router, prefix="/api/v1.0.0", tags=["代办事项"])

@app.get("/", tags=["根目录"])
async def read_root():
    """欢迎用语发送"""
    return {"message": "欢迎使用代办事项API","docs": "/docs"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
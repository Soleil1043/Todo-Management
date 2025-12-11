from enum import Enum
from pydantic import BaseModel
from typing import Optional

class Priority(str, Enum):
    """优先级枚举"""
    high = "high"
    medium = "medium"
    low = "low"

class TodoItem(BaseModel):
    """待办事项模型"""
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    completed: bool = False
    priority: Priority = Priority.medium

    class Config:
        schema_extra = {
            "example": {
                "title": "学习FastAPI",
                "description": "完成待办事项API项目",
                "priority": "high"
            }
        }

from enum import Enum
from pydantic import BaseModel, field_validator
from typing import Optional

class Priority(str, Enum):
    """优先级枚举"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TodoSchema(BaseModel):
    """待办事项模型 - 用于API数据验证和序列化"""
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    completed: bool = False
    priority: Priority = Priority.MEDIUM
    start_time: Optional[str] = None  # 开始时间
    end_time: Optional[str] = None    # 结束时间

    @field_validator('title')
    def validate_title(cls, v):
        """验证标题不为空且长度合理"""
        if not v or not v.strip():
            raise ValueError('标题不能为空')
        if len(v.strip()) > 100:
            raise ValueError('标题长度不能超过100个字符')
        return v.strip()

    @field_validator('start_time', 'end_time')
    def validate_time_format(cls, v):
        """验证时间格式（HH:MM）"""
        if v is None:
            return v
        if not isinstance(v, str):
            raise ValueError('时间必须是字符串格式')
        if len(v) != 5 or v[2] != ':':
            raise ValueError('时间格式必须是HH:MM')
        try:
            hour, minute = map(int, v.split(':'))
            if not (0 <= hour <= 23 and 0 <= minute <= 59):
                raise ValueError('时间值无效')
        except ValueError:
            raise ValueError('时间格式无效')
        return v

    def model_dump(self, **kwargs):
        """自定义序列化，确保ID为None时不包含在输出中"""
        data = super().model_dump(**kwargs)
        if data.get('id') is None:
            data.pop('id', None)
        return data
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "学习FastAPI",
                "description": "完成待办事项API项目",
                "priority": "high",
                "start_time": "09:00",
                "end_time": "11:00"
            }
        }
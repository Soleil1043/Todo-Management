from enum import Enum
from pydantic import BaseModel, field_validator, Field, ConfigDict
from typing import Optional, List, Dict, Any


class TodoSchema(BaseModel):
    id: Optional[int] = Field(None, description="待办事项的唯一标识符，创建时无需提供")
    title: str = Field(..., min_length=1, max_length=100, description="待办事项的标题")
    description: Optional[str] = Field(None, description="待办事项的详细描述")
    completed: bool = Field(False, description="待办事项是否已完成")
    future_score: Optional[int] = Field(None, description="重要性分值 (-3 到 3)")
    urgency_score: Optional[int] = Field(None, description="紧急性分值 (-3 到 3)")
    final_priority: int = Field(100, description="最终优先级分数，由系统自动计算")
    start_time: Optional[str] = Field(None, description="预计开始时间 (格式: HH:MM)")
    end_time: Optional[str] = Field(None, description="预计结束时间 (格式: HH:MM)")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "学习FastAPI",
                "description": "完成待办事项API项目",
                "future_score": 2,
                "urgency_score": 2,
                "final_priority": 432,
                "start_time": "09:00",
                "end_time": "11:00"
            }
        }
    )

    @field_validator('title')
    def validate_title(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError('标题不能为空')
        if len(v.strip()) > 100:
            raise ValueError('标题长度不能超过100个字符')
        return v.strip()

    @field_validator('future_score', 'urgency_score')
    def validate_scores(cls, v: Optional[int]) -> Optional[int]:
        if v is None:
            return v
        if v < -3 or v > 3:
            raise ValueError('重要性和紧急性分值必须在-3到3之间')
        return v

    @field_validator('start_time', 'end_time')
    def validate_time_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if isinstance(v, str) and not v.strip():
            return None
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

    def model_dump(self, **kwargs: Any) -> Dict[str, Any]:
        data = super().model_dump(**kwargs)
        if data.get('id') is None:
            data.pop('id', None)
        return data


class TodoUpdateSchema(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100, description="更新后的标题")
    description: Optional[str] = Field(None, description="更新后的描述")
    completed: Optional[bool] = Field(None, description="更新完成状态")
    future_score: Optional[int] = Field(None, description="更新重要性分值 (-3 到 3)")
    urgency_score: Optional[int] = Field(None, description="更新紧急性分值 (-3 到 3)")
    start_time: Optional[str] = Field(None, description="更新开始时间 (格式: HH:MM)")
    end_time: Optional[str] = Field(None, description="更新结束时间 (格式: HH:MM)")
    operation_source: Optional[str] = Field(None, description="操作来源，用于日志记录")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "title": "更新后的任务名称",
                "completed": True,
                "future_score": 1
            }
        }
    )

    @field_validator('future_score', 'urgency_score')
    def validate_scores(cls, v: Optional[int]) -> Optional[int]:
        if v is None:
            return v
        if v < -3 or v > 3:
            raise ValueError('重要性和紧急性分值必须在-3到3之间')
        return v

    @field_validator('start_time', 'end_time')
    def validate_time_format(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        if isinstance(v, str) and not v.strip():
            return None
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

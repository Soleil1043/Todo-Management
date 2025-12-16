from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from enum import Enum

Base = declarative_base()

class Priority(str, Enum):
    """优先级枚举"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TodoItemDB(Base):
    """待办事项数据库模型"""
    __tablename__ = "todo_items"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    priority = Column(SQLEnum(Priority), default=Priority.MEDIUM, nullable=False)
    start_time = Column(String(5), nullable=True)  # HH:MM format
    end_time = Column(String(5), nullable=True)    # HH:MM format
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted = Column(Boolean, default=False, nullable=False)  # 软删除标记
    
    def __repr__(self):
        return f"<TodoItemDB(id={self.id}, title='{self.title}', completed={self.completed})>"

class RecycleBinItemDB(Base):
    """回收站项目数据库模型"""
    __tablename__ = "recycle_bin_items"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    original_id = Column(Integer, nullable=False, index=True)  # 原始todo的ID
    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    priority = Column(SQLEnum(Priority), default=Priority.MEDIUM, nullable=False)
    start_time = Column(String(5), nullable=True)
    end_time = Column(String(5), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    deleted_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<RecycleBinItemDB(id={self.id}, original_id={self.original_id}, title='{self.title}')>"
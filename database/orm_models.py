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

class TodoORM(Base):
    """待办事项数据库模型 - ORM映射"""
    __tablename__ = "todo_items"
    
    # 主键和索引
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # 核心字段
    title = Column(String(100), nullable=False, index=True)
    description = Column(String(500), nullable=True)
    completed = Column(Boolean, default=False, nullable=False, index=True)
    priority = Column(SQLEnum(Priority), default=Priority.MEDIUM, nullable=False, index=True)
    
    # 时间字段
    start_time = Column(String(5), nullable=True)  # HH:MM format
    end_time = Column(String(5), nullable=True)    # HH:MM format
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    deleted = Column(Boolean, default=False, nullable=False, index=True)  # 软删除标记
    
    # 添加复合索引以提高查询性能
    __table_args__ = (
        # 常用查询的复合索引
        {'sqlite_autoincrement': True},  # SQLite自增优化
    )
    
    def __repr__(self):
        return f"<TodoORM(id={self.id}, title='{self.title}', completed={self.completed}, deleted={self.deleted})>"
    
    def to_dict(self) -> dict:
        """将模型转换为字典，便于序列化"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'priority': self.priority.value if self.priority else None,  # type: ignore
            'start_time': self.start_time,
            'end_time': self.end_time,
            'created_at': self.created_at.isoformat() if self.created_at else None,  # type: ignore
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,  # type: ignore
            'deleted': self.deleted  # type: ignore
        }

class RecycleBinORM(Base):
    """回收站项目数据库模型 - ORM映射"""
    __tablename__ = "recycle_bin_items"
    
    # 主键和索引
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    original_id = Column(Integer, nullable=False, index=True, unique=True)  # 原始todo的ID，添加唯一约束
    
    # 数据字段
    title = Column(String(100), nullable=False, index=True)
    description = Column(String(500), nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    priority = Column(SQLEnum(Priority), default=Priority.MEDIUM, nullable=False)
    start_time = Column(String(5), nullable=True)
    end_time = Column(String(5), nullable=True)
    
    # 时间字段
    created_at = Column(DateTime(timezone=True), nullable=False)
    deleted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    
    # 添加复合索引
    __table_args__ = (
        {'sqlite_autoincrement': True},  # SQLite自增优化
    )
    
    def __repr__(self):
        return f"<RecycleBinORM(id={self.id}, original_id={self.original_id}, title='{self.title}', deleted_at={self.deleted_at})>"
    
    def to_dict(self) -> dict:
        """将模型转换为字典，便于序列化"""
        return {
            'id': self.id,
            'original_id': self.original_id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'priority': self.priority.value if self.priority else None,  # type: ignore
            'start_time': self.start_time,
            'end_time': self.end_time,
            'created_at': self.created_at.isoformat() if self.created_at else None,  # type: ignore
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None  # type: ignore
        }
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SQLEnum, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from enum import Enum

Base = declarative_base()


class TodoORM(Base):
    __tablename__ = "todo_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False, index=True)
    description = Column(String(500), nullable=True)
    completed = Column(Boolean, default=False, nullable=False, index=True)
    future_score = Column(Integer, nullable=True)
    urgency_score = Column(Integer, nullable=True)
    final_priority = Column(Integer, default=100, nullable=False, index=True)
    start_time = Column(String(5), nullable=True)
    end_time = Column(String(5), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    deleted = Column(Boolean, default=False, nullable=False, index=True)

    __table_args__ = (
        {'sqlite_autoincrement': True},
    )

    def __repr__(self):
        return f"<TodoORM(id={self.id}, title='{self.title}', completed={self.completed}, deleted={self.deleted})>"

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'future_score': self.future_score,
            'urgency_score': self.urgency_score,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'created_at': self.created_at.isoformat() if self.created_at else None,  # type: ignore
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,  # type: ignore
            'deleted': self.deleted  # type: ignore
        }


class RecycleBinORM(Base):
    __tablename__ = "recycle_bin_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    original_id = Column(Integer, nullable=False, index=True, unique=True)
    title = Column(String(100), nullable=False, index=True)
    description = Column(String(500), nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    future_score = Column(Integer, nullable=True)
    urgency_score = Column(Integer, nullable=True)
    final_priority = Column(Integer, default=100, nullable=False, index=True)
    start_time = Column(String(5), nullable=True)
    end_time = Column(String(5), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False)
    deleted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    __table_args__ = (
        {'sqlite_autoincrement': True},
    )

    def __repr__(self):
        return f"<RecycleBinORM(id={self.id}, original_id={self.original_id}, title='{self.title}', deleted_at={self.deleted_at})>"

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'original_id': self.original_id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'future_score': self.future_score,
            'urgency_score': self.urgency_score,
            'final_priority': self.final_priority,
            'start_time': self.start_time,
            'end_time': self.end_time,
            'created_at': self.created_at.isoformat() if self.created_at else None,  # type: ignore
            'deleted_at': self.deleted_at.isoformat() if self.deleted_at else None  # type: ignore
        }


class AssignmentLogORM(Base):
    __tablename__ = "assignment_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    todo_id = Column(Integer, nullable=False, index=True)
    old_future_score = Column(Integer, nullable=True)
    old_urgency_score = Column(Integer, nullable=True)
    new_future_score = Column(Integer, nullable=True)
    new_urgency_score = Column(Integer, nullable=True)
    source = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class SystemSettingORM(Base):
    __tablename__ = "system_settings"

    key = Column(String(50), primary_key=True, index=True)
    value = Column(String(500), nullable=True)
    blob_value = Column(LargeBinary, nullable=True)
    content_type = Column(String(100), nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    def __repr__(self):
        return f"<SystemSettingORM(key='{self.key}', updated_at={self.updated_at})>"

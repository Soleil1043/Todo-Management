from typing import Dict, Optional, List
from sqlalchemy.orm import Session
from database.models import TodoItemDB, RecycleBinItemDB, Priority
from models.model import TodoItem
import datetime
import logging

logger = logging.getLogger(__name__)

class DatabaseTodoStorage:
    """数据库待办事项存储类"""
    
    def __init__(self, db: Session):
        """初始化数据库存储"""
        self.db = db
    
    def get_all_todos(self) -> Dict[int, TodoItem]:
        """获取所有未删除的待办事项"""
        try:
            todos = self.db.query(TodoItemDB).filter(TodoItemDB.deleted == False).all()
            return {todo.id: self._db_to_pydantic(todo) for todo in todos}
        except Exception as e:
            logger.error(f"获取所有待办事项失败: {e}")
            return {}
    
    def get_todo_by_id(self, todo_id: int) -> Optional[TodoItem]:
        """根据ID获取待办事项"""
        try:
            todo = self.db.query(TodoItemDB).filter(
                TodoItemDB.id == todo_id,
                TodoItemDB.deleted == False
            ).first()
            return self._db_to_pydantic(todo) if todo else None
        except Exception as e:
            logger.error(f"获取待办事项失败 (ID: {todo_id}): {e}")
            return None
    
    def add_todo(self, todo: TodoItem) -> TodoItem:
        """添加新的待办事项"""
        try:
            db_todo = TodoItemDB(
                title=todo.title,
                description=todo.description,
                completed=todo.completed,
                priority=Priority(todo.priority),
                start_time=todo.start_time,
                end_time=todo.end_time
            )
            self.db.add(db_todo)
            self.db.commit()
            self.db.refresh(db_todo)
            
            # 返回包含ID的Pydantic模型
            result = self._db_to_pydantic(db_todo)
            logger.info(f"成功添加待办事项: {result.title} (ID: {result.id})")
            return result
        except Exception as e:
            self.db.rollback()
            logger.error(f"添加待办事项失败: {e}")
            raise
    
    def update_todo(self, todo_id: int, **kwargs) -> bool:
        """更新待办事项的属性"""
        todo = self.db.query(TodoItemDB).filter(
            TodoItemDB.id == todo_id,
            TodoItemDB.deleted == False
        ).first()
        
        if not todo:
            return False
        
        # 更新字段
        for key, value in kwargs.items():
            if hasattr(todo, key) and key != 'id':
                if key == 'priority' and isinstance(value, str):
                    value = Priority(value)
                setattr(todo, key, value)
        
        todo.updated_at = datetime.datetime.now()
        self.db.commit()
        return True
    
    def remove_todo(self, todo_id: int) -> Optional[TodoItem]:
        """从待办事项列表中移除指定ID的事项（软删除）"""
        todo = self.db.query(TodoItemDB).filter(
            TodoItemDB.id == todo_id,
            TodoItemDB.deleted == False
        ).first()
        
        if not todo:
            return None
        
        # 转换为Pydantic模型返回
        result = self._db_to_pydantic(todo)
        
        # 软删除
        todo.deleted = True
        todo.updated_at = datetime.datetime.now()
        self.db.commit()
        
        return result
    
    def get_recycle_bin(self) -> Dict[int, TodoItem]:
        """获取回收站中的所有事项"""
        recycle_items = self.db.query(RecycleBinItemDB).all()
        return {item.original_id: self._recycle_bin_to_pydantic(item) for item in recycle_items}
    
    def add_to_recycle_bin(self, todo: TodoItem) -> None:
        """将事项添加到回收站"""
        if todo.id is None:
            return
        
        recycle_item = RecycleBinItemDB(
            original_id=todo.id,
            title=todo.title,
            description=todo.description,
            completed=todo.completed,
            priority=Priority(todo.priority),
            start_time=todo.start_time,
            end_time=todo.end_time,
            created_at=datetime.datetime.now()
        )
        self.db.add(recycle_item)
        self.db.commit()
    
    def remove_from_recycle_bin(self, todo_id: int) -> Optional[TodoItem]:
        """从回收站中移除指定ID的事项"""
        recycle_item = self.db.query(RecycleBinItemDB).filter(
            RecycleBinItemDB.original_id == todo_id
        ).first()
        
        if not recycle_item:
            return None
        
        result = self._recycle_bin_to_pydantic(recycle_item)
        self.db.delete(recycle_item)
        self.db.commit()
        return result
    
    def clear_recycle_bin(self) -> None:
        """清空回收站"""
        self.db.query(RecycleBinItemDB).delete()
        self.db.commit()
    
    def get_stats(self) -> dict:
        """获取统计信息"""
        total = self.db.query(TodoItemDB).filter(TodoItemDB.deleted == False).count()
        completed = self.db.query(TodoItemDB).filter(
            TodoItemDB.deleted == False,
            TodoItemDB.completed == True
        ).count()
        recycle_bin = self.db.query(RecycleBinItemDB).count()
        
        return {
            "total": total,
            "completed": completed,
            "pending": total - completed,
            "recycle_bin": recycle_bin
        }
    
    def _db_to_pydantic(self, db_todo: TodoItemDB) -> TodoItem:
        """将数据库模型转换为Pydantic模型"""
        return TodoItem(
            id=db_todo.id,
            title=db_todo.title,
            description=db_todo.description,
            completed=db_todo.completed,
            priority=db_todo.priority.value,
            start_time=db_todo.start_time,
            end_time=db_todo.end_time
        )
    
    def _recycle_bin_to_pydantic(self, recycle_item: RecycleBinItemDB) -> TodoItem:
        """将回收站数据库模型转换为Pydantic模型"""
        return TodoItem(
            id=recycle_item.original_id,
            title=recycle_item.title,
            description=recycle_item.description,
            completed=recycle_item.completed,
            priority=recycle_item.priority.value,
            start_time=recycle_item.start_time,
            end_time=recycle_item.end_time
        )
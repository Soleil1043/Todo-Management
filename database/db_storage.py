from typing import Dict, Optional, List
from sqlalchemy.orm import Session
from database.orm_models import TodoORM, RecycleBinORM, Priority
from models.schemas import TodoSchema
from database.storage import TodoStorage
import datetime
import logging

logger = logging.getLogger(__name__)

class DatabaseTodoStorage(TodoStorage):
    """数据库待办事项存储类"""
    
    def __init__(self, db: Session):
        """初始化数据库存储"""
        self.db = db
    
    def get_all_todos(self) -> Dict[int, TodoSchema]:
        """获取所有未删除的待办事项"""
        try:
            todos = self.db.query(TodoORM).filter(TodoORM.deleted == False).all()
            # 使用生成器表达式提高内存效率
            return {todo.id: self._db_to_pydantic(todo) for todo in todos}
        except Exception as e:
            logger.error(f"获取所有待办事项失败: {e}")
            return {}
    
    def get_todo_by_id(self, todo_id: int) -> Optional[TodoSchema]:
        """根据ID获取待办事项"""
        try:
            # 使用get()方法更高效，因为它直接通过主键查询
            todo = self.db.get(TodoORM, todo_id)
            if todo and not todo.deleted:  # type: ignore
                return self._db_to_pydantic(todo)
            return None
        except Exception as e:
            logger.error(f"获取待办事项失败 (ID: {todo_id}): {e}")
            return None
    
    def add_todo(self, todo: TodoSchema) -> TodoSchema:
        """添加新的待办事项"""
        try:
            db_todo = TodoORM(
                title=todo.title,
                description=todo.description,
                completed=todo.completed,
                priority=Priority(todo.priority),
                start_time=todo.start_time,
                end_time=todo.end_time
            )
            
            # 如果提供了ID，设置为指定的ID（用于恢复功能）
            if todo.id is not None:
                db_todo.id = todo.id
            
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
        todo = self.db.get(TodoORM, todo_id)
        
        if not todo or todo.deleted:  # type: ignore
            return False
        
        # 只更新实际变化的字段，避免不必要的属性设置
        updated_fields = []
        for key, value in kwargs.items():
            if hasattr(todo, key) and key != 'id':
                if key == 'priority' and isinstance(value, str):
                    value = Priority(value)
                # 只在值实际变化时才更新
                if getattr(todo, key) != value:  # type: ignore
                    setattr(todo, key, value)
                    updated_fields.append(key)
        
        # 只有在有实际更新时才修改时间戳和提交
        if updated_fields:
            todo.updated_at = datetime.datetime.utcnow()  # type: ignore
            self.db.commit()
            logger.info(f"待办事项 {todo_id} 更新了字段: {updated_fields}")
        
        return True
    
    def remove_todo(self, todo_id: int) -> Optional[TodoSchema]:
        """从待办事项列表中移除指定ID的事项（软删除）"""
        todo = self.db.get(TodoORM, todo_id)
        
        if not todo or todo.deleted:  # type: ignore
            return None
        
        # 转换为Pydantic模型返回
        result = self._db_to_pydantic(todo)
        
        # 软删除
        todo.deleted = True  # type: ignore
        todo.updated_at = datetime.datetime.utcnow()  # type: ignore
        self.db.commit()
        
        logger.info(f"待办事项 {todo_id} 已软删除")
        return result
    
    def get_recycle_bin(self) -> Dict[int, TodoSchema]:
        """获取回收站中的所有事项"""
        recycle_items = self.db.query(RecycleBinORM).all()
        return {item.original_id: self._recycle_bin_to_pydantic(item) for item in recycle_items}
    
    def add_to_recycle_bin(self, todo: TodoSchema) -> None:
        """将事项添加到回收站"""
        if todo.id is None:
            return
        
        recycle_item = RecycleBinORM(
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
    
    def remove_from_recycle_bin(self, todo_id: int) -> Optional[TodoSchema]:
        """从回收站中移除指定ID的事项"""
        recycle_item = self.db.query(RecycleBinORM).filter(
            RecycleBinORM.original_id == todo_id
        ).first()
        
        if not recycle_item:
            return None
        
        result = self._recycle_bin_to_pydantic(recycle_item)
        self.db.delete(recycle_item)
        self.db.commit()
        return result
    
    def clear_recycle_bin(self) -> None:
        """清空回收站"""
        self.db.query(RecycleBinORM).delete()
        self.db.commit()
    
    def batch_restore_from_recycle_bin(self, todo_ids: List[int]) -> List[TodoSchema]:
        """批量从回收站恢复指定ID的事项"""
        restored_todos = []
        
        # 批量获取回收站项目
        recycle_items = self.db.query(RecycleBinORM).filter(
            RecycleBinORM.original_id.in_(todo_ids)
        ).all()
        
        # 创建回收项目映射
        recycle_map = {item.original_id: item for item in recycle_items}
        
        # 批量检查已存在的待办事项
        existing_todos = self.db.query(TodoORM).filter(
            TodoORM.id.in_(todo_ids)
        ).all()
        existing_map = {todo.id: todo for todo in existing_todos}
        
        for todo_id in todo_ids:
            recycle_item = recycle_map.get(todo_id)
            if not recycle_item:
                continue
            
            existing_todo = existing_map.get(todo_id)
            
            if existing_todo:
                if not existing_todo.deleted:  # type: ignore
                    # 如果已存在且未被删除，跳过恢复
                    continue
                # 如果存在但被软删除，恢复它
                existing_todo.deleted = False  # type: ignore
                existing_todo.updated_at = datetime.datetime.utcnow()  # type: ignore
                restored_todo = self._db_to_pydantic(existing_todo)
            else:
                # 创建新的待办事项，保持原始ID
                db_todo = TodoORM(
                    id=todo_id,
                    title=recycle_item.title,
                    description=recycle_item.description,
                    completed=recycle_item.completed,
                    priority=recycle_item.priority,
                    start_time=recycle_item.start_time,
                    end_time=recycle_item.end_time
                )
                self.db.add(db_todo)
                restored_todo = self._db_to_pydantic(db_todo)
            
            # 从回收站删除
            self.db.delete(recycle_item)
            restored_todos.append(restored_todo)
        
        self.db.commit()
        logger.info(f"批量恢复了 {len(restored_todos)} 个待办事项")
        return restored_todos
    
    def get_stats(self) -> dict:
        """获取统计信息"""
        total = self.db.query(TodoORM).filter(TodoORM.deleted == False).count()
        completed = self.db.query(TodoORM).filter(
            TodoORM.deleted == False,
            TodoORM.completed == True
        ).count()
        recycle_bin = self.db.query(RecycleBinORM).count()
        
        return {
            "total": total,
            "completed": completed,
            "pending": total - completed,
            "recycle_bin": recycle_bin
        }
    
    def _db_to_pydantic(self, db_todo: TodoORM) -> TodoSchema:
        """将数据库模型转换为Pydantic模型"""
        return TodoSchema(
            id=db_todo.id,
            title=db_todo.title,
            description=db_todo.description,
            completed=db_todo.completed,
            priority=db_todo.priority.value,
            start_time=db_todo.start_time,
            end_time=db_todo.end_time
        )
    
    def _recycle_bin_to_pydantic(self, recycle_item: RecycleBinORM) -> TodoSchema:
        """将回收站数据库模型转换为Pydantic模型"""
        return TodoSchema(
            id=recycle_item.original_id,
            title=recycle_item.title,
            description=recycle_item.description,
            completed=recycle_item.completed,
            priority=recycle_item.priority.value,
            start_time=recycle_item.start_time,
            end_time=recycle_item.end_time
        )
from typing import Dict, Optional, List, Any
from utils.priority_calculator import calculate_priority
from sqlalchemy.orm import Session
from database.orm_models import TodoORM, RecycleBinORM, AssignmentLogORM
from models.schemas import TodoSchema
from database.storage import TodoStorage
from utils.exceptions import DatabaseException
import datetime
import logging

logger = logging.getLogger(__name__)


class DatabaseTodoStorage(TodoStorage):
    """基于SQLAlchemy的待办事项存储实现类
    
    负责与数据库进行直接交互，执行CRUD操作。
    """
    
    def __init__(self, db: Session) -> None:
        """初始化存储实例
        
        Args:
            db: SQLAlchemy数据库会话对象
        """
        self.db = db
    
    def get_all_todos(self) -> Dict[int, TodoSchema]:
        """从数据库中检索所有未删除的待办事项
        
        Returns:
            Dict[int, TodoSchema]: ID到Todo对象的映射
        """
        try:
            todos = self.db.query(TodoORM).filter(TodoORM.deleted == False).all()
            logger.debug(f"从数据库检索到 {len(todos)} 条未删除的待办事项")
            return {todo.id: self._db_to_pydantic(todo) for todo in todos}
        except Exception as e:
            logger.error(f"从数据库获取所有待办事项失败: {e}", exc_info=True)
            raise DatabaseException(f"获取待办事项失败: {str(e)}")
    
    def get_todo_by_id(self, todo_id: int) -> Optional[TodoSchema]:
        """通过ID从数据库查找特定待办事项
        
        Args:
            todo_id: 待办事项ID
            
        Returns:
            Optional[TodoSchema]: 找到的对象或None
        """
        try:
            todo = self.db.get(TodoORM, todo_id)
            if todo and not todo.deleted:  # type: ignore
                return self._db_to_pydantic(todo)
            return None
        except Exception as e:
            logger.error(f"从数据库查找待办事项失败 (ID: {todo_id}): {e}", exc_info=True)
            raise DatabaseException(f"查询待办事项失败: {str(e)}")
    
    def add_todo(self, todo: TodoSchema) -> TodoSchema:
        """将新的待办事项持久化到数据库
        
        Args:
            todo: 待办事项数据
            
        Returns:
            TodoSchema: 包含生成ID的持久化对象
        """
        try:
            final_priority = 100
            if todo.future_score is not None and todo.urgency_score is not None:
                final_priority = calculate_priority(todo.future_score, todo.urgency_score)

            db_todo = TodoORM(
                title=todo.title,
                description=todo.description,
                completed=todo.completed,
                future_score=todo.future_score,
                urgency_score=todo.urgency_score,
                final_priority=final_priority,
                start_time=todo.start_time,
                end_time=todo.end_time
            )

            if todo.id is not None:
                db_todo.id = todo.id

            self.db.add(db_todo)
            self.db.commit()
            self.db.refresh(db_todo)

            result = self._db_to_pydantic(db_todo)
            logger.info(f"数据库已成功保存新待办事项: {result.title} (ID: {result.id})")
            return result
        except Exception as e:
            self.db.rollback()
            logger.error(f"数据库添加待办事项失败: {e}", exc_info=True)
            raise DatabaseException(f"创建待办事项失败: {str(e)}")
    
    def update_todo(self, todo_id: int, **kwargs: Any) -> bool:
        """更新数据库中现有待办事项的属性
        
        Args:
            todo_id: 待办事项ID
            **kwargs: 需要更新的属性键值对
            
        Returns:
            bool: 更新是否成功
        """
        try:
            todo = self.db.get(TodoORM, todo_id)

            if not todo or todo.deleted:  # type: ignore
                logger.warning(f"尝试更新不存在或已删除的数据库记录 ID: {todo_id}")
                return False

            operation_source = kwargs.pop('operation_source', None)
            old_future_score = todo.future_score
            old_urgency_score = todo.urgency_score

            updated_fields: List[str] = []
            for key, value in kwargs.items():
                if hasattr(todo, key) and key != 'id':
                    if getattr(todo, key) != value:  # type: ignore
                        setattr(todo, key, value)
                        updated_fields.append(key)

            score_changed = False
            if 'future_score' in updated_fields or 'urgency_score' in updated_fields:
                if todo.future_score is not None and todo.urgency_score is not None:
                    new_priority = calculate_priority(todo.future_score, todo.urgency_score)  # type: ignore
                    if todo.final_priority != new_priority:  # type: ignore
                        todo.final_priority = new_priority  # type: ignore
                        updated_fields.append('final_priority')
                else:
                    if todo.final_priority != 100:
                        todo.final_priority = 100
                        updated_fields.append('final_priority')
                score_changed = True

            if updated_fields:
                todo.updated_at = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)  # type: ignore
                if score_changed and todo.id is not None:
                    log_entry = AssignmentLogORM(
                        todo_id=todo.id,
                        old_future_score=old_future_score,
                        old_urgency_score=old_urgency_score,
                        new_future_score=todo.future_score,
                        new_urgency_score=todo.urgency_score,
                        source=operation_source,
                    )
                    self.db.add(log_entry)
                self.db.commit()
                logger.info(f"数据库记录 {todo_id} 已更新字段: {updated_fields}")

            return True
        except Exception as e:
            self.db.rollback()
            logger.error(f"数据库更新操作失败 ID: {todo_id}, 错误: {e}", exc_info=True)
            raise DatabaseException(f"更新待办事项失败: {str(e)}")
    
    def remove_todo(self, todo_id: int) -> Optional[TodoSchema]:
        """从待办事项列表中移除指定ID的事项（软删除）"""
        try:
            todo = self.db.get(TodoORM, todo_id)
            
            if not todo or todo.deleted:  # type: ignore
                return None
            
            # 转换为Pydantic模型返回
            result = self._db_to_pydantic(todo)
            
            # 软删除
            todo.deleted = True  # type: ignore
            todo.updated_at = datetime.datetime.now(datetime.UTC).replace(tzinfo=None)  # type: ignore
            self.db.commit()
            
            logger.info(f"待办事项 {todo_id} 已软删除")
            return result
        except Exception as e:
            self.db.rollback()
            logger.error(f"软删除待办事项失败 (ID: {todo_id}): {e}", exc_info=True)
            raise DatabaseException(f"删除待办事项失败: {str(e)}")
    
    def get_recycle_bin(self) -> Dict[int, TodoSchema]:
        """获取回收站中的所有事项"""
        try:
            recycle_items = self.db.query(RecycleBinORM).all()
            return {item.original_id: self._recycle_bin_to_pydantic(item) for item in recycle_items}
        except Exception as e:
            logger.error(f"获取回收站内容失败: {e}", exc_info=True)
            raise DatabaseException(f"获取回收站失败: {str(e)}")
    
    def add_to_recycle_bin(self, todo: TodoSchema) -> None:
        """将事项添加到回收站"""
        try:
            if todo.id is None:
                return
            
            final_priority = todo.final_priority
            if todo.future_score is not None and todo.urgency_score is not None:
                final_priority = calculate_priority(todo.future_score, todo.urgency_score)

            recycle_item = RecycleBinORM(
                original_id=todo.id,
                title=todo.title,
                description=todo.description,
                completed=todo.completed,
                future_score=todo.future_score,
                urgency_score=todo.urgency_score,
                final_priority=final_priority,
                start_time=todo.start_time,
                end_time=todo.end_time
            )
            self.db.add(recycle_item)
            self.db.commit()
            logger.info(f"事项已添加到回收站: {todo.title} (ID: {todo.id})")
        except Exception as e:
            self.db.rollback()
            logger.error(f"添加到回收站失败 (ID: {todo.id}): {e}", exc_info=True)
            raise DatabaseException(f"添加到回收站失败: {str(e)}")
    
    def remove_from_recycle_bin(self, todo_id: int) -> Optional[TodoSchema]:
        """从回收站中永久删除事项"""
        try:
            recycle_item = self.db.query(RecycleBinORM).filter(RecycleBinORM.original_id == todo_id).first()
            if not recycle_item:
                return None
            
            result = self._recycle_bin_to_pydantic(recycle_item)
            self.db.delete(recycle_item)
            
            # 同时永久删除主表中的记录
            todo = self.db.get(TodoORM, todo_id)
            if todo:
                self.db.delete(todo)
                
            self.db.commit()
            logger.info(f"待办事项 {todo_id} 已从系统中永久删除")
            return result
        except Exception as e:
            self.db.rollback()
            logger.error(f"永久删除失败 (ID: {todo_id}): {e}", exc_info=True)
            raise DatabaseException(f"永久删除失败: {str(e)}")
    
    def clear_recycle_bin(self) -> None:
        """清空回收站"""
        try:
            # 获取回收站中所有原始ID
            recycle_items = self.db.query(RecycleBinORM).all()
            original_ids = [item.original_id for item in recycle_items]
            
            # 删除主表中对应的记录
            if original_ids:
                self.db.query(TodoORM).filter(TodoORM.id.in_(original_ids)).delete(synchronize_session=False)
            
            # 删除回收站中所有记录
            self.db.query(RecycleBinORM).delete()
            self.db.commit()
            logger.info("回收站已成功清空")
        except Exception as e:
            self.db.rollback()
            logger.error(f"清空回收站操作失败: {e}", exc_info=True)
            raise DatabaseException(f"清空回收站失败: {str(e)}")
    
    def batch_restore_from_recycle_bin(self, todo_ids: List[int]) -> List[TodoSchema]:
        """批量从回收站恢复事项"""
        try:
            restored_todos = []
            for todo_id in todo_ids:
                recycle_item = self.db.query(RecycleBinORM).filter(RecycleBinORM.original_id == todo_id).first()
                if recycle_item:
                    # 更新主表记录
                    todo = self.db.get(TodoORM, todo_id)
                    if todo:
                        todo.deleted = False # type: ignore
                        todo.updated_at = datetime.datetime.now(datetime.UTC).replace(tzinfo=None) # type: ignore
                        restored_todos.append(self._db_to_pydantic(todo))
                    
                    # 从回收站移除
                    self.db.delete(recycle_item)
            
            self.db.commit()
            logger.info(f"成功恢复 {len(restored_todos)} 条记录")
            return restored_todos
        except Exception as e:
            self.db.rollback()
            logger.error(f"批量恢复失败: {e}", exc_info=True)
            raise DatabaseException(f"批量恢复失败: {str(e)}")
    
    def get_stats(self) -> Dict[str, Any]:
        """获取待办事项统计数据"""
        try:
            total = self.db.query(TodoORM).filter(TodoORM.deleted == False).count()
            completed = self.db.query(TodoORM).filter(TodoORM.deleted == False, TodoORM.completed == True).count()
            in_recycle = self.db.query(RecycleBinORM).count()
            
            return {
                "total_active": total,
                "completed": completed,
                "pending": total - completed,
                "in_recycle_bin": in_recycle,
                "timestamp": datetime.datetime.now(datetime.UTC).isoformat()
            }
        except Exception as e:
            logger.error(f"获取统计数据失败: {e}", exc_info=True)
            raise DatabaseException(f"获取统计数据失败: {str(e)}")
    
    def _db_to_pydantic(self, db_todo: TodoORM) -> TodoSchema:
        """将数据库模型转换为Pydantic模型"""
        return TodoSchema(
            id=db_todo.id,
            title=db_todo.title,
            description=db_todo.description,
            completed=db_todo.completed,
            future_score=db_todo.future_score,
            urgency_score=db_todo.urgency_score,
            final_priority=db_todo.final_priority,
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
            future_score=recycle_item.future_score,
            urgency_score=recycle_item.urgency_score,
            final_priority=recycle_item.final_priority,
            start_time=recycle_item.start_time,
            end_time=recycle_item.end_time
        )

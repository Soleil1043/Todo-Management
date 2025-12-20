from typing import Optional, List, Dict, Any
import logging
from models.schemas import TodoSchema
from database.storage import TodoStorage

logger = logging.getLogger(__name__)

class TodoService:
    """待办事项业务逻辑服务类，负责处理所有业务逻辑
    
    该类作为控制器(Router)和存储层(Storage)之间的中介，
    处理数据的转换、业务规则的验证以及复杂的业务流程。
    """
    
    def __init__(self, storage: TodoStorage) -> None:
        """初始化服务，注入存储依赖
        
        Args:
            storage: 实现TodoStorage接口的存储对象
        """
        self.storage = storage
    
    def get_all_todos(self) -> Dict[int, TodoSchema]:
        """获取所有未删除的待办事项
        
        Returns:
            Dict[int, TodoSchema]: ID到TodoSchema对象的映射
        """
        logger.debug("正在请求获取所有待办事项")
        return self.storage.get_all_todos()
    
    def get_todo_by_id(self, todo_id: int) -> Optional[TodoSchema]:
        """根据ID获取特定待办事项
        
        Args:
            todo_id: 待办事项的唯一标识符
            
        Returns:
            Optional[TodoSchema]: 找到的事项对象，否则返回None
        """
        logger.debug(f"正在获取待办事项 ID: {todo_id}")
        return self.storage.get_todo_by_id(todo_id)
    
    def create_todo(self, todo: TodoSchema) -> TodoSchema:
        """创建并存储新的待办事项
        
        Args:
            todo: 待办事项数据模型
            
        Returns:
            TodoSchema: 包含生成ID的已创建对象
        """
        logger.info(f"正在创建新的待办事项: {todo.title}")
        try:
            return self.storage.add_todo(todo)
        except Exception as e:
            logger.error(f"创建待办事项失败: {e}")
            raise
    
    def update_todo(self, todo_id: int, **kwargs: Any) -> Optional[TodoSchema]:
        """更新现有待办事项的字段
        
        Args:
            todo_id: 待办事项ID
            **kwargs: 要更新的字段及其新值
            
        Returns:
            Optional[TodoSchema]: 更新后的对象，如果事项不存在则返回None
        """
        logger.info(f"正在更新待办事项 ID: {todo_id}, 更新内容: {kwargs}")
        # 先验证待办事项是否存在
        existing_todo = self.storage.get_todo_by_id(todo_id)
        if not existing_todo:
            logger.warning(f"尝试更新不存在的待办事项 ID: {todo_id}")
            return None
        
        # 执行更新
        try:
            if self.storage.update_todo(todo_id, **kwargs):
                return self.storage.get_todo_by_id(todo_id)
        except Exception as e:
            logger.error(f"更新待办事项失败 ID: {todo_id}, 错误: {e}")
            raise
        return None
    
    def delete_todo(self, todo_id: int) -> Optional[TodoSchema]:
        """删除待办事项并将其移至回收站（软删除）
        
        Args:
            todo_id: 待办事项ID
            
        Returns:
            Optional[TodoSchema]: 已删除并移至回收站的对象
        """
        logger.info(f"正在删除待办事项并将移至回收站 ID: {todo_id}")
        try:
            deleted_todo = self.storage.remove_todo(todo_id)
            if deleted_todo:
                self.storage.add_to_recycle_bin(deleted_todo)
                logger.info(f"待办事项已成功移至回收站 ID: {todo_id}")
                return deleted_todo
            else:
                logger.warning(f"尝试删除不存在的待办事项 ID: {todo_id}")
        except Exception as e:
            logger.error(f"软删除待办事项失败 ID: {todo_id}, 错误: {e}")
            raise
        return None
    
    def toggle_todo_status(self, todo_id: int) -> Optional[TodoSchema]:
        """切换待办事项的完成状态
        
        Args:
            todo_id: 待办事项ID
            
        Returns:
            Optional[TodoSchema]: 状态切换后的对象
        """
        logger.info(f"正在切换待办事项完成状态 ID: {todo_id}")
        todo = self.storage.get_todo_by_id(todo_id)
        if not todo:
            logger.warning(f"尝试切换状态的不存在待办事项 ID: {todo_id}")
            return None
        
        # 执行状态反转
        new_status = not todo.completed
        try:
            if self.storage.update_todo(todo_id, completed=new_status):
                logger.info(f"待办事项 ID: {todo_id} 状态已更新为: {new_status}")
                # 手动构建返回对象以提高效率，减少一次数据库查询
                todo.completed = new_status
                return todo
        except Exception as e:
            logger.error(f"切换状态失败 ID: {todo_id}, 错误: {e}")
            raise
        return None
    
    def get_recycle_bin(self) -> Dict[int, TodoSchema]:
        """获取回收站中的所有待办事项
        
        Returns:
            Dict[int, TodoSchema]: 回收站中ID到TodoSchema对象的映射
        """
        logger.debug("正在请求获取回收站内容")
        return self.storage.get_recycle_bin()
    
    def restore_todo(self, todo_id: int) -> Optional[TodoSchema]:
        """将待办事项从回收站恢复到活跃列表
        
        Args:
            todo_id: 待办事项ID
            
        Returns:
            Optional[TodoSchema]: 恢复后的对象
        """
        logger.info(f"正在从回收站恢复待办事项 ID: {todo_id}")
        try:
            restored_todos = self.storage.batch_restore_from_recycle_bin([todo_id])
            if restored_todos:
                logger.info(f"成功恢复待办事项 ID: {todo_id}")
                return restored_todos[0]
            else:
                logger.warning(f"恢复失败，回收站中未找到 ID: {todo_id}")
        except Exception as e:
            logger.error(f"恢复待办事项失败 ID: {todo_id}, 错误: {e}")
            raise
        return None
    
    def permanently_delete_todo(self, todo_id: int) -> bool:
        """从回收站中永久删除待办事项
        
        Args:
            todo_id: 待办事项ID
            
        Returns:
            bool: 删除是否成功
        """
        logger.info(f"正在永久删除待办事项 ID: {todo_id}")
        try:
            success = self.storage.remove_from_recycle_bin(todo_id) is not None
            if success:
                logger.info(f"待办事项已永久删除 ID: {todo_id}")
            else:
                logger.warning(f"永久删除失败，回收站中未找到 ID: {todo_id}")
            return success
        except Exception as e:
            logger.error(f"永久删除操作失败 ID: {todo_id}, 错误: {e}")
            raise
    
    def clear_recycle_bin(self) -> None:
        """清空回收站中的所有内容"""
        logger.info("正在清空回收站")
        try:
            self.storage.clear_recycle_bin()
            logger.info("回收站已清空")
        except Exception as e:
            logger.error(f"清空回收站失败: {e}")
            raise
    
    def batch_restore_todos(self, todo_ids: List[int]) -> List[TodoSchema]:
        """批量恢复回收站中的多个待办事项
        
        Args:
            todo_ids: 待办事项ID列表
            
        Returns:
            List[TodoSchema]: 恢复后的对象列表
        """
        logger.info(f"正在批量恢复待办事项 IDs: {todo_ids}")
        try:
            return self.storage.batch_restore_from_recycle_bin(todo_ids)
        except Exception as e:
            logger.error(f"批量恢复待办事项失败: {e}")
            raise
    
    def get_todo_stats(self) -> Dict[str, Any]:
        """获取待办事项的汇总统计数据
        
        Returns:
            Dict[str, Any]: 包含各项统计指标的字典
        """
        logger.debug("正在请求获取统计数据")
        try:
            return self.storage.get_stats()
        except Exception as e:
            logger.error(f"获取统计数据失败: {e}")
            raise

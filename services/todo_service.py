from typing import Optional
from models.model import TodoItem
from database.storage import TodoStorage

class TodoService:
    """待办事项业务逻辑服务类，负责处理所有业务逻辑"""
    
    def __init__(self, storage: TodoStorage):
        """初始化服务，注入存储依赖"""
        self.storage = storage
    
    def get_all_todos(self) -> dict:
        """获取所有待办事项"""
        return self.storage.get_all_todos()
    
    def get_todo_by_id(self, todo_id: int) -> Optional[TodoItem]:
        """根据ID获取待办事项"""
        return self.storage.get_todo_by_id(todo_id)
    
    def create_todo(self, todo: TodoItem) -> TodoItem:
        """创建新的待办事项"""
        return self.storage.add_todo(todo)
    
    def update_todo(self, todo_id: int, **kwargs) -> Optional[TodoItem]:
        """更新待办事项"""
        if self.storage.update_todo(todo_id, **kwargs):
            return self.storage.get_todo_by_id(todo_id)
        return None
    
    def delete_todo(self, todo_id: int) -> Optional[TodoItem]:
        """删除待办事项（移动到回收站）"""
        deleted_todo = self.storage.remove_todo(todo_id)
        if deleted_todo:
            self.storage.add_to_recycle_bin(deleted_todo)
            return deleted_todo
        return None
    
    def toggle_todo_status(self, todo_id: int) -> Optional[TodoItem]:
        """切换待办事项完成状态"""
        todo = self.storage.get_todo_by_id(todo_id)
        if todo and self.storage.update_todo(todo_id, completed=not todo.completed):
            return self.storage.get_todo_by_id(todo_id)
        return None
    
    def get_recycle_bin(self) -> dict:
        """获取回收站中的所有事项"""
        return self.storage.get_recycle_bin()
    
    def restore_todo(self, todo_id: int) -> Optional[TodoItem]:
        """从回收站恢复待办事项"""
        restored_todo = self.storage.remove_from_recycle_bin(todo_id)
        if restored_todo:
            self.storage.add_todo(restored_todo)
            return restored_todo
        return None
    
    def permanently_delete_todo(self, todo_id: int) -> bool:
        """永久删除回收站中的待办事项"""
        return self.storage.remove_from_recycle_bin(todo_id) is not None
    
    def clear_recycle_bin(self) -> None:
        """清空回收站"""
        self.storage.clear_recycle_bin()
    
    def get_stats(self) -> dict:
        """获取统计信息"""
        return self.storage.get_stats()
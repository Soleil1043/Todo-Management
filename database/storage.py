from typing import Dict, Optional
from abc import ABC, abstractmethod
from models.model import TodoItem

class TodoStorage(ABC):
    """待办事项存储抽象基类，定义存储接口"""
    
    @abstractmethod
    def get_all_todos(self) -> Dict[int, TodoItem]:
        """获取所有待办事项"""
        pass
    
    @abstractmethod
    def get_todo_by_id(self, todo_id: int) -> Optional[TodoItem]:
        """根据ID获取待办事项"""
        pass
    
    @abstractmethod
    def add_todo(self, todo: TodoItem) -> TodoItem:
        """添加新的待办事项"""
        pass
    
    @abstractmethod
    def update_todo(self, todo_id: int, **kwargs) -> bool:
        """更新待办事项的属性"""
        pass
    
    @abstractmethod
    def remove_todo(self, todo_id: int) -> Optional[TodoItem]:
        """从待办事项列表中移除指定ID的事项"""
        pass
    
    @abstractmethod
    def get_recycle_bin(self) -> Dict[int, TodoItem]:
        """获取回收站中的所有事项"""
        pass
    
    @abstractmethod
    def add_to_recycle_bin(self, todo: TodoItem) -> None:
        """将事项添加到回收站"""
        pass
    
    @abstractmethod
    def remove_from_recycle_bin(self, todo_id: int) -> Optional[TodoItem]:
        """从回收站中移除指定ID的事项"""
        pass
    
    @abstractmethod
    def clear_recycle_bin(self) -> None:
        """清空回收站"""
        pass
    
    @abstractmethod
    def get_stats(self) -> dict:
        """获取统计信息"""
        pass
from typing import Dict, Optional
from models.model import TodoItem

class TodoStorage:
    """纯数据存储类，只负责数据的存储和检索，不包含业务逻辑"""
    
    def __init__(self):
        self._todos: Dict[int, TodoItem] = {}
        self._recycle_bin: Dict[int, TodoItem] = {}
        self._current_id = 1
    
    def _get_next_id(self) -> int:
        """获取下一个可用的ID"""
        next_id = self._current_id
        self._current_id += 1
        return next_id
    
    def get_all_todos(self) -> Dict[int, TodoItem]:
        """获取所有待办事项"""
        return self._todos.copy()
    
    def get_todo_by_id(self, todo_id: int) -> Optional[TodoItem]:
        """根据ID获取待办事项 - O(1)复杂度"""
        return self._todos.get(todo_id)
    
    def add_todo(self, todo: TodoItem) -> TodoItem:
        """添加新的待办事项"""
        todo.id = self._get_next_id()
        self._todos[todo.id] = todo
        return todo
    
    def update_todo(self, todo_id: int, **kwargs) -> bool:
        """更新待办事项的属性"""
        if todo_id in self._todos:
            todo = self._todos[todo_id]
            for key, value in kwargs.items():
                if hasattr(todo, key) and key != 'id':
                    setattr(todo, key, value)
            return True
        return False
    
    def remove_todo(self, todo_id: int) -> Optional[TodoItem]:
        """从待办事项列表中移除指定ID的事项"""
        return self._todos.pop(todo_id, None)
    
    def get_recycle_bin(self) -> Dict[int, TodoItem]:
        """获取回收站中的所有事项"""
        return self._recycle_bin.copy()
    
    def add_to_recycle_bin(self, todo: TodoItem) -> None:
        """将事项添加到回收站"""
        self._recycle_bin[todo.id] = todo
    
    def remove_from_recycle_bin(self, todo_id: int) -> Optional[TodoItem]:
        """从回收站中移除指定ID的事项"""
        return self._recycle_bin.pop(todo_id, None)
    
    def clear_recycle_bin(self) -> None:
        """清空回收站"""
        self._recycle_bin.clear()
    
    def get_stats(self) -> dict:
        """获取统计信息"""
        completed = sum(1 for todo in self._todos.values() if todo.completed)
        return {
            "total": len(self._todos),
            "completed": completed,
            "pending": len(self._todos) - completed,
            "recycle_bin": len(self._recycle_bin)
        }
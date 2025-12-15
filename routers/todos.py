from fastapi import APIRouter, HTTPException, Depends
from typing import Dict
from sqlalchemy.orm import Session
from models.model import TodoItem
from services.todo_service import TodoService
from database.db_storage import DatabaseTodoStorage
from database.database import get_db

router = APIRouter()

# 依赖注入函数
def get_service(db: Session = Depends(get_db)) -> TodoService:
    """获取TodoService实例"""
    storage = DatabaseTodoStorage(db)
    return TodoService(storage)

def _handle_not_found(result, message="未找到"):
    """统一处理未找到的情况"""
    if not result:
        raise HTTPException(status_code=404, detail=message)
    return result

@router.get("/todos", response_model=Dict[int, TodoItem])
def get_todos(service: TodoService = Depends(get_service)):
    """获取所有代办事项"""
    return service.get_all_todos()

@router.post("/todos", response_model=TodoItem)
def create_todo(todo: TodoItem, service: TodoService = Depends(get_service)):
    """创建新的代办事项"""
    return service.create_todo(todo)

@router.patch("/todos/{todo_id}", response_model=TodoItem)
def update_todo(todo_id: int, todo: TodoItem, service: TodoService = Depends(get_service)):
    """更新代办事项"""
    return _handle_not_found(
        service.update_todo(todo_id, **todo.dict(exclude_unset=True, exclude={'id'})),
        "代办事项不存在"
    )

@router.patch("/todos/{todo_id}/toggle", response_model=TodoItem)
def toggle_todo_status(todo_id: int, service: TodoService = Depends(get_service)):
    """切换代办事项完成状态"""
    return _handle_not_found(
        service.toggle_todo_status(todo_id),
        "代办事项不存在"
    )

@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, service: TodoService = Depends(get_service)):
    """将代办事项移动到回收站"""
    deleted_todo = _handle_not_found(
        service.delete_todo(todo_id),
        "代办事项不存在"
    )
    return {"message": "已移动到回收站", "todo": deleted_todo}

@router.get("/recycle-bin", response_model=Dict[int, TodoItem])
def get_recycle_bin(service: TodoService = Depends(get_service)):
    """获取回收站中的代办事项"""
    return service.get_recycle_bin()

@router.post("/recycle-bin/{todo_id}/restore", response_model=TodoItem)
def restore_todo(todo_id: int, service: TodoService = Depends(get_service)):
    """从回收站恢复代办事项"""
    return _handle_not_found(
        service.restore_todo(todo_id),
        "回收站中未找到该代办事项"
    )

@router.delete("/recycle-bin/{todo_id}")
def permanently_delete_todo(todo_id: int, service: TodoService = Depends(get_service)):
    """永久删除回收站中的待办事项"""
    _handle_not_found(
        service.permanently_delete_todo(todo_id),
        "回收站中未找到该代办事项"
    )
    return {"message": "已永久删除"}

@router.delete("/recycle-bin")
def clear_recycle_bin(service: TodoService = Depends(get_service)):
    """清空回收站"""
    service.clear_recycle_bin()
    return {"message": "回收站已清空"}

@router.get("/stats")
def get_stats(service: TodoService = Depends(get_service)):
    """获取统计信息"""
    return service.get_stats()
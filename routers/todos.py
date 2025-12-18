from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List
import logging
from pydantic import BaseModel
from sqlalchemy.orm import Session
from models.schemas import TodoSchema
from services.todo_service import TodoService
from database.db_storage import DatabaseTodoStorage
from database.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()

# 使用依赖注入而不是全局单例，避免数据库会话问题
def get_storage(db: Session = Depends(get_db)) -> DatabaseTodoStorage:
    """获取数据库存储实例"""
    return DatabaseTodoStorage(db)

def get_service(storage: DatabaseTodoStorage = Depends(get_storage)) -> TodoService:
    """获取TodoService实例"""
    return TodoService(storage)

def _handle_not_found(result, message: str = "未找到"):
    """统一处理未找到的情况"""
    if not result:
        raise HTTPException(status_code=404, detail=message)
    return result

@router.get("/todos", response_model=Dict[int, TodoSchema])
def get_todos(service: TodoService = Depends(get_service)):
    """获取所有代办事项"""
    try:
        return service.get_all_todos()
    except Exception as e:
        logger.error(f"获取待办事项失败: {e}")
        raise HTTPException(status_code=500, detail="获取待办事项失败")

@router.post("/todos", response_model=TodoSchema)
def create_todo(todo: TodoSchema, service: TodoService = Depends(get_service)):
    """创建新的代办事项"""
    try:
        return service.create_todo(todo)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"创建待办事项失败: {e}")
        raise HTTPException(status_code=500, detail="创建待办事项失败")

@router.patch("/todos/{todo_id}", response_model=TodoSchema)
def update_todo(todo_id: int, todo: TodoSchema, service: TodoService = Depends(get_service)):
    """更新代办事项"""
    return _handle_not_found(
        service.update_todo(todo_id, **todo.dict(exclude_unset=True, exclude={'id'})),
        "代办事项不存在"
    )

@router.patch("/todos/{todo_id}/toggle", response_model=TodoSchema)
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

@router.get("/recycle-bin", response_model=Dict[int, TodoSchema])
def get_recycle_bin(service: TodoService = Depends(get_service)):
    """获取回收站中的代办事项"""
    return service.get_recycle_bin()

@router.post("/recycle-bin/{todo_id}/restore", response_model=TodoSchema)
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


class BatchRestoreRequest(BaseModel):
    todo_ids: List[int]


@router.post("/recycle-bin/batch-restore")
def batch_restore_todos(request: BatchRestoreRequest, service: TodoService = Depends(get_service)):
    """批量恢复回收站中的待办事项"""
    restored_todos = service.batch_restore_todos(request.todo_ids)
    if not restored_todos:
        raise HTTPException(status_code=404, detail="未找到要恢复的待办事项")
    return {"message": f"成功恢复 {len(restored_todos)} 个待办事项", "restored_todos": restored_todos}

@router.get("/stats")
def get_stats(service: TodoService = Depends(get_service)):
    """获取统计信息"""
    try:
        return service.get_stats()
    except Exception as e:
        logger.error(f"获取统计信息失败: {e}")
        raise HTTPException(status_code=500, detail="获取统计信息失败")

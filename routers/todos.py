from fastapi import APIRouter, HTTPException, Depends, status
from typing import Dict, List, Any
import logging
from pydantic import BaseModel
from sqlalchemy.orm import Session
from models.schemas import TodoSchema, TodoUpdateSchema
from services.todo_service import TodoService
from database.db_storage import DatabaseTodoStorage
from database.database import get_db
from utils.exceptions import EntityNotFoundException, ValidationException

logger = logging.getLogger(__name__)

router = APIRouter()

# 使用依赖注入而不是全局单例，避免数据库会话问题
def get_storage(db: Session = Depends(get_db)) -> DatabaseTodoStorage:
    """获取数据库存储实例"""
    return DatabaseTodoStorage(db)

def get_service(storage: DatabaseTodoStorage = Depends(get_storage)) -> TodoService:
    """获取TodoService实例"""
    return TodoService(storage)

def _handle_not_found(result: Any, message: str = "未找到请求的资源") -> Any:
    """统一处理未找到的情况"""
    if not result:
        raise EntityNotFoundException(message)
    return result

@router.get(
    "/todos", 
    response_model=Dict[int, TodoSchema],
    summary="获取所有待办事项（经典视图数据）",
    description="从数据库中检索所有未被软删除的待办事项列表，用于经典视图展示",
    response_description="返回ID到待办事项对象的映射字典"
)
def get_todos(service: TodoService = Depends(get_service)) -> Dict[int, TodoSchema]:
    return service.get_all_todos()

@router.post(
    "/todos", 
    response_model=TodoSchema,
    status_code=status.HTTP_201_CREATED,
    summary="创建新的待办事项",
    description="接收待办事项数据并持久化到数据库中",
    response_description="返回包含生成ID的完整待办事项对象"
)
def create_todo(todo: TodoSchema, service: TodoService = Depends(get_service)) -> TodoSchema:
    try:
        return service.create_todo(todo)
    except ValueError as e:
        raise ValidationException(str(e))

@router.patch(
    "/todos/{todo_id}", 
    response_model=TodoSchema,
    summary="部分更新待办事项",
    description="更新现有待办事项的一个或多个字段",
    response_description="返回更新后的待办事项对象"
)
def update_todo(
    todo_id: int, 
    todo: TodoUpdateSchema, 
    service: TodoService = Depends(get_service)
) -> TodoSchema:
    try:
        return _handle_not_found(
            service.update_todo(todo_id, **todo.model_dump(exclude_unset=True)),
            f"ID为 {todo_id} 的待办事项不存在"
        )
    except ValueError as e:
        raise ValidationException(str(e))

@router.patch(
    "/todos/{todo_id}/toggle", 
    response_model=TodoSchema,
    summary="切换完成状态",
    description="快速切换待办事项的已完成/未完成状态",
    response_description="返回状态更新后的待办事项对象"
)
def toggle_todo_status(todo_id: int, service: TodoService = Depends(get_service)) -> TodoSchema:
    return _handle_not_found(
        service.toggle_todo_status(todo_id),
        f"ID为 {todo_id} 的待办事项不存在"
    )

@router.delete(
    "/todos/{todo_id}",
    summary="删除待办事项",
    description="将待办事项移动到垃圾桶（软删除）",
    response_description="返回操作成功信息及被删除的对象"
)
def delete_todo(todo_id: int, service: TodoService = Depends(get_service)) -> Dict[str, Any]:
    deleted_todo = _handle_not_found(
        service.delete_todo(todo_id),
        f"ID为 {todo_id} 的待办事项不存在"
    )
    return {"message": "已移动到垃圾桶", "todo": deleted_todo}

@router.get(
    "/recycle-bin", 
    response_model=Dict[int, TodoSchema],
    summary="查看垃圾桶",
    description="获取所有已被软删除的待办事项列表",
    response_description="返回垃圾桶中ID到待办事项对象的映射"
)
def get_recycle_bin(service: TodoService = Depends(get_service)) -> Dict[int, TodoSchema]:
    return service.get_recycle_bin()

@router.post(
    "/recycle-bin/{todo_id}/restore", 
    response_model=TodoSchema,
    summary="恢复待办事项",
    description="将待办事项从垃圾桶恢复到活跃列表",
    response_description="返回恢复后的待办事项对象"
)
def restore_todo(todo_id: int, service: TodoService = Depends(get_service)) -> TodoSchema:
    return _handle_not_found(
        service.restore_todo(todo_id),
        f"垃圾桶中未找到 ID 为 {todo_id} 的待办事项"
    )

@router.delete(
    "/recycle-bin/{todo_id}",
    summary="永久删除",
    description="从垃圾桶中彻底删除待办事项，不可恢复",
    response_description="返回操作成功信息"
)
def permanently_delete_todo(todo_id: int, service: TodoService = Depends(get_service)) -> Dict[str, str]:
    _handle_not_found(
        service.permanently_delete_todo(todo_id),
        f"垃圾桶中未找到 ID 为 {todo_id} 的待办事项"
    )
    return {"message": "已从系统中永久删除"}

@router.delete(
    "/recycle-bin",
    summary="清空垃圾桶",
    description="彻底删除垃圾桶中的所有待办事项",
    response_description="返回操作成功信息"
)
def clear_recycle_bin(service: TodoService = Depends(get_service)) -> Dict[str, str]:
    service.clear_recycle_bin()
    return {"message": "垃圾桶已清空"}


class BatchRestoreRequest(BaseModel):
    todo_ids: List[int]

@router.post(
    "/recycle-bin/batch-restore",
    summary="批量恢复",
    description="从回收站中批量恢复多个待办事项",
    response_description="返回恢复成功的信息及恢复的对象列表"
)
def batch_restore_todos(
    request: BatchRestoreRequest, 
    service: TodoService = Depends(get_service)
) -> Dict[str, Any]:
    restored_todos = service.batch_restore_todos(request.todo_ids)
    if not restored_todos:
        raise EntityNotFoundException("未找到要恢复的待办事项")
    return {"message": f"成功恢复 {len(restored_todos)} 个待办事项", "restored_todos": restored_todos}

@router.get(
    "/stats",
    summary="获取统计数据",
    description="获取系统的汇总统计信息，包括总数、已完成、待处理及回收站数量",
    response_description="返回各项统计指标的字典"
)
def get_stats(service: TodoService = Depends(get_service)) -> Dict[str, Any]:
    return service.get_todo_stats()

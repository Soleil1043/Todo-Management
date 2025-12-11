from fastapi import APIRouter, HTTPException
from models.model import TodoItem
from typing import List

router = APIRouter()

# 模拟数据库
todo_db = []
current_id = 1

@router.post("/todos", response_model=TodoItem, status_code=201)
def create_todo(todo:TodoItem):
    """创建新的代办事项"""
    global current_id
    todo.id = current_id
    current_id += 1
    todo_db.append(todo)
    return todo

@router.get("/todos", response_model=List[TodoItem])
def get_all_todos():
    """获取所有代办事项"""
    return todo_db

@router.get("/todos/{todo_id}", response_model=TodoItem)
def get_todo(todo_id:int):
    """根据ID获取代办事项"""
    for todo in todo_db:
        if todo.id == todo_id:
            todo.complete = True
            return {"message": "已完成", "todo":todo}
    raise HTTPException(status_code=404, detail="代办事项不存在")

@router.delete("/todos/{todo_id}")
def delete_todo(todo_id:int):
    """删除代办事项"""
    for index, todo in enumerate(todo_db):
        if todo_id == index:
            todo_db.pop(index)
            return {"message":"删除成功"}
    raise HTTPException(status_code=404, detail="代办事项不存在")
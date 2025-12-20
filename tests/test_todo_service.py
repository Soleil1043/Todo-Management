import pytest
from unittest.mock import MagicMock
from services.todo_service import TodoService
from models.schemas import TodoSchema
from database.storage import TodoStorage

@pytest.fixture
def mock_storage():
    return MagicMock(spec=TodoStorage)

@pytest.fixture
def todo_service(mock_storage):
    return TodoService(mock_storage)

def test_get_all_todos(todo_service, mock_storage):
    # 设置模拟数据
    mock_storage.get_all_todos.return_value = {
        1: TodoSchema(id=1, title="Test Todo", completed=False)
    }
    
    result = todo_service.get_all_todos()
    
    assert len(result) == 1
    assert result[1].title == "Test Todo"
    mock_storage.get_all_todos.assert_called_once()

def test_create_todo(todo_service, mock_storage):
    new_todo = TodoSchema(title="New Todo", description="Description")
    mock_storage.add_todo.return_value = TodoSchema(id=1, title="New Todo", description="Description")
    
    result = todo_service.create_todo(new_todo)
    
    assert result.id == 1
    assert result.title == "New Todo"
    mock_storage.add_todo.assert_called_once_with(new_todo)

def test_update_todo_success(todo_service, mock_storage):
    todo_id = 1
    update_data = {"title": "Updated Title"}
    
    # 模拟存在该事项
    mock_storage.get_todo_by_id.side_effect = [
        TodoSchema(id=1, title="Old Title"),  # 第一次验证
        TodoSchema(id=1, title="Updated Title")  # 第二次返回更新后
    ]
    mock_storage.update_todo.return_value = True
    
    result = todo_service.update_todo(todo_id, **update_data)
    
    assert result.title == "Updated Title"
    mock_storage.update_todo.assert_called_once_with(todo_id, **update_data)

def test_update_todo_not_found(todo_service, mock_storage):
    todo_id = 999
    mock_storage.get_todo_by_id.return_value = None
    
    result = todo_service.update_todo(todo_id, title="New Title")
    
    assert result is None
    mock_storage.update_todo.assert_not_called()

def test_delete_todo(todo_service, mock_storage):
    todo_id = 1
    deleted_todo = TodoSchema(id=1, title="Delete Me")
    mock_storage.remove_todo.return_value = deleted_todo
    
    result = todo_service.delete_todo(todo_id)
    
    assert result == deleted_todo
    mock_storage.remove_todo.assert_called_once_with(todo_id)
    mock_storage.add_to_recycle_bin.assert_called_once_with(deleted_todo)

def test_toggle_todo_status(todo_service, mock_storage):
    todo_id = 1
    initial_todo = TodoSchema(id=1, title="Toggle Me", completed=False)
    mock_storage.get_todo_by_id.return_value = initial_todo
    mock_storage.update_todo.return_value = True
    
    result = todo_service.toggle_todo_status(todo_id)
    
    assert result.completed is True
    mock_storage.update_todo.assert_called_once_with(todo_id, completed=True)

import pytest
from fastapi.testclient import TestClient
from main import app
from models.schemas import TodoSchema

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "todo-api"}

def test_get_todos():
    response = client.get("/api/todos")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_create_todo_api():
    todo_data = {
        "title": "API Test Todo",
        "description": "Created via API test",
        "completed": False,
        "future_score": 2,
        "urgency_score": 1
    }
    response = client.post("/api/todos", json=todo_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == todo_data["title"]
    assert "id" in data
    
    # 清理：删除测试数据（软删除）
    todo_id = data["id"]
    client.delete(f"/api/todos/{todo_id}")

def test_get_stats_api():
    response = client.get("/api/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "total_active" in stats
    assert "completed" in stats
    assert "pending" in stats
    assert "in_recycle_bin" in stats

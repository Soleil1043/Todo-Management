#!/usr/bin/env python3
"""测试数据库功能的脚本"""

import requests
import json
import time

# API基础URL
BASE_URL = "http://localhost:8000/api"

def test_create_todo():
    """测试创建待办事项"""
    print("=== 测试创建待办事项 ===")
    todo_data = {
        "title": "测试待办事项",
        "description": "这是一个测试",
        "priority": "high",
        "start_time": "09:00",
        "end_time": "10:00"
    }
    
    response = requests.post(f"{BASE_URL}/todos", json=todo_data)
    print(f"创建结果: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"创建的待办事项: {json.dumps(result, ensure_ascii=False, indent=2)}")
        return result.get('id')
    else:
        print(f"错误: {response.text}")
        return None

def test_get_all_todos():
    """测试获取所有待办事项"""
    print("\n=== 测试获取所有待办事项 ===")
    response = requests.get(f"{BASE_URL}/todos")
    print(f"获取结果: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"待办事项列表: {json.dumps(result, ensure_ascii=False, indent=2)}")
        return result
    else:
        print(f"错误: {response.text}")
        return {}

def test_update_todo(todo_id):
    """测试更新待办事项"""
    print(f"\n=== 测试更新待办事项 ID: {todo_id} ===")
    update_data = {
        "title": "更新的待办事项",
        "completed": True
    }
    
    response = requests.patch(f"{BASE_URL}/todos/{todo_id}", json=update_data)
    print(f"更新结果: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"更新后的待办事项: {json.dumps(result, ensure_ascii=False, indent=2)}")
    else:
        print(f"错误: {response.text}")

def test_delete_todo(todo_id):
    """测试删除待办事项"""
    print(f"\n=== 测试删除待办事项 ID: {todo_id} ===")
    response = requests.delete(f"{BASE_URL}/todos/{todo_id}")
    print(f"删除结果: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"删除结果: {json.dumps(result, ensure_ascii=False, indent=2)}")
    else:
        print(f"错误: {response.text}")

def test_get_recycle_bin():
    """测试获取回收站"""
    print("\n=== 测试获取回收站 ===")
    response = requests.get(f"{BASE_URL}/recycle-bin")
    print(f"获取结果: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"回收站内容: {json.dumps(result, ensure_ascii=False, indent=2)}")
        return result
    else:
        print(f"错误: {response.text}")
        return {}

def test_restore_todo(todo_id):
    """测试恢复待办事项"""
    print(f"\n=== 测试恢复待办事项 ID: {todo_id} ===")
    response = requests.post(f"{BASE_URL}/recycle-bin/{todo_id}/restore")
    print(f"恢复结果: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"恢复的待办事项: {json.dumps(result, ensure_ascii=False, indent=2)}")
    else:
        print(f"错误: {response.text}")

def test_get_stats():
    """测试获取统计信息"""
    print("\n=== 测试获取统计信息 ===")
    response = requests.get(f"{BASE_URL}/stats")
    print(f"获取结果: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"统计信息: {json.dumps(result, ensure_ascii=False, indent=2)}")
    else:
        print(f"错误: {response.text}")

def main():
    """主测试函数"""
    print("开始测试数据库功能...")
    
    # 测试统计信息
    test_get_stats()
    
    # 测试创建待办事项
    todo_id = test_create_todo()
    
    if todo_id:
        # 测试获取所有待办事项
        test_get_all_todos()
        
        # 测试更新待办事项
        test_update_todo(todo_id)
        
        # 测试删除待办事项
        test_delete_todo(todo_id)
        
        # 测试获取回收站
        recycle_bin = test_get_recycle_bin()
        
        # 如果有回收站项目，测试恢复
        if recycle_bin:
            test_restore_todo(todo_id)
        
        # 再次测试统计信息
        test_get_stats()
    
    print("\n=== 测试完成 ===")

if __name__ == "__main__":
    main()
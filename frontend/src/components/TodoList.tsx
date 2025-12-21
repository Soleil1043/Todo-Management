import React, { useState, useCallback } from 'react'
import { TodoSchema } from '../types/todo'
import TodoItemComponent from './TodoItem'
import { useTodoActions } from '../contexts/TodoContext'

interface TodoListProps {
  todos: TodoSchema[]
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
}) => {
  const {
    handleToggleComplete,
    handleDeleteTodo,
    handleUpdateTodo
  } = useTodoActions()
  
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)

  const handleStartEdit = useCallback((id: number) => {
    setEditingTodoId(id)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingTodoId(null)
  }, [])

  const handleSaveEdit = useCallback(async (id: number, title: string, description: string, future_score?: number, urgency_score?: number, start_time?: string, end_time?: string) => {
    await handleUpdateTodo(id, title, description, future_score, urgency_score, start_time, end_time)
    setEditingTodoId(null)
  }, [handleUpdateTodo])

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>暂无待办事项</p>
      </div>
    )
  }

  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItemComponent
          key={todo.id}
          todo={todo}
          isEditing={editingTodoId === todo.id}
          onToggleComplete={handleToggleComplete}
          onDelete={handleDeleteTodo}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onUpdate={handleSaveEdit}
        />
      ))}
    </div>
  )
}

export default React.memo(TodoList)

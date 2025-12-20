import React, { useState, useCallback } from 'react'
import { TodoSchema } from '../types/todo'
import TodoItemComponent from './TodoItem'

interface TodoListProps {
  todos: TodoSchema[]
  onToggleComplete: (id: number) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, title: string, description: string, future_score?: number, urgency_score?: number, start_time?: string, end_time?: string) => void
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleComplete,
  onDelete,
  onUpdate,
}) => {
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null)

  const handleStartEdit = useCallback((id: number) => {
    setEditingTodoId(id)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingTodoId(null)
  }, [])

  const handleSaveEdit = useCallback((id: number, title: string, description: string, future_score?: number, urgency_score?: number, start_time?: string, end_time?: string) => {
    onUpdate(id, title, description, future_score, urgency_score, start_time, end_time)
    setEditingTodoId(null)
  }, [onUpdate])

  if (todos.length === 0) {
    return (
      <div className="empty-state">
        <p>暂无待办事项</p>
      </div>
    )
  }

  // 使用useMemo缓存todo项的渲染，避免不必要的重新渲染
  return (
    <div className="todo-list">
      {todos.map((todo) => (
        <TodoItemComponent
          key={todo.id}
          todo={todo}
          isEditing={editingTodoId === todo.id}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onStartEdit={() => handleStartEdit(todo.id!)}
          onCancelEdit={handleCancelEdit}
          onUpdate={handleSaveEdit}
        />
      ))}
    </div>
  )
}

export default React.memo(TodoList)

import React from 'react'
import { TodoItem } from '../types/todo'
import TodoItemComponent from './TodoItem'

interface TodoListProps {
  todos: TodoItem[]
  onToggleComplete: (id: number) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, title: string, description: string, start_time?: string, end_time?: string) => void
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  onToggleComplete,
  onDelete,
  onUpdate,
}) => {
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
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  )
}

export default TodoList
import React from 'react'
import TodoForm from './TodoForm'
import TodoList from './TodoList'
import { TodoSchema, TodoFormData } from '../types/todo'

interface DashboardViewProps {
  loading: boolean
  todos: TodoSchema[]
  completedCount: number
  totalCount: number
  onAddTodo: (data: TodoFormData) => void
  onToggleComplete: (id: number) => void
  onDeleteTodo: (id: number) => void
  onUpdateTodo: (id: number, title: string, description: string, future_score?: number, urgency_score?: number, start_time?: string, end_time?: string) => void
}

const DashboardView: React.FC<DashboardViewProps> = ({
  loading,
  todos,
  completedCount,
  totalCount,
  onAddTodo,
  onToggleComplete,
  onDeleteTodo,
  onUpdateTodo
}) => {
  return (
    <div className="dashboard-grid">
      {/* Add Todo Card */}
      <div className="card add-todo-card">
        <h2>添加</h2>
        <TodoForm onSubmit={onAddTodo} />
      </div>

      {/* Todo List Card */}
      <div className="card list-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <h2>待办列表</h2>
          <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
            已完成 {completedCount} / 总计 {totalCount}
          </div>
        </div>

        {loading ? (
          <div className="loading-container">加载中...</div>
        ) : (
          <TodoList
            todos={todos}
            onToggleComplete={onToggleComplete}
            onDelete={onDeleteTodo}
            onUpdate={onUpdateTodo}
          />
        )}
      </div>
    </div>
  )
}

export default DashboardView

import React from 'react'
import TodoForm from './TodoForm'
import TodoList from './TodoList'
import { useTodoState, useTodoActions } from '../contexts/TodoContext'
import { useLoading } from '../contexts/LoadingContext'

const DashboardView: React.FC = () => {
  const {
    todos,
    completedCount,
    totalCount,
  } = useTodoState()
  
  const { handleAddTodo } = useTodoActions()
  
  const { isLoading: loading } = useLoading()

  return (
    <div className="dashboard-grid">
      {/* Add Todo Card */}
      <div className="card add-todo-card">
        <h2>添加</h2>
        <TodoForm onSubmit={handleAddTodo} />
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
          />
        )}
      </div>
    </div>
  )
}

export default React.memo(DashboardView)

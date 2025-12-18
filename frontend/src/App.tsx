import { useState, useEffect, useCallback, useMemo } from 'react'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import RecycleBin from './components/RecycleBin'
import { TodoSchema, TodoFormData } from './types/todo'
import { todoApi, recordToArray } from './services/api'
import './App.css'

function App() {
  const [todos, setTodos] = useState<TodoSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false)

  useEffect(() => {
    loadTodos()
  }, [])

  // 使用useCallback避免不必要的重新创建
  const loadTodos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await todoApi.getTodos()
      // 使用工具函数转换数据格式
      const todoArray = recordToArray(data)
      setTodos(todoArray)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载待办事项失败'
      setError(errorMessage)
      console.error('Error loading todos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleAddTodo = useCallback(async (data: TodoFormData) => {
    try {
      setError(null)
      const newTodo = await todoApi.createTodo({
        ...data,
        completed: false
      } as TodoSchema)
      // 使用函数式更新避免依赖todos状态
      setTodos(prevTodos => [...prevTodos, newTodo])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '添加待办事项失败'
      setError(errorMessage)
      console.error('Error adding todo:', err)
    }
  }, [])

  const handleToggleComplete = useCallback(async (id: number) => {
    try {
      const updatedTodo = await todoApi.toggleTodoStatus(id)
      // 使用函数式更新
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新状态失败'
      setError(errorMessage)
      console.error('Error toggling status:', err)
    }
  }, [])

  const handleDeleteTodo = useCallback(async (id: number) => {
    try {
      setError(null)
      await todoApi.deleteTodo(id)
      // 使用函数式更新
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除待办事项失败'
      setError(errorMessage)
      console.error('Error deleting todo:', err)
    }
  }, [])

  const handleUpdateTodo = useCallback(async (id: number, title: string, description: string, start_time?: string, end_time?: string) => {
    try {
      setError(null)
      const updatedTodo = await todoApi.updateTodo(id, {
        title,
        description,
        start_time,
        end_time
      })
      // 使用函数式更新
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新待办事项失败'
      setError(errorMessage)
      console.error('Error updating todo:', err)
    }
  }, [])

  // 使用useMemo优化计算性能
  const completedCount = useMemo(() =>
    todos.filter(todo => todo.completed).length,
    [todos]
  )
  
  const totalCount = useMemo(() => todos.length, [todos])

  const handleRestoreTodo = useCallback((todo: TodoSchema) => {
    setTodos(prevTodos => {
      const exists = prevTodos.some(t => t.id === todo.id)
      if (exists) {
        return prevTodos.map(t => (t.id === todo.id ? todo : t))
      }
      return [...prevTodos, todo]
    })
  }, [])

  // 空函数优化 - 使用useCallback避免重新创建
  const handlePermanentlyDelete = useCallback((_id: number) => {
    // 无需更新主列表，已在回收站组件中处理
  }, [])

  const handleClearBin = useCallback(() => {
    // 无需更新主列表，已在回收站组件中处理
  }, [])

  return (
    <div className="app">
      <header className="app-header">
        <h1>待办事项管理</h1>
        <div className="header-actions">
          <p className="stats">
            总计: {totalCount} | 已完成: {completedCount} | 待完成: {totalCount - completedCount}
          </p>
          <button 
            className="btn-recycle-bin" 
            onClick={() => setIsRecycleBinOpen(true)}
            title="打开回收站"
          >
            🗑️ 回收站
          </button>
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-message">
            {error}
            <button
              onClick={() => setError(null)}
              className="btn-close"
              aria-label="关闭错误消息"
            >
              ×
            </button>
          </div>
        )}

        <section className="add-todo-section">
          <h2>添加新的待办事项</h2>
          <TodoForm onSubmit={handleAddTodo} />
        </section>

        <section className="todo-list-section">
          <h2>待办事项列表</h2>
          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <TodoList
              todos={todos}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTodo}
              onUpdate={handleUpdateTodo}
            />
          )}
        </section>
      </main>
        
        <RecycleBin
          isOpen={isRecycleBinOpen}
          onClose={() => setIsRecycleBinOpen(false)}
          onRestore={handleRestoreTodo}
          onPermanentlyDelete={handlePermanentlyDelete}
          onClearBin={handleClearBin}
        />
      </div>
    )
  }

export default App

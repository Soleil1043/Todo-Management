import { useState, useEffect } from 'react'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import RecycleBin from './components/RecycleBin'
import { TodoItem, TodoFormData } from './types/todo'
import { todoApi } from './services/api'
import './App.css'

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false)

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      const data = await todoApi.getAllTodos()
      setTodos(data)
      setError(null)
    } catch (err) {
      setError('加载待办事项失败')
      console.error('Error loading todos:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTodo = async (data: TodoFormData) => {
    try {
      const newTodo = await todoApi.createTodo({
        ...data,
        completed: false
      } as TodoItem)
      setTodos([...todos, newTodo])
      setError(null)
    } catch (err) {
      setError('添加待办事项失败')
      console.error('Error adding todo:', err)
    }
  }

  const handleToggleComplete = async (id: number) => {
    try {
      const updatedTodo = await todoApi.toggleTodoStatus(id)
      setTodos(todos.map(todo => 
        todo.id === id ? { ...todo, completed: updatedTodo.completed } : todo
      ))
    } catch (err) {
      setError('更新状态失败')
      console.error('Error toggling status:', err)
    }
  }

  const handleDeleteTodo = async (id: number) => {
    try {
      await todoApi.deleteTodo(id)
      setTodos(todos.filter(todo => todo.id !== id))
      setError(null)
    } catch (err) {
      setError('删除待办事项失败')
      console.error('Error deleting todo:', err)
    }
  }

  const handleUpdateTodo = async (id: number, title: string, description: string, start_time?: string, end_time?: string) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, {
        title,
        description,
        start_time,
        end_time
      })
      setTodos(todos.map(todo => 
        todo.id === id ? updatedTodo : todo
      ))
      setError(null)
    } catch (err) {
      setError('更新待办事项失败')
      console.error('Error updating todo:', err)
    }
  }

  const completedCount = todos.filter(todo => todo.completed).length
  const totalCount = todos.length

  const handleRestoreTodo = (todo: TodoItem) => {
    setTodos([...todos, todo])
  }

  const handlePermanentlyDelete = (_id: number) => {
    // 无需更新主列表，已在回收站组件中处理
  }

  const handleClearBin = () => {
    // 无需更新主列表，已在回收站组件中处理
  }

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
            <button onClick={() => setError(null)} className="btn-close">×</button>
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
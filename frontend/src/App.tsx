import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import TodoForm from './components/TodoForm'
import TodoList from './components/TodoList'
import { TodoSchema, TodoFormData, PriorityType } from './types/todo'
import { todoApi, recordToArray, settingsApi } from './services/api'
import Icon from './components/Icon'
import ListToolbar, { FilterStatus, SortType } from './components/ListToolbar'
import { useToast } from './components/Toast'
import './App.css'

// 代码分割 - 懒加载组件
const RecycleBin = lazy(() => import('./components/RecycleBin'))
const AppearanceSettings = lazy(() => import('./components/AppearanceSettings'))

function App() {
  const [todos, setTodos] = useState<TodoSchema[]>([])
  const [loading, setLoading] = useState(true)
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  // List Toolbar State
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')
  const [sortBy, setSortBy] = useState<SortType>('updated')
  const [hideCompleted, setHideCompleted] = useState(false)

  const { showToast } = useToast()

  // 外观设置状态
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [bgOpacity, setBgOpacity] = useState(1)
  const [bgBlur, setBgBlur] = useState(0)

  useEffect(() => {
    loadTodos()
    
    // 初始化外观设置
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    }

    // 尝试加载壁纸
    const wallpaperUrl = settingsApi.getWallpaperUrl()
    const img = new Image()
    img.onload = () => {
      setBgImage(wallpaperUrl)
      document.body.style.setProperty('--bg-image', `url(${wallpaperUrl})`)
    }
    img.src = wallpaperUrl

    const savedOpacity = localStorage.getItem('bgOpacity')
    if (savedOpacity) {
      const opacity = parseFloat(savedOpacity)
      setBgOpacity(opacity)
      document.documentElement.style.setProperty('--surface-opacity', opacity.toString())
    }

    const savedBlur = localStorage.getItem('bgBlur')
    if (savedBlur) {
      const blur = parseInt(savedBlur)
      setBgBlur(blur)
      // 兼容旧数据：如果值很小（<20），可能是像素值，直接当作百分比也无妨
      // 100% = 20px
      const blurPx = (blur / 100) * 20
      document.documentElement.style.setProperty('--bg-blur', `${blurPx}px`)
    }
  }, [])

  // 外观设置处理函数
  const handleThemeChange = useCallback((newTheme: 'light' | 'dark') => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }, [])

  const handleBgImageChange = useCallback(() => {
    // 重新获取壁纸 URL（带时间戳以强制刷新）
    const url = settingsApi.getWallpaperUrl()
    
    // 检查是否真的有壁纸（可能是删除操作）
    const img = new Image()
    img.onload = () => {
      setBgImage(url)
      document.body.style.setProperty('--bg-image', `url(${url})`)
    }
    img.onerror = () => {
      setBgImage(null)
      document.body.style.removeProperty('--bg-image')
    }
    img.src = url
  }, [])

  const handleBgOpacityChange = useCallback((opacity: number) => {
    setBgOpacity(opacity)
    localStorage.setItem('bgOpacity', opacity.toString())
    document.documentElement.style.setProperty('--surface-opacity', opacity.toString())
  }, [])

  const handleBgBlurChange = useCallback((blur: number) => {
    setBgBlur(blur)
    localStorage.setItem('bgBlur', blur.toString())
    // 100% = 20px
    const blurPx = (blur / 100) * 20
    document.documentElement.style.setProperty('--bg-blur', `${blurPx}px`)
  }, [])

  // 使用useCallback避免不必要的重新创建
  const loadTodos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await todoApi.getTodos()
      // 使用工具函数转换数据格式
      const todoArray = recordToArray(data)
      setTodos(todoArray)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载待办事项失败'
      showToast(errorMessage, 'error')
      console.error('Error loading todos:', err)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  const handleAddTodo = useCallback(async (data: TodoFormData) => {
    try {
      const newTodo = await todoApi.createTodo({
        ...data,
        completed: false
      } as TodoSchema)
      // 使用函数式更新避免依赖todos状态
      setTodos(prevTodos => [...prevTodos, newTodo])
      showToast('添加成功', 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '添加待办事项失败'
      showToast(errorMessage, 'error')
      console.error('Error adding todo:', err)
    }
  }, [showToast])

  const handleToggleComplete = useCallback(async (id: number) => {
    // 乐观更新：先更新 UI
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )

    try {
      const updatedTodo = await todoApi.toggleTodoStatus(id)
      // API 成功后，使用服务器返回的最新数据确认更新（通常是一致的）
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      )
    } catch (err) {
      // 失败时回滚状态
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        )
      )
      
      const errorMessage = err instanceof Error ? err.message : '更新状态失败'
      showToast(errorMessage, 'error')
      console.error('Error toggling status:', err)
    }
  }, [showToast])

  const handleDeleteTodo = useCallback(async (id: number) => {
    try {
      await todoApi.deleteTodo(id)
      // 使用函数式更新
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id))
      showToast('已移动到回收站', 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除待办事项失败'
      showToast(errorMessage, 'error')
      console.error('Error deleting todo:', err)
    }
  }, [showToast])

  const handleUpdateTodo = useCallback(async (id: number, title: string, description: string, priority: PriorityType, start_time?: string, end_time?: string) => {
    try {
      const updatedTodo = await todoApi.updateTodo(id, {
        title,
        description,
        priority,
        start_time,
        end_time
      })
      // 使用函数式更新
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      )
      showToast('更新成功', 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '更新待办事项失败'
      showToast(errorMessage, 'error')
      console.error('Error updating todo:', err)
    }
  }, [showToast])

  // Filter and Sort Logic
  const filteredTodos = useMemo(() => {
    let result = [...todos]

    // Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      result = result.filter(
        todo => 
          todo.title.toLowerCase().includes(lowerTerm) || 
          (todo.description && todo.description.toLowerCase().includes(lowerTerm))
      )
    }

    // Status Filter
    if (statusFilter === 'active') {
      result = result.filter(todo => !todo.completed)
    } else if (statusFilter === 'completed') {
      result = result.filter(todo => todo.completed)
    }

    // Hide Completed (redundant with statusFilter but part of P0 req)
    if (hideCompleted && statusFilter === 'all') {
      result = result.filter(todo => !todo.completed)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityMap = { high: 3, medium: 2, low: 1 }
        return priorityMap[b.priority] - priorityMap[a.priority]
      }
      if (sortBy === 'time') {
        if (!a.start_time) return 1
        if (!b.start_time) return -1
        return a.start_time.localeCompare(b.start_time)
      }
      if (sortBy === 'updated') {
        // Fallback to ID for "updated/newest" as proxy
        return (b.id || 0) - (a.id || 0)
      }
      return 0
    })

    return result
  }, [todos, searchTerm, statusFilter, hideCompleted, sortBy])

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
      <div className="container">
        <header className="app-header">
          <div className="header-top">
            <h1 className="app-title">待办事项管理</h1>
            <p className="stats">
              总计: {totalCount} | 已完成: {completedCount} | 待完成: {totalCount - completedCount}
            </p>
          </div>
          <div className="header-actions">
            <button
              className="btn-recycle-bin"
              onClick={() => setIsSettingsOpen(true)}
              aria-haspopup="dialog"
              title="外观设置"
            >
              <Icon name="settings" size={20} />
            </button>
            <button
              className="btn-recycle-bin"
              onClick={() => setIsRecycleBinOpen(true)}
              aria-haspopup="dialog"
              title="回收站"
            >
              <Icon name="trash" size={20} />
            </button>
          </div>
        </header>

        <main className="app-main">
          <section className="add-todo-section">
            <h2>添加待办</h2>
            <TodoForm onSubmit={handleAddTodo} />
          </section>

          <section className="todo-list-section">
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>待办列表</h2>
            </div>
            
            <ListToolbar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
              hideCompleted={hideCompleted}
              onHideCompletedChange={setHideCompleted}
            />

            {loading ? (
              <div className="loading">加载中...</div>
            ) : (
              <TodoList
                todos={filteredTodos}
                onToggleComplete={handleToggleComplete}
                onDelete={handleDeleteTodo}
                onUpdate={handleUpdateTodo}
              />
            )}
          </section>
        </main>

        <Suspense fallback={<div className="loading">加载弹窗...</div>}>
          <RecycleBin
            isOpen={isRecycleBinOpen}
            onClose={() => setIsRecycleBinOpen(false)}
            onRestore={handleRestoreTodo}
            onPermanentlyDelete={handlePermanentlyDelete}
            onClearBin={handleClearBin}
          />
          <AppearanceSettings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            theme={theme}
            onThemeChange={handleThemeChange}
            bgImage={bgImage}
            onBgImageChange={handleBgImageChange}
            bgOpacity={bgOpacity}
            onBgOpacityChange={handleBgOpacityChange}
            bgBlur={bgBlur}
            onBgBlurChange={handleBgBlurChange}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default App

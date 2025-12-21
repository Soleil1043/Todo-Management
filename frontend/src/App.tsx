import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'

// Components
import Sidebar from './components/Sidebar'
import AppHeader from './components/AppHeader'
import DashboardView from './components/DashboardView'
import MatrixView from './components/MatrixView'

// Hooks
import { useTodoActions, useTodoState } from './contexts/TodoContext'
import { usePerformanceMonitoring, useMemoryMonitoring, useWebVitals } from './hooks/usePerformance'

// Styles
import './App.css'

// Lazy Components
const RecycleBin = lazy(() => import('./components/RecycleBin'))
const AppearanceSettings = lazy(() => import('./components/AppearanceSettings'))

/**
 * App 主入口组件
 * 负责协调全局状态、外观设置和布局渲染
 */
function App() {
  // UI 状态
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'quadrant'>('list')
  const [activeId, setActiveId] = useState<number | null>(null)

  // 核心业务逻辑 Context
  const {
    loadTodos,
  } = useTodoActions()

  // 性能监控
  usePerformanceMonitoring('App')
  useMemoryMonitoring('App')
  useWebVitals()

  // 初始加载
  useEffect(() => {
    loadTodos()
  }, [loadTodos])

  // 拖拽处理
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(Number(event.active.id))
  }, [])

  const handleDragEnd = useCallback((_event: DragEndEvent) => {
    setActiveId(null)
  }, [])

  const handleOpenRecycleBin = useCallback(() => setIsRecycleBinOpen(true), [])
  const handleCloseRecycleBin = useCallback(() => setIsRecycleBinOpen(false), [])
  const handleOpenSettings = useCallback(() => setIsSettingsOpen(true), [])
  const handleCloseSettings = useCallback(() => setIsSettingsOpen(false), [])

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="app-layout">
        <Sidebar 
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenRecycleBin={handleOpenRecycleBin}
          onOpenSettings={handleOpenSettings}
        />

        <main className="app-main">
          <AppHeader 
            title={viewMode === 'list' ? '经典' : '四象限'} 
            icon={viewMode === 'list' ? 'list' : 'grid'}
          />

          <div className="main-content-scroll">
            {viewMode === 'list' ? (
              <DashboardView />
            ) : (
              <MatrixView />
            )}
          </div>
        </main>

        <Suspense fallback={null}>
          <RecycleBin
            isOpen={isRecycleBinOpen}
            onClose={handleCloseRecycleBin}
          />
          <AppearanceSettings
            isOpen={isSettingsOpen}
            onClose={handleCloseSettings}
          />
        </Suspense>
      </div>

      <TodoDragOverlay activeId={activeId} />
    </DndContext>
  )
}

/**
 * 拖拽覆盖层组件
 * 独立出来以避免 App 组件因为 todos 变化而重新渲染
 */
const TodoDragOverlay = React.memo(({ activeId }: { activeId: number | null }) => {
  const { todos } = useTodoState()
  
  const content = useMemo(() => {
    if (!activeId) return null
    const activeTodo = todos.find(t => t.id === activeId)
    if (!activeTodo) return null
    
    return (
      <div className="draggable-item">
        {activeTodo.title}
      </div>
    )
  }, [activeId, todos])

  return <DragOverlay>{content}</DragOverlay>
})

export default App

import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core'

// Components
import Sidebar from './components/Sidebar'
import AppHeader from './components/AppHeader'
import DashboardView from './components/DashboardView'
import MatrixView from './components/MatrixView'

// Hooks
import { useAppTodos } from './hooks/useAppTodos'
import { useAppSettings } from './hooks/useAppSettings'
import { useLoading } from './contexts/LoadingContext'
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

  // 外观设置 Hook
  const {
    theme,
    bgImage,
    bgOpacity,
    bgBlur,
    spotlightType,
    autoTrash,
    handleThemeChange,
    handleBgImageChange,
    handleBgOpacityChange,
    handleBgBlurChange,
    handleSpotlightTypeChange,
    handleAutoTrashChange
  } = useAppSettings()
  
  // 核心业务逻辑 Hook
  const {
    todos,
    loadTodos,
    handleAddTodo,
    handleToggleComplete,
    handleDeleteTodo,
    handleUpdateTodo,
    handleUpdateTodoWithScores,
    handleRestoreTodo,
    completedCount,
    totalCount
  } = useAppTodos(autoTrash)

  // 其他全局 Context
  const { isLoading: loading } = useLoading()

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

  // 拖拽覆盖层内容缓存
  const dragOverlayContent = useMemo(() => {
    if (!activeId) return null
    const activeTodo = todos.find(t => t.id === activeId)
    if (!activeTodo) return null
    
    return (
      <div className="draggable-item">
        {activeTodo.title}
      </div>
    )
  }, [activeId, todos])

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="app-layout">
        <Sidebar 
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenRecycleBin={() => setIsRecycleBinOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        <main className="app-main">
          <AppHeader 
            title={viewMode === 'list' ? '经典' : '四象限'} 
            icon={viewMode === 'list' ? 'list' : 'grid'}
          />

          <div className="main-content-scroll">
            {viewMode === 'list' ? (
              <DashboardView
                loading={loading}
                todos={todos}
                completedCount={completedCount}
                totalCount={totalCount}
                onAddTodo={handleAddTodo}
                onToggleComplete={handleToggleComplete}
                onDeleteTodo={handleDeleteTodo}
                onUpdateTodo={handleUpdateTodo}
              />
            ) : (
              <MatrixView
                todos={todos}
                onUpdateTodo={handleUpdateTodoWithScores}
                onDeleteTodo={handleDeleteTodo}
                onToggleComplete={handleToggleComplete}
                spotlightType={spotlightType}
              />
            )}
          </div>
        </main>

        <Suspense fallback={null}>
          <RecycleBin
            isOpen={isRecycleBinOpen}
            onClose={() => setIsRecycleBinOpen(false)}
            onRestore={handleRestoreTodo}
            onPermanentlyDelete={() => {}} // 已在内部处理
            onClearBin={() => {}} // 已在内部处理
          />
          <AppearanceSettings
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            theme={theme}
            onThemeChange={handleThemeChange}
            bgImage={bgImage}
            onBgImageChange={() => handleBgImageChange(true)}
            bgOpacity={bgOpacity}
            onBgOpacityChange={handleBgOpacityChange}
            bgBlur={bgBlur}
            onBgBlurChange={handleBgBlurChange}
            spotlightType={spotlightType}
            onSpotlightTypeChange={handleSpotlightTypeChange}
            autoTrash={autoTrash}
            onAutoTrashChange={handleAutoTrashChange}
          />
        </Suspense>
      </div>

      <DragOverlay>
        {dragOverlayContent}
      </DragOverlay>
    </DndContext>
  )
}

export default App

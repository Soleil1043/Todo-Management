import React, { useState, useEffect, useCallback } from 'react'
import { TodoSchema } from '../types/todo'
import { todoApi, recordToArray } from '../services/api'

interface RecycleBinProps {
  isOpen: boolean
  onClose: () => void
  onRestore: (todo: TodoSchema) => void
  onPermanentlyDelete: (id: number) => void
  onClearBin: () => void
}

const RecycleBin: React.FC<RecycleBinProps> = ({
  isOpen,
  onClose,
  onRestore,
  onPermanentlyDelete,
  onClearBin,
}) => {
  const [recycledTodos, setRecycledTodos] = useState<TodoSchema[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadRecycleBin()
    }
  }, [isOpen])

  const loadRecycleBin = useCallback(async () => {
    try {
      setLoading(true)
      const data = await todoApi.getRecycleBin()
      // 使用工具函数转换数据格式
      const todoArray = recordToArray(data)
      setRecycledTodos(todoArray)
    } catch (error) {
      console.error('加载回收站失败:', error)
      // 可以添加用户友好的错误提示
    } finally {
      setLoading(false)
    }
  }, [])

  const handleRestore = useCallback(async (todo: TodoSchema) => {
    try {
      if (!todo.id) {
        console.error('待办事项ID不存在')
        return
      }
      
      await todoApi.restoreTodo(todo.id)
      // 使用函数式更新避免依赖recycledTodos状态
      setRecycledTodos(prev => prev.filter(t => t.id !== todo.id))
      onRestore(todo)
    } catch (error) {
      console.error('恢复失败:', error)
      // 可以添加用户友好的错误提示
    }
  }, [onRestore])

  const handlePermanentDelete = useCallback(async (id: number) => {
    if (window.confirm('确定要永久删除吗？此操作不可恢复！')) {
      try {
        await todoApi.permanentlyDeleteTodo(id)
        // 使用函数式更新
        setRecycledTodos(prev => prev.filter(t => t.id !== id))
        onPermanentlyDelete(id)
      } catch (error) {
        console.error('永久删除失败:', error)
        alert('永久删除失败，请重试')
      }
    }
  }, [onPermanentlyDelete])

  const handleClearBin = useCallback(async () => {
    if (window.confirm('确定要清空回收站吗？此操作不可恢复！')) {
      try {
        await todoApi.clearRecycleBin()
        setRecycledTodos([])
        onClearBin()
      } catch (error) {
        console.error('清空回收站失败:', error)
        alert('清空回收站失败，请重试')
      }
    }
  }, [onClearBin])

  const handleBatchRestore = useCallback(async () => {
    if (recycledTodos.length === 0) return
    
    if (window.confirm(`确定要恢复回收站中的 ${recycledTodos.length} 个待办事项吗？`)) {
      try {
        setLoading(true)
        // 过滤掉无效的ID
        const todoIds = recycledTodos
          .map(todo => todo.id)
          .filter((id): id is number => id !== undefined && id !== null)
        
        if (todoIds.length === 0) {
          alert('没有有效的待办事项可以恢复')
          return
        }
        
        const result = await todoApi.batchRestoreTodos(todoIds)
        
        // 清空回收站列表
        setRecycledTodos([])
        
        // 通知父组件恢复成功
        result.restored_todos.forEach(todo => {
          onRestore(todo)
        })
        
        console.log(`成功恢复了 ${result.restored_todos.length} 个待办事项`)
      } catch (error) {
        console.error('批量恢复失败:', error)
        alert('批量恢复失败，请重试')
      } finally {
        setLoading(false)
      }
    }
  }, [recycledTodos, onRestore])

  if (!isOpen) return null

  return (
    <div className="recycle-bin-modal">
      <div className="recycle-bin-content">
        <div className="recycle-bin-header">
          <h2>回收站</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="recycle-bin-actions">
          <button
            className="btn-restore-all"
            onClick={handleBatchRestore}
            disabled={recycledTodos.length === 0 || loading}
          >
            一键恢复全部
          </button>
          <button
            className="btn-clear"
            onClick={handleClearBin}
            disabled={recycledTodos.length === 0}
          >
            清空回收站
          </button>
        </div>

        <div className="recycle-bin-list">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : recycledTodos.length === 0 ? (
            <div className="empty-state">
              <p>回收站为空</p>
            </div>
          ) : (
            recycledTodos.map(todo => (
              <div key={todo.id} className="recycle-bin-item">
                <div className="item-content">
                  <h4>{todo.title}</h4>
                  {todo.description && <p>{todo.description}</p>}
                  <div className="item-meta">
                    <span className={`priority-badge priority-${todo.priority}`}>
                      {todo.priority === 'high' ? '高' :
                       todo.priority === 'medium' ? '中' : '低'}优先级
                    </span>
                    {(todo.start_time || todo.end_time) && (
                      <span className="time-info">
                        {todo.start_time && `开始: ${todo.start_time}`}
                        {todo.start_time && todo.end_time && ' | '}
                        {todo.end_time && `结束: ${todo.end_time}`}
                      </span>
                    )}
                  </div>
                </div>
                <div className="item-actions">
                  <button
                    className="btn-restore"
                    onClick={useCallback(() => handleRestore(todo), [handleRestore, todo])}
                    disabled={loading}
                  >
                    恢复
                  </button>
                  <button
                    className="btn-delete-permanent"
                    onClick={useCallback(() => handlePermanentDelete(todo.id!), [handlePermanentDelete, todo.id])}
                    disabled={loading}
                  >
                    永久删除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default RecycleBin
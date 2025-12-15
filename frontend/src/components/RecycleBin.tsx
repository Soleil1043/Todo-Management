import React, { useState, useEffect } from 'react'
import { TodoItem } from '../types/todo'
import { todoApi } from '../services/api'

interface RecycleBinProps {
  isOpen: boolean
  onClose: () => void
  onRestore: (todo: TodoItem) => void
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
  const [recycledTodos, setRecycledTodos] = useState<TodoItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadRecycleBin()
    }
  }, [isOpen])

  const loadRecycleBin = async () => {
    try {
      setLoading(true)
      const data = await todoApi.getRecycleBin()
      setRecycledTodos(data)
    } catch (error) {
      console.error('加载回收站失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRestore = async (todo: TodoItem) => {
    try {
      await todoApi.restoreTodo(todo.id!)
      setRecycledTodos(recycledTodos.filter(t => t.id !== todo.id))
      onRestore(todo)
    } catch (error) {
      console.error('恢复失败:', error)
    }
  }

  const handlePermanentDelete = async (id: number) => {
    if (window.confirm('确定要永久删除吗？此操作不可恢复！')) {
      try {
        await todoApi.permanentlyDeleteTodo(id)
        setRecycledTodos(recycledTodos.filter(t => t.id !== id))
        onPermanentlyDelete(id)
      } catch (error) {
        console.error('永久删除失败:', error)
      }
    }
  }

  const handleClearBin = async () => {
    if (window.confirm('确定要清空回收站吗？此操作不可恢复！')) {
      try {
        await todoApi.clearRecycleBin()
        setRecycledTodos([])
        onClearBin()
      } catch (error) {
        console.error('清空回收站失败:', error)
      }
    }
  }

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
                    <span className="priority-badge priority-{todo.priority}">
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
                    onClick={() => handleRestore(todo)}
                  >
                    恢复
                  </button>
                  <button 
                    className="btn-delete-permanent" 
                    onClick={() => handlePermanentDelete(todo.id!)}
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
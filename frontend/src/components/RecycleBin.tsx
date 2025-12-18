import React, { useState, useEffect, useCallback } from 'react'
import { TodoSchema } from '../types/todo'
import { todoApi, recordToArray } from '../services/api'
import Icon from './Icon'
import Modal from './Modal'
import { useToast } from './Toast'

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
  const [confirmAction, setConfirmAction] = useState<
    | null
    | { kind: 'permanentDelete'; id: number }
    | { kind: 'clearBin' }
    | { kind: 'batchRestore'; ids: number[]; count: number }
  >(null)
  
  const { showToast } = useToast()

  const loadRecycleBin = useCallback(async () => {
    try {
      setLoading(true)
      const data = await todoApi.getRecycleBin()
      const todoArray = recordToArray(data)
      setRecycledTodos(todoArray)
    } catch (error) {
      showToast('加载回收站失败，请稍后重试', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (isOpen) {
      loadRecycleBin()
    }
  }, [isOpen, loadRecycleBin])

  const handleRestore = useCallback(async (todo: TodoSchema) => {
    try {
      if (!todo.id) {
        showToast('待办事项ID不存在', 'error')
        return
      }
      
      await todoApi.restoreTodo(todo.id)
      setRecycledTodos(prev => prev.filter(t => t.id !== todo.id))
      onRestore(todo)
      showToast('已恢复待办事项', 'success')
    } catch (error) {
      showToast('恢复失败，请重试', 'error')
    }
  }, [onRestore, showToast])

  const requestPermanentDelete = useCallback((id: number) => {
    setConfirmAction({ kind: 'permanentDelete', id })
  }, [])

  const requestClearBin = useCallback(() => {
    setConfirmAction({ kind: 'clearBin' })
  }, [])

  const requestBatchRestore = useCallback(() => {
    if (recycledTodos.length === 0) return

    const ids = recycledTodos
      .map(todo => todo.id)
      .filter((id): id is number => id !== undefined && id !== null)

    if (ids.length === 0) {
      showToast('没有有效的待办事项可以恢复', 'info')
      return
    }

    setConfirmAction({ kind: 'batchRestore', ids, count: recycledTodos.length })
  }, [recycledTodos, showToast])

  const runConfirmAction = useCallback(async () => {
    if (!confirmAction) return
    try {
      setLoading(true)

      if (confirmAction.kind === 'permanentDelete') {
        await todoApi.permanentlyDeleteTodo(confirmAction.id)
        setRecycledTodos(prev => prev.filter(t => t.id !== confirmAction.id))
        onPermanentlyDelete(confirmAction.id)
        showToast('已永久删除', 'success')
      }

      if (confirmAction.kind === 'clearBin') {
        await todoApi.clearRecycleBin()
        setRecycledTodos([])
        onClearBin()
        showToast('回收站已清空', 'success')
      }

      if (confirmAction.kind === 'batchRestore') {
        const result = await todoApi.batchRestoreTodos(confirmAction.ids)
        setRecycledTodos([])
        result.restored_todos.forEach(todo => onRestore(todo))
        showToast(`已恢复 ${result.restored_todos.length} 个待办事项`, 'success')
      }

      setConfirmAction(null)
    } catch {
      showToast('操作失败，请重试', 'error')
      setConfirmAction(null)
    } finally {
      setLoading(false)
    }
  }, [confirmAction, onClearBin, onPermanentlyDelete, onRestore, showToast])

  const footer = (
    <>
      <button
        className="btn-restore-all"
        onClick={requestBatchRestore}
        disabled={recycledTodos.length === 0 || loading}
        type="button"
      >
        <Icon name="restore" size={16} />
        一键恢复
      </button>
      <button
        className="btn-clear"
        onClick={requestClearBin}
        disabled={recycledTodos.length === 0 || loading}
        type="button"
      >
        <Icon name="trash" size={16} />
        清空
      </button>
    </>
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="回收站"
        footer={footer}
        className="recycle-bin-modal"
      >
        <div className="recycle-bin-list">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : recycledTodos.length === 0 ? (
            <div className="empty-state">
              <p>回收站为空</p>
            </div>
          ) : (
            recycledTodos.map(todo => (
              <div key={todo.id} className="todo-item" style={{ marginBottom: 12 }}>
                <div className="todo-content">
                  <div className="todo-header">
                    <h4 className="todo-title">{todo.title}</h4>
                  </div>
                  {todo.description && <p className="todo-description">{todo.description}</p>}
                  <div className="todo-meta">
                    <div className="meta-item">
                        <Icon name="tag" size={14} />
                        <span className={`priority-badge priority-${todo.priority}`}>
                        {todo.priority === 'high' ? '高' :
                        todo.priority === 'medium' ? '中' : '低'}优先级
                        </span>
                    </div>
                    {(todo.start_time || todo.end_time) && (
                      <div className="meta-item">
                        <Icon name="clock" size={14} />
                        <span>
                            {todo.start_time && `${todo.start_time}`}
                            {todo.start_time && todo.end_time && ' - '}
                            {todo.end_time && `${todo.end_time}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="todo-actions">
                  <button
                    className="btn-restore"
                    onClick={() => handleRestore(todo)}
                    disabled={loading}
                    type="button"
                    title="恢复"
                  >
                    <Icon name="restore" size={18} />
                  </button>
                  <button
                    className="btn-delete-permanent"
                    onClick={() => requestPermanentDelete(todo.id!)}
                    disabled={loading}
                    type="button"
                    title="永久删除"
                  >
                    <Icon name="trash" size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Confirmation Modal */}
      {confirmAction && (
        <Modal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title="确认操作"
          maxWidth="400px"
          footer={
            <>
              <button className="btn-cancel" onClick={() => setConfirmAction(null)} type="button">
                取消
              </button>
              <button
                className={confirmAction.kind === 'batchRestore' ? 'btn-save' : 'btn-delete'}
                onClick={runConfirmAction}
                disabled={loading}
                type="button"
              >
                确认
              </button>
            </>
          }
        >
          <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 14 }}>
            {confirmAction.kind === 'permanentDelete'
              ? '确定要永久删除该待办吗？此操作不可恢复。'
              : confirmAction.kind === 'clearBin'
                ? '确定要清空回收站吗？此操作不可恢复。'
                : `确定要恢复回收站中的 ${confirmAction.count} 个待办吗？`}
          </p>
        </Modal>
      )}
    </>
  )
}

export default React.memo(RecycleBin)

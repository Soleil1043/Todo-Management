import React, { useState, useEffect, useCallback, useRef } from 'react'
import { TodoSchema } from '../types/todo'
import { todoApi, recordToArray } from '../services/api'
import Icon from './Icon'

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
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<
    | null
    | { kind: 'permanentDelete'; id: number }
    | { kind: 'clearBin' }
    | { kind: 'batchRestore'; ids: number[]; count: number }
  >(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  const loadRecycleBin = useCallback(async () => {
    try {
      setLoading(true)
      setActionError(null)
      const data = await todoApi.getRecycleBin()
      // 使用工具函数转换数据格式
      const todoArray = recordToArray(data)
      setRecycledTodos(todoArray)
    } catch (error) {
      setActionError('加载回收站失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadRecycleBin()
    }
  }, [isOpen, loadRecycleBin])

  const handleRestore = useCallback(async (todo: TodoSchema) => {
    try {
      if (!todo.id) {
        setActionError('待办事项ID不存在')
        return
      }
      
      await todoApi.restoreTodo(todo.id)
      // 使用函数式更新避免依赖recycledTodos状态
      setRecycledTodos(prev => prev.filter(t => t.id !== todo.id))
      onRestore(todo)
    } catch (error) {
      setActionError('恢复失败，请重试')
    }
  }, [onRestore])

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
      setActionError('没有有效的待办事项可以恢复')
      return
    }

    setConfirmAction({ kind: 'batchRestore', ids, count: recycledTodos.length })
  }, [recycledTodos])

  const runConfirmAction = useCallback(async () => {
    if (!confirmAction) return
    try {
      setLoading(true)
      setActionError(null)

      if (confirmAction.kind === 'permanentDelete') {
        await todoApi.permanentlyDeleteTodo(confirmAction.id)
        setRecycledTodos(prev => prev.filter(t => t.id !== confirmAction.id))
        onPermanentlyDelete(confirmAction.id)
      }

      if (confirmAction.kind === 'clearBin') {
        await todoApi.clearRecycleBin()
        setRecycledTodos([])
        onClearBin()
      }

      if (confirmAction.kind === 'batchRestore') {
        const result = await todoApi.batchRestoreTodos(confirmAction.ids)
        setRecycledTodos([])
        result.restored_todos.forEach(todo => onRestore(todo))
      }

      setConfirmAction(null)
    } catch {
      setActionError('操作失败，请重试')
      setConfirmAction(null)
    } finally {
      setLoading(false)
    }
  }, [confirmAction, onClearBin, onPermanentlyDelete, onRestore])

  useEffect(() => {
    if (!isOpen) return
    closeButtonRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-label="回收站"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2 className="modal-title">回收站</h2>
          <button
            ref={closeButtonRef}
            className="btn-close"
            onClick={onClose}
            aria-label="关闭回收站"
            type="button"
          >
            <Icon name="x" size={20} />
          </button>
        </header>

        <div className="modal-body">
          {actionError ? (
            <div className="form-error" role="alert" aria-live="polite">
              {actionError}
            </div>
          ) : null}

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
        </div>

        <footer className="modal-footer">
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
        </footer>

        {confirmAction ? (
          <div
            className="modal-overlay"
            role="presentation"
            onMouseDown={() => setConfirmAction(null)}
            style={{ zIndex: 1100 }}
          >
            <section
              className="modal-content"
              style={{ maxWidth: 400 }}
              role="dialog"
              aria-modal="true"
              aria-label="二次确认"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <header className="modal-header">
                <h2 className="modal-title">确认操作</h2>
                <button
                  className="btn-close"
                  onClick={() => setConfirmAction(null)}
                  aria-label="关闭确认弹窗"
                  type="button"
                >
                  <Icon name="x" size={20} />
                </button>
              </header>
              <div className="modal-body">
                <p style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: 14 }}>
                  {confirmAction.kind === 'permanentDelete'
                    ? '确定要永久删除该待办吗？此操作不可恢复。'
                    : confirmAction.kind === 'clearBin'
                      ? '确定要清空回收站吗？此操作不可恢复。'
                      : `确定要恢复回收站中的 ${confirmAction.count} 个待办吗？`}
                </p>
              </div>
              <footer className="modal-footer">
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
              </footer>
            </section>
          </div>
        ) : null}
      </section>
    </div>
  )
}

export default React.memo(RecycleBin)

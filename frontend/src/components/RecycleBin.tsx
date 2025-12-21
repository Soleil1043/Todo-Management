import React, { useState, useEffect, useCallback } from 'react'
import { TodoSchema } from '../types/todo'
import { todoApi, recordToArray } from '../services/api'
import Icon from './Icon'
import Modal from './Modal'
import { useToast } from './Toast'
import RecycledTodoItem from './RecycledTodoItem'
import { useLoading } from '../contexts/LoadingContext'
import { useTodoActions } from '../contexts/TodoContext'

interface RecycleBinProps {
  isOpen: boolean
  onClose: () => void
}

const RecycleBin: React.FC<RecycleBinProps> = ({
  isOpen,
  onClose,
}) => {
  const [recycledTodos, setRecycledTodos] = useState<TodoSchema[]>([])
  const { isLoading: loading, setLoading } = useLoading()
  const { handleRestoreTodo, handleBatchRestore } = useTodoActions()
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
      showToast('加载垃圾桶失败，请稍后重试', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast, setLoading])

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
      
      await handleRestoreTodo(todo.id)
      setRecycledTodos(prev => prev.filter(t => t.id !== todo.id))
    } catch (error) {
      // Error already handled by context/toast
    }
  }, [handleRestoreTodo, showToast])

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
        showToast('已永久删除', 'success')
      }

      if (confirmAction.kind === 'clearBin') {
        await todoApi.clearRecycleBin()
        setRecycledTodos([])
        showToast('垃圾桶已清空', 'success')
      }

      if (confirmAction.kind === 'batchRestore') {
        await handleBatchRestore(confirmAction.ids)
        setRecycledTodos([])
      }

      setConfirmAction(null)
    } catch {
      showToast('操作失败，请重试', 'error')
      setConfirmAction(null)
    } finally {
      setLoading(false)
    }
  }, [confirmAction, handleBatchRestore, setLoading, showToast])

  const footer = (
    <>
      <button
        className="btn-primary"
        onClick={requestBatchRestore}
        disabled={recycledTodos.length === 0 || loading}
        type="button"
      >
        <Icon name="restore" size={16} />
        一键恢复
      </button>
      <button
        className="btn-danger"
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
        title="垃圾桶"
        footer={footer}
        className="recycle-bin-modal"
      >
        <div className="recycle-bin-list">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : recycledTodos.length === 0 ? (
            <div className="empty-state">
              <p>垃圾桶为空</p>
            </div>
          ) : (
            recycledTodos.map(todo => (
              <RecycledTodoItem
                key={todo.id}
                todo={todo}
                loading={loading}
                onRestore={handleRestore}
                onPermanentDelete={requestPermanentDelete}
              />
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
                className={confirmAction.kind === 'batchRestore' ? 'btn-primary' : 'btn-danger'}
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

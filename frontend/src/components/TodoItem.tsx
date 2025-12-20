import React, { useState, useCallback, useMemo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { TodoSchema } from '../types/todo'
import TimeSelector from './TimeSelector'
import { useTimeValidation } from '../hooks/useTimeValidation'
import Icon from './Icon'

interface TodoItemProps {
  todo: TodoSchema
  isEditing: boolean
  onToggleComplete: (id: number) => void
  onDelete: (id: number) => void
  onStartEdit: () => void
  onCancelEdit: () => void
  onUpdate: (id: number, title: string, description: string, future_score?: number, urgency_score?: number, start_time?: string, end_time?: string) => void
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  isEditing,
  onToggleComplete,
  onDelete,
  onStartEdit,
  onCancelEdit,
  onUpdate,
}) => {
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [editFutureScore, setEditFutureScore] = useState<number | undefined>(todo.future_score)
  const [editUrgencyScore, setEditUrgencyScore] = useState<number | undefined>(todo.urgency_score)
  const [editStartTime, setEditStartTime] = useState(todo.start_time || '')
  const [editEndTime, setEditEndTime] = useState(todo.end_time || '')
  const { error: editError, setError: setEditError, validateTime } = useTimeValidation()

  // 拖拽功能 - 完全禁用拖拽监听器当处于编辑模式
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: todo.id!.toString(),
    data: { todo },
    disabled: isEditing // 编辑时禁用拖拽
  })

  // 阻止编辑模式下的所有拖拽事件
  const handleEditModeInteraction = useCallback((e: React.MouseEvent | React.PointerEvent) => {
    if (isEditing) {
      e.preventDefault()
      e.stopPropagation()
    }
  }, [isEditing])

  const dragStyle = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  // 当todo数据变化时更新编辑状态
  React.useEffect(() => {
    if (!isEditing) {
      setEditTitle(todo.title)
      setEditDescription(todo.description || '')
      setEditFutureScore(todo.future_score)
      setEditUrgencyScore(todo.urgency_score)
      setEditStartTime(todo.start_time || '')
      setEditEndTime(todo.end_time || '')
    }
  }, [todo, isEditing])

  const handleSave = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // 输入验证
    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle) {
      setEditError('标题不能为空')
      return
    }
    
    // 时间格式验证 - 使用自定义 Hook
    if (!validateTime(editStartTime, editEndTime)) {
      return
    }
    
    setEditError(null)
    
    // 确保分数值正确处理
    const futureScore = editFutureScore === undefined ? undefined : Number(editFutureScore)
    const urgencyScore = editUrgencyScore === undefined ? undefined : Number(editUrgencyScore)
    
    onUpdate(todo.id!, trimmedTitle, editDescription.trim(), futureScore, urgencyScore, editStartTime, editEndTime)
  }, [editTitle, editDescription, editFutureScore, editUrgencyScore, editStartTime, editEndTime, onUpdate, todo.id, validateTime, setEditError])

  const handleCancel = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setEditFutureScore(todo.future_score)
    setEditUrgencyScore(todo.urgency_score)
    setEditStartTime(todo.start_time || '')
    setEditEndTime(todo.end_time || '')
    setEditError(null)
    onCancelEdit()
  }, [todo, setEditError, onCancelEdit])

  // 使用useMemo缓存四象限分类 - 优化依赖项
  const quadrantInfo = useMemo(() => {
    const futureScore = todo.future_score
    const urgencyScore = todo.urgency_score
    
    if (futureScore === null || futureScore === undefined || 
        urgencyScore === null || urgencyScore === undefined) {
      return null;
    }
    
    if (futureScore > 0 && urgencyScore > 0) {
      return { class: 'priority-high', text: 'Q1-重要紧急' }
    } else if (futureScore > 0 && urgencyScore <= 0) {
      return { class: 'priority-medium', text: 'Q2-重要不紧急' }
    } else if (futureScore <= 0 && urgencyScore > 0) {
      return { class: 'priority-low', text: 'Q3-不重要紧急' }
    } else {
      return { class: 'priority-low', text: 'Q4-不重要不紧急' }
    }
  }, [todo.future_score, todo.urgency_score])

  // 优化：缓存时间显示格式
  const timeDisplay = useMemo(() => {
    const startTime = todo.start_time
    const endTime = todo.end_time
    
    if (!startTime && !endTime) return null
    
    const parts = []
    if (startTime) parts.push(startTime)
    if (startTime && endTime) parts.push(' - ')
    if (endTime) parts.push(endTime)
    
    return parts.join('')
  }, [todo.start_time, todo.end_time])


  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      {...listeners}
      {...attributes}
      className={`todo-item ${todo.completed ? 'completed' : ''} ${quadrantInfo?.class || ''} ${isDragging ? 'dragging' : ''} ${isEditing ? 'editing' : ''}`}
      onMouseDown={handleEditModeInteraction}
      onPointerDown={handleEditModeInteraction}
    >
      {isEditing ? (
        <div className="todo-edit" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          {editError ? (
            <div className="form-error" role="alert" aria-live="polite">
              {editError}
            </div>
          ) : null}
          <input
            type="text"
            value={editTitle}
            onChange={(e) => {
              setEditTitle(e.target.value)
              setEditError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave(e)
              if (e.key === 'Escape') handleCancel(e)
            }}
            className="edit-input"
            placeholder="标题"
            maxLength={100}
            aria-label="编辑标题"
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => {
              setEditDescription(e.target.value)
              setEditError(null)
            }}
            className="edit-textarea"
            placeholder="描述（可选）"
            rows={3}
            maxLength={500}
            aria-label="编辑描述"
          />
          <div className="form-row">
            <TimeSelector
              label="开始时间"
              value={editStartTime}
              onChange={(value) => {
                setEditStartTime(value)
                setEditError(null)
              }}
            />
            <TimeSelector
              label="结束时间"
              value={editEndTime}
              onChange={(value) => {
                setEditEndTime(value)
                setEditError(null)
              }}
            />
          </div>
          <div className="edit-actions">
            <button type="button" onClick={handleCancel} className="btn-cancel">
              取消
            </button>
            <button 
            type="button" 
            onClick={handleSave} 
            className="btn-save"
            disabled={isDragging}
          >
            保存
          </button>
          </div>
        </div>
      ) : (
        <>
          <div className="todo-checkbox-container" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onToggleComplete(todo.id!)
              }}
              className="todo-checkbox"
              aria-label={`${todo.completed ? '取消完成' : '标记完成'}：${todo.title}`}
            />
          </div>
          
          <div className="todo-content">
            <div className="todo-title">{todo.title}</div>
            
            {todo.description && (
              <p className="todo-description">{todo.description}</p>
            )}
            
            <div className="todo-meta">
              {timeDisplay && (
                <div className="meta-item">
                  <Icon name="clock" size={14} />
                  <span>{timeDisplay}</span>
                </div>
              )}
              {todo.completed && <span className="completed-badge">已完成</span>}
            </div>
          </div>

          <div className="todo-actions">
            <button 
              className="btn-edit" 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onStartEdit()
              }}
              title="编辑"
              disabled={isDragging}
            >
              <Icon name="edit" size={18} />
            </button>
            <button 
              className="btn-delete" 
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete(todo.id!)
              }}
              title="删除"
              disabled={isDragging}
            >
              <Icon name="trash" size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default React.memo(TodoItem)

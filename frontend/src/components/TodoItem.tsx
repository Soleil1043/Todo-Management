import React, { useState, useCallback, useMemo } from 'react'
import { TodoSchema, Priority, PriorityType } from '../types/todo'
import TimeSelector from './TimeSelector'
import { isValidTimeFormat } from '../services/api'
import Icon from './Icon'

interface TodoItemProps {
  todo: TodoSchema
  onToggleComplete: (id: number) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, title: string, description: string, priority: PriorityType, start_time?: string, end_time?: string) => void
}

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggleComplete,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [editPriority, setEditPriority] = useState<PriorityType>(todo.priority)
  const [editStartTime, setEditStartTime] = useState(todo.start_time || '')
  const [editEndTime, setEditEndTime] = useState(todo.end_time || '')
  const [editError, setEditError] = useState<string | null>(null)

  // 当todo数据变化时更新编辑状态
  React.useEffect(() => {
    if (!isEditing) {
      setEditTitle(todo.title)
      setEditDescription(todo.description || '')
      setEditPriority(todo.priority)
      setEditStartTime(todo.start_time || '')
      setEditEndTime(todo.end_time || '')
    }
  }, [todo, isEditing])

  const handleSave = useCallback(() => {
    // 输入验证
    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle) {
      setEditError('标题不能为空')
      return
    }
    
    // 时间格式验证 - 使用工具函数
    if (editStartTime && !isValidTimeFormat(editStartTime)) {
      setEditError('开始时间格式不正确，请使用 HH:MM 格式')
      return
    }
    if (editEndTime && !isValidTimeFormat(editEndTime)) {
      setEditError('结束时间格式不正确，请使用 HH:MM 格式')
      return
    }
    
    setEditError(null)
    onUpdate(todo.id!, trimmedTitle, editDescription.trim(), editPriority, editStartTime, editEndTime)
    setIsEditing(false)
  }, [editTitle, editDescription, editPriority, editStartTime, editEndTime, onUpdate, todo.id])

  const handleCancel = useCallback(() => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setEditPriority(todo.priority)
    setEditStartTime(todo.start_time || '')
    setEditEndTime(todo.end_time || '')
    setEditError(null)
    setIsEditing(false)
  }, [todo])

  // 使用useMemo缓存优先级类名计算
  const priorityClass = useMemo(() => {
    switch (todo.priority) {
      case 'high':
        return 'priority-high'
      case 'medium':
        return 'priority-medium'
      case 'low':
        return 'priority-low'
      default:
        return 'priority-medium'
    }
  }, [todo.priority])

  // 使用useMemo优化优先级文本计算
  const priorityText = useMemo(() => {
    switch (todo.priority) {
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return '中'
    }
  }, [todo.priority])

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''} ${priorityClass}`}>
      {isEditing ? (
        <div className="todo-edit">
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
            className="edit-input"
            placeholder="标题"
            maxLength={100}
            aria-label="编辑标题"
          />
          <textarea
            value={editDescription}
            onChange={(e) => {
              setEditDescription(e.target.value)
              setEditError(null)
            }}
            className="edit-textarea"
            placeholder="描述（可选）"
            rows={2}
            maxLength={500}
            aria-label="编辑描述"
          />
          <div className="edit-row">
            <div className="time-selector">
              <label className="form-label" htmlFor={`edit-priority-${todo.id}`}>
                优先级
              </label>
              <select
                id={`edit-priority-${todo.id}`}
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as PriorityType)}
                className="form-select"
              >
                <option value={Priority.HIGH}>高</option>
                <option value={Priority.MEDIUM}>中</option>
                <option value={Priority.LOW}>低</option>
              </select>
            </div>
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
            <button type="button" onClick={handleSave} className="btn-save">
              保存
            </button>
            <button type="button" onClick={handleCancel} className="btn-cancel">
              取消
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="todo-content">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => onToggleComplete(todo.id!)}
              className="todo-checkbox"
              aria-label={`${todo.completed ? '取消完成' : '标记完成'}：${todo.title}`}
            />
            <div className="todo-text">
              <h3 className={todo.completed ? 'completed-text' : ''}>{todo.title}</h3>
              {todo.description && (
                <p className={todo.completed ? 'completed-text' : ''}>{todo.description}</p>
              )}
              <div className="todo-meta">
                <span className={`priority-badge ${priorityClass}`}>
                  {priorityText}优先级
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
          </div>
          <div className="todo-actions">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn-edit"
              aria-label={`编辑待办事项: ${todo.title}`}
            >
              <Icon name="edit" />
              编辑
            </button>
            <button
              type="button"
              onClick={() => onDelete(todo.id!)}
              className="btn-delete"
              aria-label={`删除待办事项: ${todo.title}`}
            >
              <Icon name="delete" />
              删除
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default React.memo(TodoItem)

import React, { useState } from 'react'
import { TodoItem as TodoItemType, Priority } from '../types/todo'
import TimeSelector from './TimeSelector'

interface TodoItemProps {
  todo: TodoItemType
  onToggleComplete: (id: number) => void
  onDelete: (id: number) => void
  onUpdate: (id: number, title: string, description: string, start_time?: string, end_time?: string) => void
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
  const [editStartTime, setEditStartTime] = useState(todo.start_time || '')
  const [editEndTime, setEditEndTime] = useState(todo.end_time || '')

  // 当todo数据变化时更新编辑状态
  React.useEffect(() => {
    if (!isEditing) {
      setEditTitle(todo.title)
      setEditDescription(todo.description || '')
      setEditStartTime(todo.start_time || '')
      setEditEndTime(todo.end_time || '')
    }
  }, [todo, isEditing])

  const handleSave = () => {
    // 输入验证
    if (!editTitle.trim()) {
      alert('标题不能为空')
      return
    }
    
    // 时间格式验证
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (editStartTime && !timeRegex.test(editStartTime)) {
      alert('开始时间格式不正确，请使用 HH:MM 格式')
      return
    }
    if (editEndTime && !timeRegex.test(editEndTime)) {
      alert('结束时间格式不正确，请使用 HH:MM 格式')
      return
    }
    
    onUpdate(todo.id!, editTitle.trim(), editDescription.trim(), editStartTime, editEndTime)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setEditStartTime(todo.start_time || '')
    setEditEndTime(todo.end_time || '')
    setIsEditing(false)
  }

  const getPriorityClass = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return 'priority-high'
      case Priority.MEDIUM:
        return 'priority-medium'
      case Priority.LOW:
        return 'priority-low'
      default:
        return 'priority-medium'
    }
  }

  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      {isEditing ? (
        <div className="todo-edit">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="edit-input"
            placeholder="标题"
            maxLength={100}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="edit-textarea"
            placeholder="描述（可选）"
            rows={2}
            maxLength={500}
          />
          <div className="edit-row">
            <TimeSelector
              label="开始时间"
              value={editStartTime}
              onChange={setEditStartTime}
            />
            <TimeSelector
              label="结束时间"
              value={editEndTime}
            onChange={setEditEndTime}
            />
          </div>
          <div className="edit-actions">
            <button onClick={handleSave} className="btn-save">保存</button>
            <button onClick={handleCancel} className="btn-cancel">取消</button>
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
            />
            <div className="todo-text">
              <h3 className={todo.completed ? 'completed-text' : ''}>{todo.title}</h3>
              {todo.description && (
                <p className={todo.completed ? 'completed-text' : ''}>{todo.description}</p>
              )}
              <div className="todo-meta">
                <span className={`priority-badge ${getPriorityClass(todo.priority)}`}>
                  {todo.priority === Priority.HIGH ? '高' : 
                   todo.priority === Priority.MEDIUM ? '中' : '低'}优先级
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
            <button onClick={() => setIsEditing(true)} className="btn-edit">编辑</button>
            <button onClick={() => onDelete(todo.id!)} className="btn-delete">删除</button>
          </div>
        </>
      )}
    </div>
  )
}

export default TodoItem
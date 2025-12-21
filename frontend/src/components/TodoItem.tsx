import React, { useCallback, useMemo } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { TodoSchema } from '../types/todo'
import Icon from './Icon'
import TodoEditForm from './TodoEditForm'

interface TodoItemProps {
  todo: TodoSchema
  isEditing: boolean
  onToggleComplete: (id: number) => void
  onDelete: (id: number) => void
  onStartEdit: (id: number) => void
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

  const handleSave = useCallback((updatedTodo: TodoSchema) => {
    onUpdate(
      updatedTodo.id!,
      updatedTodo.title,
      updatedTodo.description || '',
      updatedTodo.future_score,
      updatedTodo.urgency_score,
      updatedTodo.start_time,
      updatedTodo.end_time
    )
  }, [onUpdate])

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
        <TodoEditForm
          todo={todo}
          onSave={handleSave}
          onCancel={onCancelEdit}
        />
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
              {quadrantInfo && (
                <div className={`meta-item ${quadrantInfo.class}`}>
                  <Icon name="tag" size={14} />
                  <span>{quadrantInfo.text}</span>
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
                onStartEdit(todo.id!)
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

import React, { useState, useCallback, useMemo, useRef } from 'react'
import { TodoFormData, Priority } from '../types/todo'
import TimeSelector from './TimeSelector'
import { isValidTimeFormat } from '../services/api'

interface TodoFormProps {
  onSubmit: (data: TodoFormData) => void
}

const TodoForm: React.FC<TodoFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<TodoFormData>({
    title: '',
    description: '',
    priority: Priority.MEDIUM,
    start_time: '',
    end_time: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const titleInputRef = useRef<HTMLInputElement | null>(null)

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    
    // 表单验证
    const trimmedTitle = formData.title.trim()
    if (!trimmedTitle) {
      setFormError('请输入待办事项标题')
      titleInputRef.current?.focus()
      return
    }
    
    if (trimmedTitle.length > 100) {
      setFormError('标题长度不能超过100个字符')
      titleInputRef.current?.focus()
      return
    }
    
    // 时间格式验证 - 使用工具函数
    if (formData.start_time && !isValidTimeFormat(formData.start_time)) {
      setFormError('开始时间格式不正确，请使用 HH:MM 格式')
      return
    }
    if (formData.end_time && !isValidTimeFormat(formData.end_time)) {
      setFormError('结束时间格式不正确，请使用 HH:MM 格式')
      return
    }
    
    // 提交数据
    setFormError(null)
    onSubmit({
      ...formData,
      title: trimmedTitle,
      description: formData.description?.trim()
    })
    
    // 重置表单
    setFormData({
      title: '',
      description: '',
      priority: Priority.MEDIUM,
      start_time: '',
      end_time: '',
    })
  }, [formData, onSubmit])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormError(null)
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  // 使用useMemo优化字符计数
  const descriptionLength = useMemo(() =>
    (formData.description || '').length,
    [formData.description]
  )

  return (
    <form onSubmit={handleSubmit} className="todo-form" noValidate>
      {formError ? (
        <div className="form-error" role="alert" aria-live="polite">
          {formError}
        </div>
      ) : null}
      <div className="form-group">
        <label className="sr-only" htmlFor="todo-title">
          待办标题
        </label>
        <input
          type="text"
          name="title"
          id="todo-title"
          ref={titleInputRef}
          value={formData.title}
          onChange={handleChange}
          placeholder="输入待办事项标题"
          className="form-input"
          required
          maxLength={100}
        />
      </div>
      
      <div className="form-group">
        <label className="sr-only" htmlFor="todo-description">
          待办描述
        </label>
        <textarea
          name="description"
          id="todo-description"
          value={formData.description}
          onChange={handleChange}
          placeholder="输入描述（可选）"
          className="form-textarea"
          rows={3}
          maxLength={500}
          aria-describedby="description-help"
        />
        <small id="description-help" className="char-count">{descriptionLength}/500</small>
      </div>
      
      <div className="form-group">
        <label htmlFor="priority" className="form-label">优先级：</label>
        <select
          name="priority"
          id="priority"
          value={formData.priority}
          onChange={handleChange}
          className="form-select"
        >
          <option value={Priority.HIGH}>高</option>
          <option value={Priority.MEDIUM}>中</option>
          <option value={Priority.LOW}>低</option>
        </select>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <TimeSelector
            label="开始时间"
            value={formData.start_time}
            onChange={useCallback((value: string) =>
              handleChange({ target: { name: 'start_time', value } } as any),
              [handleChange]
            )}
          />
        </div>
        <div className="form-group">
          <TimeSelector
            label="结束时间"
            value={formData.end_time}
            onChange={useCallback((value: string) =>
              handleChange({ target: { name: 'end_time', value } } as any),
              [handleChange]
            )}
          />
        </div>
      </div>
      
      <button
        type="submit"
        className="btn-submit"
        disabled={!formData.title.trim()}
      >
        添加待办事项
      </button>
    </form>
  )
}

export default TodoForm

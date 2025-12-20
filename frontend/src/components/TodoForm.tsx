import React, { useState, useCallback, useMemo, useRef } from 'react'
import { TodoFormData } from '../types/todo'
import TimeSelector from './TimeSelector'
import { useTimeValidation } from '../hooks/useTimeValidation'
import Icon from './Icon'

interface TodoFormProps {
  onSubmit: (data: Omit<TodoFormData, 'final_priority'>) => void
}

const TodoForm: React.FC<TodoFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Omit<TodoFormData, 'final_priority'>>({
    title: '',
    description: '',
    future_score: undefined,
    urgency_score: undefined,
    start_time: '',
    end_time: '',
  })
  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const { error: formError, setError: setFormError, validateTime } = useTimeValidation()

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
    
    // 时间格式验证 - 使用自定义 Hook
    if (!validateTime(formData.start_time || '', formData.end_time || '')) {
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
      future_score: undefined,
      urgency_score: undefined,
      start_time: '',
      end_time: '',
    })
  }, [formData, onSubmit, setFormError, validateTime])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormError(null)
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  // 数字输入处理函数 - 暂时不需要，因为表单已简化
  // const handleNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target
  //   const numValue = parseInt(value) || 0
  //   const clampedValue = Math.max(-3, Math.min(3, numValue))
  //   setFormError(null)
  //   setFormData(prev => ({
  //     ...prev,
  //     [name]: clampedValue
  //   }))
  // }, [])

  // 使用useMemo优化字符计数
  const descriptionLength = useMemo(() =>
    (formData.description || '').length,
    [formData.description]
  )

  return (
    <form onSubmit={handleSubmit} className="todo-form" noValidate>
      {formError ? (
        <div className="form-error" role="alert" aria-live="polite">
          <Icon name="info" size={16} />
          {formError}
        </div>
      ) : null}
      
      <div className="form-group">
        <label className="form-label" htmlFor="todo-title">
          标题 <span className="required">*</span>
        </label>
        <input
          type="text"
          name="title"
          id="todo-title"
          ref={titleInputRef}
          value={formData.title}
          onChange={handleChange}
          placeholder="准备做什么？"
          className="form-input"
          maxLength={100}
          required
          aria-required="true"
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="todo-description">
          描述
        </label>
        <textarea
          name="description"
          id="todo-description"
          value={formData.description}
          onChange={handleChange}
          placeholder="添加详细描述..."
          className="form-textarea"
          rows={3}
          maxLength={500}
        />
        <div className="char-count">
          {descriptionLength}/500
        </div>
      </div>

      <div className="form-row">
        <TimeSelector
          label="开始时间"
          value={formData.start_time}
          onChange={useCallback((val) => setFormData(prev => ({ ...prev, start_time: val })), [])}
        />
        <TimeSelector
          label="结束时间"
          value={formData.end_time}
          onChange={useCallback((val) => setFormData(prev => ({ ...prev, end_time: val })), [])}
        />
      </div>

      <button type="submit" className="btn-submit">
        <Icon name="plus" size={18} />
        添加任务
      </button>
    </form>
  )
}

export default React.memo(TodoForm)

import React, { useState } from 'react'
import { TodoFormData, Priority } from '../types/todo'
import TimeSelector from './TimeSelector'

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    
    onSubmit(formData)
    setFormData({
      title: '',
      description: '',
      priority: Priority.MEDIUM,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-group">
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="输入待办事项标题"
          className="form-input"
          required
        />
      </div>
      
      <div className="form-group">
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="输入描述（可选）"
          className="form-textarea"
          rows={3}
        />
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
            onChange={(value) => handleChange({ target: { name: 'start_time', value } } as any)}
          />
        </div>
        <div className="form-group">
          <TimeSelector
            label="结束时间"
            value={formData.end_time}
            onChange={(value) => handleChange({ target: { name: 'end_time', value } } as any)}
          />
        </div>
      </div>
      
      <button type="submit" className="btn-submit">
        添加待办事项
      </button>
    </form>
  )
}

export default TodoForm
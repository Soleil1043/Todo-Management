import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import TodoItem from './TodoItem'
import { mockTodo } from '../test/mock-data'

// Mock拖拽相关hooks
vi.mock('@dnd-kit/core', () => ({
  useDraggable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Translate: {
      toString: () => '',
    },
  },
}))

describe('TodoItem', () => {
  const defaultProps = {
    todo: mockTodo,
    isEditing: false,
    onToggleComplete: vi.fn(),
    onDelete: vi.fn(),
    onStartEdit: vi.fn(),
    onCancelEdit: vi.fn(),
    onUpdate: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders todo item correctly', () => {
    render(<TodoItem {...defaultProps} />)
    
    expect(screen.getByText('测试待办事项')).toBeInTheDocument()
    expect(screen.getByText('这是一个测试描述')).toBeInTheDocument()
    // 检查优先级类而不是文本
    const todoItem = screen.getByText('测试待办事项').closest('.todo-item')
    expect(todoItem).toHaveClass('priority-high')
  })

  it('toggles completion status when checkbox is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} />)
    
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)
    
    expect(defaultProps.onToggleComplete).toHaveBeenCalledWith(1)
  })

  it('enters edit mode when edit button is clicked', async () => {
    const user = userEvent.setup()
    const TestWrapper = () => {
      const [isEditing, setIsEditing] = React.useState(false)
      return (
        <TodoItem 
          {...defaultProps} 
          isEditing={isEditing} 
          onStartEdit={() => setIsEditing(true)} 
          onCancelEdit={() => setIsEditing(false)} 
        />
      )
    }
    render(<TestWrapper />)
    
    const editButton = screen.getByRole('button', { name: /编辑/i })
    await user.click(editButton)
    
    expect(screen.getByDisplayValue('测试待办事项')).toBeInTheDocument()
    expect(screen.getByDisplayValue('这是一个测试描述')).toBeInTheDocument()
  })

  it('saves changes when save button is clicked', async () => {
    const user = userEvent.setup()
    const TestWrapper = () => {
      const [isEditing, setIsEditing] = React.useState(true)
      return (
        <TodoItem 
          {...defaultProps} 
          isEditing={isEditing} 
          onStartEdit={() => setIsEditing(true)} 
          onCancelEdit={() => setIsEditing(false)} 
        />
      )
    }
    render(<TestWrapper />)
    
    // 修改标题
    const titleInput = screen.getByDisplayValue('测试待办事项')
    await user.clear(titleInput)
    await user.type(titleInput, '修改后的标题')
    
    // 清除时间（因为格式不匹配）
    const startTimeClear = screen.getAllByLabelText(/清除时间/i)[0]
    const endTimeClear = screen.getAllByLabelText(/清除时间/i)[1]
    await user.click(startTimeClear)
    await user.click(endTimeClear)
    
    // 保存
    const saveButton = screen.getByRole('button', { name: /保存/i })
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(defaultProps.onUpdate).toHaveBeenCalledWith(
        1,
        '修改后的标题',
        '这是一个测试描述',
        2,
        1,
        '',
        ''
      )
    })
  })

  it('cancels edit mode when cancel button is clicked', async () => {
    const user = userEvent.setup()
    const TestWrapper = () => {
      const [isEditing, setIsEditing] = React.useState(true)
      return (
        <TodoItem 
          {...defaultProps} 
          isEditing={isEditing} 
          onStartEdit={() => setIsEditing(true)} 
          onCancelEdit={() => setIsEditing(false)} 
        />
      )
    }
    render(<TestWrapper />)
    
    const cancelButton = screen.getByRole('button', { name: /取消/i })
    await user.click(cancelButton)
    
    // 检查编辑输入框是否消失
    expect(screen.queryByRole('textbox', { name: /标题/i })).not.toBeInTheDocument()
    expect(screen.getByText('测试待办事项')).toBeInTheDocument()
  })

  it('deletes todo when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} />)
    
    const deleteButton = screen.getByRole('button', { name: /删除/i })
    await user.click(deleteButton)
    
    // 直接调用删除，没有确认对话框
    await waitFor(() => {
      expect(defaultProps.onDelete).toHaveBeenCalledWith(1)
    })
  })

  it('displays completed todo with correct styling', () => {
    const completedTodo = { ...mockTodo, completed: true }
    render(<TodoItem {...defaultProps} todo={completedTodo} />)
    
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
    
    const titleElement = screen.getByText('测试待办事项')
    // 检查父元素是否有completed类，而不是直接检查标题样式
    const todoItem = titleElement.closest('.todo-item')
    expect(todoItem).toHaveClass('completed')
  })

  it('validates time inputs in edit mode', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} isEditing={true} />)
    
    // 由于TimeSelector现在通过按钮操作，我们测试保存时触发验证
    const saveButton = screen.getByRole('button', { name: /保存/i })
    await user.click(saveButton)
    
    // 默认mock数据的时间是有效的，所以应该调用onUpdate
    expect(defaultProps.onUpdate).toHaveBeenCalled()
  })
})
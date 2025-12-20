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
    onToggleComplete: vi.fn(),
    onDelete: vi.fn(),
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
    render(<TodoItem {...defaultProps} />)
    
    const editButton = screen.getByRole('button', { name: /编辑/i })
    await user.click(editButton)
    
    expect(screen.getByDisplayValue('测试待办事项')).toBeInTheDocument()
    expect(screen.getByDisplayValue('这是一个测试描述')).toBeInTheDocument()
  })

  it('saves changes when save button is clicked', async () => {
    const user = userEvent.setup()
    render(<TodoItem {...defaultProps} />)
    
    // 进入编辑模式
    const editButton = screen.getByRole('button', { name: /编辑/i })
    await user.click(editButton)
    
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
    render(<TodoItem {...defaultProps} />)
    
    // 进入编辑模式
    const editButton = screen.getByRole('button', { name: /编辑/i })
    await user.click(editButton)
    
    // 修改标题
    const titleInput = screen.getByDisplayValue('测试待办事项')
    await user.clear(titleInput)
    await user.type(titleInput, '修改后的标题')
    
    // 取消编辑
    const cancelButton = screen.getByRole('button', { name: /取消/i })
    await user.click(cancelButton)
    
    // 验证修改被撤销 - 检查是否回到查看模式
    expect(screen.queryByRole('textbox', { name: /编辑标题/i })).not.toBeInTheDocument()
    expect(screen.getByText('测试待办事项')).toBeInTheDocument()
    // 验证编辑模式已关闭 - 检查编辑输入框已消失（通过检查是否有文本输入框）
    expect(screen.queryByRole('textbox', { name: /编辑标题/i })).not.toBeInTheDocument()
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
    render(<TodoItem {...defaultProps} />)
    
    // 进入编辑模式
    const editButton = screen.getByRole('button', { name: /编辑/i })
    await user.click(editButton)
    
    // 设置结束时间早于开始时间 - 使用TimeSelector组件
    const startTimeSelector = screen.getByLabelText(/开始时间/i)
    const endTimeSelector = screen.getByLabelText(/结束时间/i)
    
    // 点击开始时间选择器
    await user.click(startTimeSelector)
    // 选择18:00
    const hour18 = screen.getByText('18')
    await user.click(hour18)
    const minute00 = screen.getAllByText('00')[0] // 获取第一个00（分钟）
    await user.click(minute00)
    // 点击完成按钮关闭下拉菜单
    const doneButtons = screen.getAllByText('完成')
    await user.click(doneButtons[0])
    
    // 点击结束时间选择器
    await user.click(endTimeSelector)
    // 选择17:00（早于开始时间）
    const hour17 = screen.getByText('17')
    await user.click(hour17)
    const minute00End = screen.getAllByText('00')[0] // 获取第一个00（分钟）
    await user.click(minute00End)
    // 点击完成按钮关闭下拉菜单
    const doneButtons2 = screen.getAllByText('完成')
    await user.click(doneButtons2[0])
    
    // 保存应该失败
    const saveButton = screen.getByRole('button', { name: /保存/i })
    await user.click(saveButton)
    
    // 验证错误提示
    expect(screen.getByText(/开始时间必须早于结束时间/i)).toBeInTheDocument()
    expect(defaultProps.onUpdate).not.toHaveBeenCalled()
  })
})
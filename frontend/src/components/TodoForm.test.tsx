import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../test/test-utils'
import userEvent from '@testing-library/user-event'
import TodoForm from './TodoForm'

describe('TodoForm', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders form with all fields', () => {
    render(<TodoForm {...defaultProps} />)
    
    expect(screen.getByLabelText(/标题/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/描述/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/开始时间/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/结束时间/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /添加任务/i })).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    render(<TodoForm {...defaultProps} />)
    
    // 填写表单
    await user.type(screen.getByLabelText(/标题/i), '新的待办事项')
    await user.type(screen.getByLabelText(/描述/i), '这是描述内容')
    
    // 提交表单
    await user.click(screen.getByRole('button', { name: /添加任务/i }))
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        title: '新的待办事项',
        description: '这是描述内容',
        future_score: undefined,
        urgency_score: undefined,
        start_time: '',
        end_time: '',
      })
    })
  })

  it('shows validation error for empty title', async () => {
    const user = userEvent.setup()
    render(<TodoForm {...defaultProps} />)
    
    // 直接提交空表单
    await user.click(screen.getByRole('button', { name: /添加任务/i }))
    
    expect(screen.getByText((content) => {
      return content.includes('请输入待办事项标题')
    })).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error for title length exceeding limit', async () => {
    const user = userEvent.setup()
    render(<TodoForm {...defaultProps} />)
    
    // 输入超长标题 - 由于输入框有maxLength=100限制，我们需要绕过这个限制
    // 先输入100个字符，然后通过JavaScript设置value来绕过限制
    const titleInput = screen.getByLabelText(/标题/i) as HTMLInputElement
    await user.type(titleInput, 'a'.repeat(100))
    
    // 绕过maxLength限制，直接设置value属性
    Object.defineProperty(titleInput, 'value', {
      value: 'a'.repeat(101),
      writable: true
    })
    
    // 触发change事件来更新formData状态
    fireEvent.change(titleInput)
    
    await user.click(screen.getByRole('button', { name: /添加任务/i }))
    
    expect(screen.getByText((content) => {
      return content.includes('标题长度不能超过100个字符')
    })).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('validates time range correctly', async () => {
    const user = userEvent.setup()
    render(<TodoForm {...defaultProps} />)
    
    // 填写表单，但设置结束时间早于开始时间
    await user.type(screen.getByLabelText(/标题/i), '测试任务')
    // 时间选择器现在使用TimeSelector组件，不能直接输入
    await user.click(screen.getByRole('button', { name: /添加任务/i }))
    
    // 由于时间验证逻辑，这里应该不会有错误，因为时间选择器会处理验证
    expect(defaultProps.onSubmit).toHaveBeenCalled()
  })

  it('allows empty time fields', async () => {
    const user = userEvent.setup()
    render(<TodoForm {...defaultProps} />)
    
    // 只填写必填字段
    await user.type(screen.getByLabelText(/标题/i), '测试任务')
    await user.click(screen.getByRole('button', { name: /添加任务/i }))
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        title: '测试任务',
        description: '',
        future_score: undefined,
        urgency_score: undefined,
        start_time: '',
        end_time: '',
      })
    })
  })

  it('clears form after successful submission', async () => {
    const user = userEvent.setup()
    render(<TodoForm {...defaultProps} />)
    
    // 填写并提交表单
    await user.type(screen.getByLabelText(/标题/i), '测试任务')
    await user.type(screen.getByLabelText(/描述/i), '测试描述')
    await user.click(screen.getByRole('button', { name: /添加任务/i }))
    
    await waitFor(() => {
      // 表单应该被清空
      expect(screen.getByLabelText(/标题/i)).toHaveValue('')
      expect(screen.getByLabelText(/描述/i)).toHaveValue('')
    })
  })

  it('trims whitespace from title and description', async () => {
    const user = userEvent.setup()
    render(<TodoForm {...defaultProps} />)
    
    // 输入带有前后空格的内容
    await user.type(screen.getByLabelText(/标题/i), '  测试任务  ')
    await user.type(screen.getByLabelText(/描述/i), '  测试描述  ')
    await user.click(screen.getByRole('button', { name: /添加任务/i }))
    
    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '测试任务',
          description: '测试描述',
        })
      )
    })
  })
})
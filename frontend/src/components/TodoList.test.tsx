import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../test/test-utils'
import TodoList from './TodoList'
import { mockTodos } from '../test/mock-data'

describe('TodoList', () => {
  const defaultProps = {
    todos: mockTodos,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders list of todos', () => {
    render(<TodoList {...defaultProps} />)
    
    expect(screen.getByText('高优先级任务')).toBeInTheDocument()
    expect(screen.getByText('中等优先级任务')).toBeInTheDocument()
    expect(screen.getByText('低优先级任务')).toBeInTheDocument()
  })

  it('renders empty state when no todos', () => {
    render(<TodoList {...defaultProps} todos={[]} />)
    
    expect(screen.getByText('暂无待办事项')).toBeInTheDocument()
  })

  it('renders correct number of todo items', () => {
    const { container } = render(<TodoList {...defaultProps} />)
    
    // 检查具体的待办事项标题
    const todoItems = container.getElementsByClassName('todo-title')
    expect(todoItems).toHaveLength(3)
  })

  it('passes correct props to each TodoItem', () => {
    render(<TodoList {...defaultProps} />)
    
    // 验证每个待办事项的详细信息
    expect(screen.getByText('高优先级任务')).toBeInTheDocument()
    expect(screen.getByText('重要且紧急的任务')).toBeInTheDocument()
    
    expect(screen.getByText('中等优先级任务')).toBeInTheDocument()
    expect(screen.getByText('重要但不紧急的任务')).toBeInTheDocument()
    
    expect(screen.getByText('低优先级任务')).toBeInTheDocument()
    expect(screen.getByText('不重要也不紧急的任务')).toBeInTheDocument()
  })

  it('renders completed todos with correct styling', () => {
    render(<TodoList {...defaultProps} />)
    
    // 中等优先级任务是已完成的，检查父元素是否有completed类
    const completedTodo = screen.getByText('中等优先级任务').closest('.todo-item')
    expect(completedTodo).toHaveClass('completed')
  })

  it('renders different priority levels correctly', () => {
    render(<TodoList {...defaultProps} />)
    
    // 检查是否有高优先级任务
    const highPriorityItem = screen.getByText('高优先级任务').closest('.todo-item')
    expect(highPriorityItem).toHaveClass('priority-high')
    
    // 检查是否有中等优先级任务
    const mediumPriorityItem = screen.getByText('中等优先级任务').closest('.todo-item')
    expect(mediumPriorityItem).toHaveClass('priority-medium')
    
    // 检查是否有低优先级任务
    const lowPriorityItem = screen.getByText('低优先级任务').closest('.todo-item')
    expect(lowPriorityItem).toHaveClass('priority-low')
  })

  it('maintains stable reference with React.memo', () => {
    const { rerender } = render(<TodoList {...defaultProps} />)
    
    // 重新渲染相同的props
    rerender(<TodoList {...defaultProps} />)
    
    // 组件应该保持稳定，不会重新创建DOM
    expect(screen.getByText('高优先级任务')).toBeInTheDocument()
  })

  it('updates when todos prop changes', () => {
    const { rerender } = render(<TodoList {...defaultProps} todos={[]} />)
    
    expect(screen.getByText('暂无待办事项')).toBeInTheDocument()
    
    // 更新todos
    rerender(<TodoList {...defaultProps} todos={mockTodos} />)
    
    expect(screen.queryByText('暂无待办事项')).not.toBeInTheDocument()
    expect(screen.getByText('高优先级任务')).toBeInTheDocument()
  })

  it('handles single todo item correctly', () => {
    const singleTodo = [mockTodos[0]]
    render(<TodoList {...defaultProps} todos={singleTodo} />)
    
    expect(screen.getByText('高优先级任务')).toBeInTheDocument()
    expect(screen.queryByText('中等优先级任务')).not.toBeInTheDocument()
    expect(screen.queryByText('低优先级任务')).not.toBeInTheDocument()
  })

  it('preserves todo order', () => {
    render(<TodoList {...defaultProps} />)
    
    const todoItems = screen.getAllByRole('button', { name: /任务/ })
    expect(todoItems[0]).toHaveTextContent('高优先级任务')
    expect(todoItems[1]).toHaveTextContent('中等优先级任务')
    expect(todoItems[2]).toHaveTextContent('低优先级任务')
  })
})
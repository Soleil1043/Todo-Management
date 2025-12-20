import { TodoSchema } from '../types/todo'

export const mockTodo: TodoSchema = {
  id: 1,
  title: '测试待办事项',
  description: '这是一个测试描述',
  completed: false,
  future_score: 2,
  urgency_score: 1,
  final_priority: 3,
  start_time: '09:00',
  end_time: '17:00',
  created_at: '2024-01-01T08:00:00Z',
  updated_at: '2024-01-01T08:00:00Z'
}

export const mockTodos: TodoSchema[] = [
  {
    id: 1,
    title: '高优先级任务',
    description: '重要且紧急的任务',
    completed: false,
    future_score: 2,
    urgency_score: 2,
    final_priority: 4,
    start_time: '09:00',
    end_time: '17:00',
    created_at: '2024-01-01T08:00:00Z',
    updated_at: '2024-01-01T08:00:00Z'
  },
  {
    id: 2,
    title: '中等优先级任务',
    description: '重要但不紧急的任务',
    completed: true,
    future_score: 2,
    urgency_score: -1,
    final_priority: 1,
    start_time: '09:00',
    end_time: '17:00',
    created_at: '2024-01-02T08:00:00Z',
    updated_at: '2024-01-02T08:00:00Z'
  },
  {
    id: 3,
    title: '低优先级任务',
    description: '不重要也不紧急的任务',
    completed: false,
    future_score: -2,
    urgency_score: -2,
    final_priority: -4,
    start_time: '09:00',
    end_time: '17:00',
    created_at: '2024-01-03T08:00:00Z',
    updated_at: '2024-01-03T08:00:00Z'
  }
]

export const mockApiResponse = {
  success: { message: '操作成功' },
  error: { message: '操作失败' },
  notFound: { message: '未找到资源' }
}

export const mockFormData = {
  title: '新的待办事项',
  description: '新的描述',
  start_time: '2024-01-15T09:00:00Z',
  end_time: '2024-01-15T17:00:00Z',
  future_score: 1,
  urgency_score: 0
}
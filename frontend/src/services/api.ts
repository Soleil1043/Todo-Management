import axios, { AxiosError } from 'axios'
import { TodoItem, TodoFormData } from '../types/todo'

const API_BASE_URL = '/api/v2.0.0'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超时
})

// 错误处理拦截器
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response) {
      // 服务器响应错误
      console.error('API错误:', error.response.status, error.response.data)
      const errorData = error.response.data as { detail?: string }
      throw new Error(`请求失败: ${error.response.status} - ${errorData?.detail || '未知错误'}`)
    } else if (error.request) {
      // 请求发送失败
      console.error('网络错误:', error.request)
      throw new Error('网络连接失败，请检查网络设置')
    } else {
      // 其他错误
      console.error('请求配置错误:', error.message)
      throw new Error('请求配置错误')
    }
  }
)

export const todoApi = {
  getAllTodos: async (): Promise<TodoItem[]> => {
    try {
      const response = await api.get('/todos')
      // 后端返回的是对象格式 {id: todo}，需要转换为数组
      const data = response.data
      if (Array.isArray(data)) {
        return data
      } else {
        return Object.values(data)
      }
    } catch (error) {
      console.error('获取待办事项列表失败:', error)
      throw error
    }
  },

  createTodo: async (todo: TodoFormData): Promise<TodoItem> => {
    try {
      const response = await api.post('/todos', todo)
      return response.data
    } catch (error) {
      console.error('创建待办事项失败:', error)
      throw error
    }
  },

  toggleTodoStatus: async (id: number): Promise<TodoItem> => {
    try {
      const response = await api.patch(`/todos/${id}/toggle`)
      return response.data
    } catch (error) {
      console.error('切换待办事项状态失败:', error)
      throw error
    }
  },

  getRecycleBin: async (): Promise<TodoItem[]> => {
    try {
      const response = await api.get('/recycle-bin')
      // 后端返回的是对象格式 {id: todo}，需要转换为数组
      const data = response.data
      if (Array.isArray(data)) {
        return data
      } else {
        return Object.values(data)
      }
    } catch (error) {
      console.error('获取回收站失败:', error)
      throw error
    }
  },

  restoreTodo: async (id: number): Promise<TodoItem> => {
    try {
      const response = await api.post(`/recycle-bin/${id}/restore`)
      return response.data
    } catch (error) {
      console.error('恢复待办事项失败:', error)
      throw error
    }
  },

  permanentlyDeleteTodo: async (id: number): Promise<void> => {
    try {
      await api.delete(`/recycle-bin/${id}`)
    } catch (error) {
      console.error('永久删除待办事项失败:', error)
      throw error
    }
  },

  clearRecycleBin: async (): Promise<void> => {
    try {
      await api.delete('/recycle-bin')
    } catch (error) {
      console.error('清空回收站失败:', error)
      throw error
    }
  },

  updateTodo: async (id: number, todo: Partial<TodoItem>): Promise<TodoItem> => {
    try {
      const response = await api.patch(`/todos/${id}`, todo)
      return response.data
    } catch (error) {
      console.error('更新待办事项失败:', error)
      throw error
    }
  },

  deleteTodo: async (id: number): Promise<void> => {
    try {
      await api.delete(`/todos/${id}`)
    } catch (error) {
      console.error('删除待办事项失败:', error)
      throw error
    }
  },
}

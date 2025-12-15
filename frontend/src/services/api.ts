import axios from 'axios'
import { TodoItem, TodoFormData } from '../types/todo'

const API_BASE_URL = '/api/v2.0.0'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const todoApi = {
  getAllTodos: async (): Promise<TodoItem[]> => {
    const response = await api.get('/todos')
    // 后端返回的是对象格式 {id: todo}，需要转换为数组
    const data = response.data
    if (Array.isArray(data)) {
      return data
    } else {
      return Object.values(data)
    }
  },

  createTodo: async (todo: TodoFormData): Promise<TodoItem> => {
    const response = await api.post('/todos', todo)
    return response.data
  },

  toggleTodoStatus: async (id: number): Promise<TodoItem> => {
    const response = await api.patch(`/todos/${id}/toggle`)
    return response.data
  },

  getRecycleBin: async (): Promise<TodoItem[]> => {
    const response = await api.get('/recycle-bin')
    // 后端返回的是对象格式 {id: todo}，需要转换为数组
    const data = response.data
    if (Array.isArray(data)) {
      return data
    } else {
      return Object.values(data)
    }
  },

  restoreTodo: async (id: number): Promise<TodoItem> => {
    const response = await api.post(`/recycle-bin/${id}/restore`)
    return response.data
  },

  permanentlyDeleteTodo: async (id: number): Promise<void> => {
    await api.delete(`/recycle-bin/${id}`)
  },

  clearRecycleBin: async (): Promise<void> => {
    await api.delete('/recycle-bin')
  },

  updateTodo: async (id: number, todo: Partial<TodoItem>): Promise<TodoItem> => {
    const response = await api.patch(`/todos/${id}`, todo)
    return response.data
  },

  deleteTodo: async (id: number): Promise<void> => {
    await api.delete(`/todos/${id}`)
  },
}

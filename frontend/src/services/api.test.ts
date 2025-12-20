import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { todoApi, healthApi, settingsApi, recordToArray } from '../services/api'
import { mockTodos } from '../test/mock-data'
import axiosInstance from 'axios'

// Mock axios
vi.mock('axios', () => {
  const mockAxios = {
    create: vi.fn(() => mockAxios),
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  }
  return { default: mockAxios }
})

const mockedAxios = axiosInstance as any

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('todoApi', () => {
    it('getTodos returns record of todos', async () => {
      const mockRecord = { 1: mockTodos[0] }
      mockedAxios.get.mockResolvedValue({ data: mockRecord })

      const result = await todoApi.getTodos()
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/todos')
      expect(result).toEqual(mockRecord)
    })

    it('createTodo creates new todo', async () => {
      const newTodoData = {
        title: '新任务',
        description: '新描述',
        completed: false,
        future_score: 2,
        urgency_score: 1
      }
      const mockResponse = { data: { ...newTodoData, id: 4 } }
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await todoApi.createTodo(newTodoData)
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/todos', newTodoData)
      expect(result).toEqual(mockResponse.data)
    })

    it('updateTodo updates existing todo', async () => {
      const updateData = { title: '更新后的标题' }
      const mockResponse = { data: { ...mockTodos[0], ...updateData } }
      mockedAxios.patch.mockResolvedValue(mockResponse)

      const result = await todoApi.updateTodo(1, updateData)
      
      expect(mockedAxios.patch).toHaveBeenCalledWith('/todos/1', updateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('deleteTodo removes todo', async () => {
      const mockResponse = { data: { message: '删除成功' } }
      mockedAxios.delete.mockResolvedValue(mockResponse)

      const result = await todoApi.deleteTodo(1)
      
      expect(mockedAxios.delete).toHaveBeenCalledWith('/todos/1')
      expect(result).toEqual(mockResponse.data)
    })

    it('toggleTodoStatus toggles completion status', async () => {
      const mockResponse = { data: { ...mockTodos[0], completed: !mockTodos[0].completed } }
      mockedAxios.patch.mockResolvedValue(mockResponse)

      const result = await todoApi.toggleTodoStatus(1)
      
      expect(mockedAxios.patch).toHaveBeenCalledWith('/todos/1/toggle')
      expect(result).toEqual(mockResponse.data)
    })

    it('getRecycleBin returns recycled todos', async () => {
      const recycledTodos = mockTodos.filter(todo => todo.completed)
      const mockResponse = { data: recycledTodos }
      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await todoApi.getRecycleBin()
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/recycle-bin')
      expect(result).toEqual(recycledTodos)
    })

    it('restoreTodo restores from recycle bin', async () => {
      const mockResponse = { data: { ...mockTodos[0] } }
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await todoApi.restoreTodo(1)
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/recycle-bin/1/restore')
      expect(result).toEqual(mockResponse.data)
    })

    it('batchRestoreTodos restores multiple todos', async () => {
      const ids = [1, 2, 3]
      const mockResponse = { data: { message: '批量恢复成功', restored_todos: mockTodos } }
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await todoApi.batchRestoreTodos(ids)
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/recycle-bin/batch-restore', { todo_ids: ids })
      expect(result).toEqual(mockResponse.data)
    })

    it('permanentlyDeleteTodo permanently deletes', async () => {
      const mockResponse = { data: { message: '永久删除成功' } }
      mockedAxios.delete.mockResolvedValue(mockResponse)

      const result = await todoApi.permanentlyDeleteTodo(1)
      
      expect(mockedAxios.delete).toHaveBeenCalledWith('/recycle-bin/1')
      expect(result).toEqual(mockResponse.data)
    })

    it('clearRecycleBin clears all recycled todos', async () => {
      const mockResponse = { data: { message: '清空成功' } }
      mockedAxios.delete.mockResolvedValue(mockResponse)

      const result = await todoApi.clearRecycleBin()
      
      expect(mockedAxios.delete).toHaveBeenCalledWith('/recycle-bin')
      expect(result).toEqual(mockResponse.data)
    })

    it('getStats returns statistics', async () => {
      const mockStats = { total_count: 10, completed_count: 5, active_count: 5, recycled_count: 2 }
      mockedAxios.get.mockResolvedValue({ data: mockStats })

      const result = await todoApi.getStats()
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/stats')
      expect(result).toEqual(mockStats)
    })
  })

  describe('healthApi', () => {
    it('checkHealth returns health status', async () => {
      const mockResponse = { data: { status: 'healthy', service: 'todo-service' } }
      mockedAxios.get.mockResolvedValue(mockResponse)

      const result = await healthApi.checkHealth()
      
      expect(mockedAxios.get).toHaveBeenCalledWith('/health')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('settingsApi', () => {
    it('uploadWallpaper uploads a file', async () => {
      const file = new File([''], 'test.png', { type: 'image/png' })
      const mockResponse = { data: { message: '上传成功' } }
      mockedAxios.post.mockResolvedValue(mockResponse)

      const result = await settingsApi.uploadWallpaper(file)
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/settings/wallpaper', expect.any(FormData), expect.any(Object))
      expect(result).toEqual(mockResponse.data)
    })

    it('getWallpaperUrl returns the correct URL', () => {
      const url = settingsApi.getWallpaperUrl()
      expect(url).toContain('/settings/wallpaper')
    })

    it('deleteWallpaper removes wallpaper', async () => {
      const mockResponse = { data: { message: '删除成功' } }
      mockedAxios.delete.mockResolvedValue(mockResponse)

      const result = await settingsApi.deleteWallpaper()
      
      expect(mockedAxios.delete).toHaveBeenCalledWith('/settings/wallpaper')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('recordToArray', () => {
    it('converts record to array', () => {
      const record = {
        1: { id: 1, title: 'Item 1' },
        2: { id: 2, title: 'Item 2' },
      }

      const result = recordToArray(record as any)
      
      expect(result).toEqual([
        { id: 1, title: 'Item 1' },
        { id: 2, title: 'Item 2' },
      ])
    })
  })

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'))

      await expect(todoApi.getTodos()).rejects.toThrow('获取待办事项失败，请稍后重试')
    })
  })
})

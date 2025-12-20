import axios, { AxiosInstance, AxiosError } from 'axios';
import { TodoSchema, TodoStats } from '../types/todo';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// 创建API实例
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 添加超时设置
});

const healthClient: AxiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// 添加响应拦截器进行统一错误处理
api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response) {
      // 服务器响应错误
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      // 请求发送失败
      console.error('Network Error: 无法连接到服务器');
    } else {
      // 其他错误
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// 待办事项相关 API

export const todoApi = {
  // 获取所有待办事项
  getTodos: async (): Promise<Record<number, TodoSchema>> => {
    try {
      const response = await api.get<Record<number, TodoSchema>>('/todos');
      return response.data;
    } catch (error) {
      console.error('获取待办事项失败:', error);
      throw new Error('获取待办事项失败，请稍后重试');
    }
  },

  // 创建新的待办事项
  createTodo: async (todo: Omit<TodoSchema, 'id'>): Promise<TodoSchema> => {
    try {
      // 数据验证
      if (!todo.title?.trim()) {
        throw new Error('待办事项标题不能为空');
      }
      if (todo.title.length > 100) {
        throw new Error('标题长度不能超过100个字符');
      }
      
      const response = await api.post<TodoSchema>('/todos', todo);
      return response.data;
    } catch (error) {
      console.error('创建待办事项失败:', error);
      throw new Error('创建待办事项失败，请检查输入数据');
    }
  },

  // 更新待办事项
  updateTodo: async (id: number, todo: Partial<Omit<TodoSchema, 'id'>> & { operation_source?: string }): Promise<TodoSchema> => {
    try {
      // 数据验证
      if (todo.title !== undefined) {
        if (!todo.title.trim()) {
          throw new Error('待办事项标题不能为空');
        }
        if (todo.title.length > 100) {
          throw new Error('标题长度不能超过100个字符');
        }
      }
      
      const response = await api.patch<TodoSchema>(`/todos/${id}`, todo);
      return response.data;
    } catch (error) {
      console.error('更新待办事项失败:', error);
      throw new Error('更新待办事项失败，请检查输入数据');
    }
  },

  // 切换待办事项完成状态
  toggleTodoStatus: async (id: number): Promise<TodoSchema> => {
    try {
      const response = await api.patch<TodoSchema>(`/todos/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('切换状态失败:', error);
      throw new Error('切换待办事项状态失败');
    }
  },

  // 删除待办事项（移动到回收站）
  deleteTodo: async (id: number): Promise<{ message: string; todo: TodoSchema }> => {
    try {
      const response = await api.delete<{ message: string; todo: TodoSchema }>(`/todos/${id}`);
      return response.data;
    } catch (error) {
      console.error('删除待办事项失败:', error);
      throw new Error('删除待办事项失败');
    }
  },

  // 获取回收站中的待办事项
  getRecycleBin: async (): Promise<Record<number, TodoSchema>> => {
    try {
      const response = await api.get<Record<number, TodoSchema>>('/recycle-bin');
      return response.data;
    } catch (error) {
      console.error('获取回收站失败:', error);
      throw new Error('获取回收站失败');
    }
  },

  // 从回收站恢复待办事项
  restoreTodo: async (id: number): Promise<TodoSchema> => {
    try {
      const response = await api.post<TodoSchema>(`/recycle-bin/${id}/restore`);
      return response.data;
    } catch (error) {
      console.error('恢复待办事项失败:', error);
      throw new Error('恢复待办事项失败');
    }
  },

  // 永久删除回收站中的待办事项
  permanentlyDeleteTodo: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(`/recycle-bin/${id}`);
      return response.data;
    } catch (error) {
      console.error('永久删除失败:', error);
      throw new Error('永久删除待办事项失败');
    }
  },

  // 清空回收站
  clearRecycleBin: async (): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>('/recycle-bin');
      return response.data;
    } catch (error) {
      console.error('清空回收站失败:', error);
      throw new Error('清空回收站失败');
    }
  },

  // 批量恢复回收站中的待办事项
  batchRestoreTodos: async (todoIds: number[]): Promise<{ message: string; restored_todos: TodoSchema[] }> => {
    try {
      if (!todoIds || todoIds.length === 0) {
        throw new Error('没有选择要恢复的待办事项');
      }
      
      const response = await api.post<{ message: string; restored_todos: TodoSchema[] }>(
        '/recycle-bin/batch-restore',
        { todo_ids: todoIds }
      );
      return response.data;
    } catch (error) {
      console.error('批量恢复失败:', error);
      throw new Error('批量恢复待办事项失败');
    }
  },

  // 获取统计信息
  getStats: async (): Promise<TodoStats> => {
    try {
      const response = await api.get<TodoStats>('/stats');
      return response.data;
    } catch (error) {
      console.error('获取统计信息失败:', error);
      throw new Error('获取统计信息失败');
    }
  },
};

// 健康检查
export const healthApi = {
  checkHealth: async (): Promise<{ status: string; service: string }> => {
    try {
      const response = await healthClient.get<{ status: string; service: string }>('/health');
      return response.data;
    } catch (error) {
      console.error('健康检查失败:', error);
      throw new Error('无法连接到后端服务');
    }
  },
};

// 系统设置相关 API
export const settingsApi = {
  // 上传壁纸
  uploadWallpaper: async (file: File): Promise<{ message: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post<{ message: string }>('/settings/wallpaper', formData, {
        timeout: 60000,
      });
      return response.data;
    } catch (error) {
      console.error('上传壁纸失败:', error);
      throw new Error('上传壁纸失败，请检查文件大小是否超过50MB');
    }
  },

  // 获取壁纸URL
  getWallpaperUrl: (): string => {
    return `${API_BASE_URL}/settings/wallpaper`;
  },

  // 删除壁纸
  deleteWallpaper: async (): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>('/settings/wallpaper');
      return response.data;
    } catch (error) {
      console.error('删除壁纸失败:', error);
      throw new Error('删除壁纸失败');
    }
  },
};

// 工具函数：将Record转换为Array
export const recordToArray = <T>(record: Record<number, T>): T[] => {
  return Object.values(record);
};

// 工具函数：验证时间格式
export const isValidTimeFormat = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export default api;

// 基础待办事项接口
export interface TodoSchema {
  id?: number;
  title: string;
  description?: string;
  completed: boolean;
  priority: PriorityType;
  start_time?: string;
  end_time?: string;
}

// 优先级类型
export type PriorityType = 'high' | 'medium' | 'low';

// 优先级枚举
export const Priority = {
  HIGH: 'high' as PriorityType,
  MEDIUM: 'medium' as PriorityType,
  LOW: 'low' as PriorityType
} as const;

// 表单数据接口
export interface TodoFormData {
  title: string;
  description?: string;
  priority: PriorityType;
  start_time?: string;
  end_time?: string;
}

// 待办事项状态接口
export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  recycle_bin: number;
}

// 待办事项过滤选项
export interface TodoFilterOptions {
  priority?: PriorityType;
  completed?: boolean;
  hasTimeRange?: boolean;
}

// 时间验证结果
export interface TimeValidationResult {
  isValid: boolean;
  error?: string;
}

// 错误信息接口
export interface ErrorInfo {
  message: string;
  timestamp: number;
  type?: 'network' | 'validation' | 'server';
}

// 加载状态接口
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// 回收站操作结果
export interface RecycleBinOperationResult {
  success: boolean;
  message: string;
  restoredCount?: number;
  deletedCount?: number;
}

// 批量操作请求
export interface BatchOperationRequest {
  todoIds: number[];
  operation: 'restore' | 'delete';
}

// 验证函数
export const validateTodo = (todo: Partial<TodoSchema>): string[] => {
  const errors: string[] = [];
  
  if (!todo.title?.trim()) {
    errors.push('标题不能为空');
  }
  
  if (todo.title && todo.title.length > 100) {
    errors.push('标题长度不能超过100个字符');
  }
  
  if (todo.description && todo.description.length > 500) {
    errors.push('描述长度不能超过500个字符');
  }
  
  // 时间格式验证
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (todo.start_time && !timeRegex.test(todo.start_time)) {
    errors.push('开始时间格式不正确，请使用 HH:MM 格式');
  }
  
  if (todo.end_time && !timeRegex.test(todo.end_time)) {
    errors.push('结束时间格式不正确，请使用 HH:MM 格式');
  }
  
  // 时间逻辑验证
  if (todo.start_time && todo.end_time) {
    const startMinutes = timeToMinutes(todo.start_time);
    const endMinutes = timeToMinutes(todo.end_time);
    
    if (startMinutes >= endMinutes) {
      errors.push('结束时间必须晚于开始时间');
    }
  }
  
  return errors;
};

// 时间转换函数
export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 分钟转时间函数
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// 优先级排序函数
export const sortTodosByPriority = (todos: TodoSchema[]): TodoSchema[] => {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  return [...todos].sort((a, b) => {
    const priorityA = priorityOrder[a.priority] || 0;
    const priorityB = priorityOrder[b.priority] || 0;
    return priorityB - priorityA; // 高优先级在前
  });
};

// 过滤函数
export const filterTodos = (todos: TodoSchema[], filters: TodoFilterOptions): TodoSchema[] => {
  return todos.filter(todo => {
    if (filters.priority && todo.priority !== filters.priority) {
      return false;
    }
    
    if (filters.completed !== undefined && todo.completed !== filters.completed) {
      return false;
    }
    
    if (filters.hasTimeRange && (!todo.start_time || !todo.end_time)) {
      return false;
    }
    
    return true;
  });
};
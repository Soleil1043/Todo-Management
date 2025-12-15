export enum Priority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface TodoItem {
  id?: number
  title: string
  description?: string
  completed: boolean
  priority: Priority
  start_time?: string
  end_time?: string
}

export interface TodoFormData {
  title: string
  description?: string
  priority: Priority
  start_time?: string
  end_time?: string
}
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAppTodos } from '../hooks/useAppTodos';
import { useSettingsContext } from './SettingsContext';
import { TodoSchema, TodoFormData } from '../types/todo';

interface TodoStateContextType {
  todos: TodoSchema[];
  completedCount: number;
  totalCount: number;
}

interface TodoActionsContextType {
  loadTodos: () => Promise<void>;
  handleAddTodo: (data: TodoFormData) => Promise<void>;
  handleToggleComplete: (id: number) => Promise<void>;
  handleDeleteTodo: (id: number) => Promise<void>;
  handleUpdateTodo: (id: number, title: string, description: string, future_score?: number, urgency_score?: number, start_time?: string, end_time?: string) => Promise<void>;
  handleUpdateTodoWithScores: (updatedTodo: TodoSchema) => Promise<void>;
  handleRestoreTodo: (id: number) => Promise<TodoSchema>;
  handleBatchRestore: (ids: number[]) => Promise<TodoSchema[]>;
}

const TodoStateContext = createContext<TodoStateContextType | undefined>(undefined);
const TodoActionsContext = createContext<TodoActionsContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { autoTrash } = useSettingsContext();
  const todoUtils = useAppTodos(autoTrash);

  const stateValue = useMemo(() => ({
    todos: todoUtils.todos,
    completedCount: todoUtils.completedCount,
    totalCount: todoUtils.totalCount
  }), [todoUtils.todos, todoUtils.completedCount, todoUtils.totalCount]);

  const actionsValue = useMemo(() => ({
    loadTodos: todoUtils.loadTodos,
    handleAddTodo: todoUtils.handleAddTodo,
    handleToggleComplete: todoUtils.handleToggleComplete,
    handleDeleteTodo: todoUtils.handleDeleteTodo,
    handleUpdateTodo: todoUtils.handleUpdateTodo,
    handleUpdateTodoWithScores: todoUtils.handleUpdateTodoWithScores,
    handleRestoreTodo: todoUtils.handleRestoreTodo,
    handleBatchRestore: todoUtils.handleBatchRestore
  }), [
    todoUtils.loadTodos,
    todoUtils.handleAddTodo,
    todoUtils.handleToggleComplete,
    todoUtils.handleDeleteTodo,
    todoUtils.handleUpdateTodo,
    todoUtils.handleUpdateTodoWithScores,
    todoUtils.handleRestoreTodo,
    todoUtils.handleBatchRestore
  ]);

  return (
    <TodoStateContext.Provider value={stateValue}>
      <TodoActionsContext.Provider value={actionsValue}>
        {children}
      </TodoActionsContext.Provider>
    </TodoStateContext.Provider>
  );
};

export const useTodoContext = () => {
  const state = useContext(TodoStateContext);
  const actions = useContext(TodoActionsContext);
  
  if (state === undefined || actions === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  
  return useMemo(() => ({ ...state, ...actions }), [state, actions]);
};

export const useTodoState = () => {
  const context = useContext(TodoStateContext);
  if (context === undefined) {
    throw new Error('useTodoState must be used within a TodoProvider');
  }
  return context;
};

export const useTodoActions = () => {
  const context = useContext(TodoActionsContext);
  if (context === undefined) {
    throw new Error('useTodoActions must be used within a TodoProvider');
  }
  return context;
};

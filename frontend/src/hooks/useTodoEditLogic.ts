import { useState, useCallback } from 'react';
import { TodoSchema } from '../types/todo';

interface UseTodoEditLogicProps {
  onUpdateTodo: (todo: TodoSchema) => void;
}

export function useTodoEditLogic({ onUpdateTodo }: UseTodoEditLogicProps) {
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);

  const handleEditStart = useCallback((todo: TodoSchema) => {
    setEditingTodoId(todo.id || null);
  }, []);

  const handleEditCancel = useCallback(() => {
    setEditingTodoId(null);
  }, []);

  const handleEditSave = useCallback((todo: TodoSchema) => {
    onUpdateTodo(todo);
    setEditingTodoId(null);
  }, [onUpdateTodo]);

  return {
    editingTodoId,
    handleEditStart,
    handleEditCancel,
    handleEditSave
  };
}

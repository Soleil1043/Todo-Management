import { useState, useCallback } from 'react';
import { TodoSchema } from '../types/todo';
import { useTimeValidation } from './useTimeValidation';

interface UseTodoEditLogicProps {
  onUpdateTodo: (todo: TodoSchema) => void;
}

export function useTodoEditLogic({ onUpdateTodo }: UseTodoEditLogicProps) {
  const [editingTodoId, setEditingTodoId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  
  const { error: editError, setError: setEditError, validateTime } = useTimeValidation();

  const handleEditStart = useCallback((todo: TodoSchema) => {
    setEditingTodoId(todo.id || null);
    setEditTitle(todo.title);
    setEditDescription(todo.description || '');
    setEditStartTime(todo.start_time || '');
    setEditEndTime(todo.end_time || '');
    setEditError(null);
  }, [setEditError]);

  const handleEditCancel = useCallback((e: React.MouseEvent, _todo: TodoSchema) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingTodoId(null);
    setEditError(null);
  }, [setEditError]);

  const handleEditSave = useCallback((e: React.MouseEvent, todo: TodoSchema) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      setEditError('标题不能为空');
      return;
    }

    if (!validateTime(editStartTime, editEndTime)) {
      return;
    }

    onUpdateTodo({
      ...todo,
      title: trimmedTitle,
      description: editDescription.trim(),
      start_time: editStartTime,
      end_time: editEndTime,
    });

    setEditingTodoId(null);
  }, [editTitle, editDescription, editStartTime, editEndTime, onUpdateTodo, validateTime, setEditError]);

  return {
    editingTodoId,
    editTitle,
    editDescription,
    editStartTime,
    editEndTime,
    editError,
    setEditTitle,
    setEditDescription,
    setEditStartTime,
    setEditEndTime,
    setEditError,
    handleEditStart,
    handleEditCancel,
    handleEditSave
  };
}

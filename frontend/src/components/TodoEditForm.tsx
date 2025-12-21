import React, { useState, useCallback } from 'react';
import { TodoSchema } from '../types/todo';
import TimeSelector from './TimeSelector';
import { useTimeValidation } from '../hooks/useTimeValidation';

interface TodoEditFormProps {
  todo: TodoSchema;
  onSave: (todo: TodoSchema) => void;
  onCancel: () => void;
}

const TodoEditForm: React.FC<TodoEditFormProps> = ({
  todo,
  onSave,
  onCancel
}) => {
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description || '');
  const [editStartTime, setEditStartTime] = useState(todo.start_time || '');
  const [editEndTime, setEditEndTime] = useState(todo.end_time || '');
  
  const { error: editError, setError: setEditError, validateTime } = useTimeValidation();

  const handleSave = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
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

    onSave({
      ...todo,
      title: trimmedTitle,
      description: editDescription.trim(),
      start_time: editStartTime,
      end_time: editEndTime,
    });
  }, [editTitle, editDescription, editStartTime, editEndTime, onSave, todo, validateTime, setEditError]);

  const handleCancel = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onCancel();
  }, [onCancel]);

  return (
    <div
      className="todo-edit"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {editError ? (
        <div className="form-error" role="alert" aria-live="polite">
          {editError}
        </div>
      ) : null}
      <input
        type="text"
        name="title"
        id={`edit-title-${todo.id}`}
        value={editTitle}
        onChange={(e) => {
          setEditTitle(e.target.value);
          setEditError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave(e);
          if (e.key === 'Escape') handleCancel(e);
        }}
        className="edit-input"
        placeholder="标题"
        maxLength={100}
        aria-label="编辑标题"
        autoFocus
      />
      <textarea
        name="description"
        id={`edit-description-${todo.id}`}
        value={editDescription}
        onChange={(e) => {
          setEditDescription(e.target.value);
          setEditError(null);
        }}
        className="edit-textarea"
        placeholder="描述（可选）"
        rows={3}
        maxLength={500}
        aria-label="编辑描述"
      />
      <div className="form-row">
        <TimeSelector
          label="开始时间"
          value={editStartTime}
          onChange={(value) => {
            setEditStartTime(value);
            setEditError(null);
          }}
        />
        <TimeSelector
          label="结束时间"
          value={editEndTime}
          onChange={(value) => {
            setEditEndTime(value);
            setEditError(null);
          }}
        />
      </div>
      <div className="edit-actions">
        <button
          type="button"
          onClick={handleCancel}
          className="btn-cancel"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="btn-save"
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default React.memo(TodoEditForm);

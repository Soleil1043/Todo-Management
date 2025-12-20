import React from 'react';
import { TodoSchema } from '../types/todo';
import TimeSelector from './TimeSelector';

interface TodoEditFormProps {
  todo: TodoSchema;
  editTitle: string;
  editDescription: string;
  editStartTime: string;
  editEndTime: string;
  editError: string | null;
  setEditTitle: (value: string) => void;
  setEditDescription: (value: string) => void;
  setEditStartTime: (value: string) => void;
  setEditEndTime: (value: string) => void;
  setEditError: (value: string | null) => void;
  onSave: (e: React.MouseEvent, todo: TodoSchema) => void;
  onCancel: (e: React.MouseEvent, todo: TodoSchema) => void;
}

const TodoEditForm: React.FC<TodoEditFormProps> = ({
  todo,
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
  onSave,
  onCancel
}) => {
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
        value={editTitle}
        onChange={(e) => {
          setEditTitle(e.target.value);
          setEditError(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onSave(e as unknown as React.MouseEvent, todo);
          if (e.key === 'Escape') onCancel(e as unknown as React.MouseEvent, todo);
        }}
        className="edit-input"
        placeholder="标题"
        maxLength={100}
        aria-label="编辑标题"
        autoFocus
      />
      <textarea
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
          onClick={(e) => onCancel(e, todo)}
          className="btn-cancel"
        >
          取消
        </button>
        <button
          type="button"
          onClick={(e) => onSave(e, todo)}
          className="btn-save"
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default TodoEditForm;

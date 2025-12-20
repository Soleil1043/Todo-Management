import React from 'react';
import { TodoSchema } from '../types/todo';
import Icon from './Icon';

interface RecycledTodoItemProps {
  todo: TodoSchema;
  loading: boolean;
  onRestore: (todo: TodoSchema) => void;
  onPermanentDelete: (id: number) => void;
}

const RecycledTodoItem: React.FC<RecycledTodoItemProps> = ({
  todo,
  loading,
  onRestore,
  onPermanentDelete,
}) => {
  return (
    <div className="todo-item" style={{ marginBottom: 12 }}>
      <div className="todo-content">
        <div className="todo-header">
          <h4 className="todo-title">{todo.title}</h4>
        </div>
        {todo.description && <p className="todo-description">{todo.description}</p>}
        <div className="todo-meta">
          <div className="meta-item">
            <Icon name="tag" size={14} />
            <span className="priority-badge priority-info">
              已分类任务
            </span>
          </div>
          {(todo.start_time || todo.end_time) && (
            <div className="meta-item">
              <Icon name="clock" size={14} />
              <span>
                {todo.start_time && `${todo.start_time}`}
                {todo.start_time && todo.end_time && ' - '}
                {todo.end_time && `${todo.end_time}`}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="todo-actions">
        <button
          className="btn-restore"
          onClick={() => onRestore(todo)}
          disabled={loading}
          type="button"
          title="恢复"
        >
          <Icon name="restore" size={18} />
        </button>
        <button
          className="btn-delete-permanent"
          onClick={() => onPermanentDelete(todo.id!)}
          disabled={loading}
          type="button"
          title="永久删除"
        >
          <Icon name="trash" size={18} />
        </button>
      </div>
    </div>
  );
};

export default React.memo(RecycledTodoItem);

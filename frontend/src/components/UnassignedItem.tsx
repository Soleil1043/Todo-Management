import React from 'react';
import { TodoSchema } from '../types/todo';
import Icon from './Icon';
import TodoEditForm from './TodoEditForm';

interface UnassignedItemProps {
  todo: TodoSchema;
  onDragStart: (e: React.DragEvent, todo: TodoSchema) => void;
  onDragEnd: () => void;
  editingTodoId: number | null;
  onDeleteTodo: (id: number) => void;
  handleEditStart: (todo: TodoSchema) => void;
  handleEditCancel: () => void;
  handleEditSave: (todo: TodoSchema) => void;
}

const UnassignedItem: React.FC<UnassignedItemProps> = ({
  todo,
  onDragStart,
  onDragEnd,
  editingTodoId,
  onDeleteTodo,
  handleEditStart,
  handleEditCancel,
  handleEditSave,
}) => {
  const isEditing = editingTodoId === todo.id;

  return (
    <div
      className={`priority-item ${isEditing ? 'editing' : ''}`}
      draggable={!isEditing}
      onDragStart={(e) => !isEditing && onDragStart(e, todo)}
      onDragEnd={onDragEnd}
      title={isEditing ? "" : "拖拽到象限中分类"}
      style={{ cursor: isEditing ? 'default' : 'grab' }}
    >
      {isEditing ? (
        <TodoEditForm
          todo={todo}
          onSave={handleEditSave}
          onCancel={handleEditCancel}
        />
      ) : (
        <>
          <div className="todo-checkbox-container" style={{ cursor: 'grab' }}>
            <Icon name="grid" size={14} />
          </div>
          <div className="priority-item-content">
            <div className="priority-item-title">{todo.title}</div>
            {todo.description && (
              <p className="todo-description">{todo.description}</p>
            )}
            <div className="priority-item-meta">
              <span className="priority-badge priority-unassigned">
                未分类
              </span>
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
              className="btn-edit"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEditStart(todo);
              }}
              title="编辑"
            >
              <Icon name="edit" size={18} />
            </button>
            <button
              className="btn-delete"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (todo.id) onDeleteTodo(todo.id);
              }}
              title="删除"
            >
              <Icon name="trash" size={18} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(UnassignedItem);

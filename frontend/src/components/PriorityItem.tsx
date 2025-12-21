import React from 'react';
import { TodoSchema } from '../types/todo';
import { scoreToPosition } from '../utils/quadrantUtils';
import Icon from './Icon';
import TodoEditForm from './TodoEditForm';

interface PriorityItemProps {
  todo: TodoSchema;
  index: number;
  editingTodoId: number | null;
  onToggleComplete: (id: number) => void;
  onDeleteTodo: (id: number) => void;
  handlePriorityEditStart: (todo: TodoSchema) => void;
  handlePriorityEditCancel: () => void;
  handlePriorityEditSave: (todo: TodoSchema) => void;
  spotlightType: 'glow' | 'flow' | 'focus' | 'none';
  onHoverTodo: (id: number, x: number, y: number) => void;
  onLeaveTodo: () => void;
  hoveredTodoId: number | null;
}

const PriorityItem: React.FC<PriorityItemProps> = ({
  todo,
  index,
  editingTodoId,
  onToggleComplete,
  onDeleteTodo,
  handlePriorityEditStart,
  handlePriorityEditCancel,
  handlePriorityEditSave,
  spotlightType,
  onHoverTodo,
  onLeaveTodo,
  hoveredTodoId,
}) => {
  const isEditing = editingTodoId === todo.id;
  const isHovered = hoveredTodoId === todo.id;
  const isFirstActive = index === 0 && !todo.completed;

  return (
    <div
      className={`priority-item ${todo.completed ? 'completed' : ''} ${isEditing ? 'editing' : ''} ${isFirstActive ? `spotlight-${spotlightType}` : ''} ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => {
        if (todo.id) {
          const x = scoreToPosition(todo.urgency_score ?? 0);
          const y = 100 - scoreToPosition(todo.future_score ?? 0);
          onHoverTodo(todo.id, x, y);
        }
      }}
      onMouseLeave={() => onLeaveTodo()}
    >
      <div
        className="todo-checkbox-container"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <input
          type="checkbox"
          name={`priority-complete-${todo.id}`}
          id={`priority-complete-${todo.id}`}
          checked={!!todo.completed}
          onChange={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (todo.id) onToggleComplete(todo.id);
          }}
          className="todo-checkbox"
          aria-label={`${todo.completed ? '取消完成' : '标记完成'}：${todo.title}`}
        />
      </div>
      {isEditing ? (
        <TodoEditForm
          todo={todo}
          onSave={handlePriorityEditSave}
          onCancel={handlePriorityEditCancel}
        />
      ) : (
        <>
          <div className="priority-item-content">
            <div className="priority-item-title">{todo.title}</div>
            {todo.description && (
              <p className="todo-description">{todo.description}</p>
            )}
            <div className="priority-item-meta">
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
              {todo.completed && <span className="completed-badge">已完成</span>}
            </div>
          </div>
          <div className="todo-actions">
            <button
              className="btn-edit"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePriorityEditStart(todo);
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

export default React.memo(PriorityItem);

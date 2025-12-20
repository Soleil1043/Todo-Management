import React from 'react';
import { TodoSchema } from '../types/todo';
import Icon from './Icon';
import TodoEditForm from './TodoEditForm';

interface PriorityListProps {
  todos: TodoSchema[];
  editingTodoId: number | null;
  editTitle: string;
  editDescription: string;
  editStartTime: string;
  editEndTime: string;
  editError: string | null;
  onToggleComplete: (id: number) => void;
  onDeleteTodo: (id: number) => void;
  handlePriorityEditStart: (todo: TodoSchema) => void;
  handlePriorityEditCancel: (e: React.MouseEvent, todo: TodoSchema) => void;
  handlePriorityEditSave: (e: React.MouseEvent, todo: TodoSchema) => void;
  setEditTitle: (value: string) => void;
  setEditDescription: (value: string) => void;
  setEditStartTime: (value: string) => void;
  setEditEndTime: (value: string) => void;
  setEditError: (value: string | null) => void;
  spotlightType: 'glow' | 'flow' | 'focus' | 'none';
}

const PriorityList: React.FC<PriorityListProps> = ({
  todos,
  editingTodoId,
  editTitle,
  editDescription,
  editStartTime,
  editEndTime,
  editError,
  onToggleComplete,
  onDeleteTodo,
  handlePriorityEditStart,
  handlePriorityEditCancel,
  handlePriorityEditSave,
  setEditTitle,
  setEditDescription,
  setEditStartTime,
  setEditEndTime,
  setEditError,
  spotlightType,
}) => {
  return (
    <div className="priority-list">
      <div className="priority-list-header">
        <h3 className="priority-list-title">
          <Icon name="list" size={18} />
          待执行队列
        </h3>
        <span className="priority-list-count">{todos.length}</span>
      </div>
      <div className="priority-list-content">
        {todos.map((todo, index) => (
          <div
            key={todo.id}
            className={`priority-item ${todo.completed ? 'completed' : ''} ${editingTodoId === todo.id ? 'editing' : ''} ${index === 0 && !todo.completed ? `spotlight-${spotlightType}` : ''}`}
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
            {editingTodoId === todo.id ? (
              <TodoEditForm
                todo={todo}
                editTitle={editTitle}
                editDescription={editDescription}
                editStartTime={editStartTime}
                editEndTime={editEndTime}
                editError={editError}
                setEditTitle={setEditTitle}
                setEditDescription={setEditDescription}
                setEditStartTime={setEditStartTime}
                setEditEndTime={setEditEndTime}
                setEditError={setEditError}
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
        ))}
        {todos.length === 0 && (
          <div className="priority-list-empty">
            <Icon name="check-circle" size={24} />
            <p>暂无已分类任务</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriorityList;

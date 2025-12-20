import React from 'react';
import { TodoSchema } from '../types/todo';
import Icon from './Icon';
import TodoEditForm from './TodoEditForm';

interface UnassignedStackProps {
  todos: TodoSchema[];
  onDragStart: (e: React.DragEvent, todo: TodoSchema) => void;
  onDragEnd: () => void;
  editingTodoId: number | null;
  editTitle: string;
  editDescription: string;
  editStartTime: string;
  editEndTime: string;
  editError: string | null;
  onDeleteTodo: (id: number) => void;
  handleEditStart: (todo: TodoSchema) => void;
  handleEditCancel: (e: React.MouseEvent, todo: TodoSchema) => void;
  handleEditSave: (e: React.MouseEvent, todo: TodoSchema) => void;
  setEditTitle: (value: string) => void;
  setEditDescription: (value: string) => void;
  setEditStartTime: (value: string) => void;
  setEditEndTime: (value: string) => void;
  setEditError: (value: string | null) => void;
}

const UnassignedStack: React.FC<UnassignedStackProps> = ({
  todos,
  onDragStart,
  onDragEnd,
  editingTodoId,
  editTitle,
  editDescription,
  editStartTime,
  editEndTime,
  editError,
  onDeleteTodo,
  handleEditStart,
  handleEditCancel,
  handleEditSave,
  setEditTitle,
  setEditDescription,
  setEditStartTime,
  setEditEndTime,
  setEditError,
}) => {
  return (
    <div className="unassigned-stack">
      <div className="stack-header">
        <h3 className="stack-title">
          <Icon name="list" size={18} />
          待分类队列
        </h3>
        <span className="stack-count">{todos.length}</span>
      </div>
      <div className="stack-list">
        {todos.map(todo => (
          <div
            key={todo.id}
            className={`priority-item ${editingTodoId === todo.id ? 'editing' : ''}`}
            draggable={editingTodoId !== todo.id} // Disable drag when editing
            onDragStart={(e) => editingTodoId !== todo.id && onDragStart(e, todo)}
            onDragEnd={onDragEnd}
            title={editingTodoId === todo.id ? "" : "拖拽到象限中分类"}
            style={{ cursor: editingTodoId === todo.id ? 'default' : 'grab' }}
          >
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
        ))}
        {todos.length === 0 && (
          <div className="stack-empty" style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <Icon name="check-circle" size={24} />
            <p>队列已清空</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(UnassignedStack);

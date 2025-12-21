import React from 'react';
import { TodoSchema } from '../types/todo';
import Icon from './Icon';
import UnassignedItem from './UnassignedItem';
import { useTodoActions } from '../contexts/TodoContext';

interface UnassignedStackProps {
  todos: TodoSchema[];
  onDragStart: (e: React.DragEvent, todo: TodoSchema) => void;
  onDragEnd: () => void;
  editingTodoId: number | null;
  handleEditStart: (todo: TodoSchema) => void;
  handleEditCancel: () => void;
  handleEditSave: (todo: TodoSchema) => void;
}

const UnassignedStack: React.FC<UnassignedStackProps> = ({
  todos,
  onDragStart,
  onDragEnd,
  editingTodoId,
  handleEditStart,
  handleEditCancel,
  handleEditSave,
}) => {
  const { handleDeleteTodo } = useTodoActions();

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
          <UnassignedItem
            key={todo.id}
            todo={todo}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            editingTodoId={editingTodoId}
            onDeleteTodo={handleDeleteTodo}
            handleEditStart={handleEditStart}
            handleEditCancel={handleEditCancel}
            handleEditSave={handleEditSave}
          />
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

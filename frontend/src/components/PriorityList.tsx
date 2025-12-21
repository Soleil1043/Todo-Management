import React from 'react';
import { TodoSchema } from '../types/todo';
import Icon from './Icon';
import PriorityItem from './PriorityItem';
import { useTodoActions } from '../contexts/TodoContext';

interface PriorityListProps {
  todos: TodoSchema[];
  editingTodoId: number | null;
  handlePriorityEditStart: (todo: TodoSchema) => void;
  handlePriorityEditCancel: () => void;
  handlePriorityEditSave: (todo: TodoSchema) => void;
  spotlightType: 'glow' | 'flow' | 'focus' | 'none';
  onHoverTodo: (id: number, x: number, y: number) => void;
  onLeaveTodo: () => void;
  hoveredTodoId: number | null;
}

const PriorityList: React.FC<PriorityListProps> = ({
  todos,
  editingTodoId,
  handlePriorityEditStart,
  handlePriorityEditCancel,
  handlePriorityEditSave,
  spotlightType,
  onHoverTodo,
  onLeaveTodo,
  hoveredTodoId,
}) => {
  const { handleToggleComplete, handleDeleteTodo } = useTodoActions();

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
          <PriorityItem
            key={todo.id}
            todo={todo}
            index={index}
            editingTodoId={editingTodoId}
            onToggleComplete={handleToggleComplete}
            onDeleteTodo={handleDeleteTodo}
            handlePriorityEditStart={handlePriorityEditStart}
            handlePriorityEditCancel={handlePriorityEditCancel}
            handlePriorityEditSave={handlePriorityEditSave}
            spotlightType={spotlightType}
            onHoverTodo={onHoverTodo}
            onLeaveTodo={onLeaveTodo}
            hoveredTodoId={hoveredTodoId}
          />
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

export default React.memo(PriorityList);

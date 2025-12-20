import React from 'react';
import { TodoSchema } from '../types/todo';
import { getPointColor, getQuadrantBorderColor } from '../utils/quadrantUtils';

interface TodoPointProps {
  todo: TodoSchema;
  onMouseDown: (e: React.MouseEvent, todo: TodoSchema) => void;
  onTouchStart: (e: React.TouchEvent, todo: TodoSchema) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
  isDragging: boolean;
  isSelected: boolean;
  isHovered: boolean;
  style: React.CSSProperties;
}

const TodoPoint: React.FC<TodoPointProps> = ({ 
  todo, 
  onMouseDown, 
  onTouchStart, 
  onMouseEnter, 
  onMouseLeave, 
  onClick,
  isDragging,
  isSelected,
  isHovered,
  style
}) => {
  return (
    <div
      className={`todo-point ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      style={{
        ...style,
        backgroundColor: getPointColor(todo.future_score ?? 0, todo.urgency_score ?? 0),
        borderColor: getQuadrantBorderColor(todo.future_score ?? 0, todo.urgency_score ?? 0),
      }}
      onMouseDown={(e) => onMouseDown(e, todo)}
      onTouchStart={(e) => onTouchStart(e, todo)}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div className="todo-point-content">
        <span className="todo-title">{todo.title}</span>
      </div>
    </div>
  );
};

export default React.memo(TodoPoint);

import React, { useMemo } from 'react';
import { TodoSchema } from '../types/todo';
import { getPointColor, getQuadrantBorderColor } from '../utils/quadrantUtils';

interface TodoPointProps {
  todo: TodoSchema;
  onMouseDown: (e: React.MouseEvent, todo: TodoSchema) => void;
  onTouchStart: (e: React.TouchEvent, todo: TodoSchema) => void;
  onMouseEnter: (id: number, x: number, y: number) => void;
  onMouseLeave: () => void;
  onClick: (id: number) => void;
  isDragging: boolean;
  isSelected: boolean;
  isHovered: boolean;
  x: number;
  y: number;
  zIndex: number;
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
  x,
  y,
  zIndex
}) => {
  const style = useMemo(() => ({
    left: `${x}%`,
    top: `${y}%`,
    zIndex,
    backgroundColor: getPointColor(todo.future_score ?? 0, todo.urgency_score ?? 0),
    borderColor: getQuadrantBorderColor(todo.future_score ?? 0, todo.urgency_score ?? 0),
    color: getPointColor(todo.future_score ?? 0, todo.urgency_score ?? 0),
  }), [x, y, zIndex, todo.future_score, todo.urgency_score]);

  return (
    <div
      className={`todo-point ${isDragging ? 'dragging' : ''} ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
      style={style}
      onMouseDown={(e) => onMouseDown(e, todo)}
      onTouchStart={(e) => onTouchStart(e, todo)}
      onMouseEnter={() => onMouseEnter(todo.id!, x, y)}
      onMouseLeave={onMouseLeave}
      onClick={() => onClick(todo.id!)}
    >
      <div className="todo-point-content">
        <span className="todo-title">{todo.title}</span>
      </div>
    </div>
  );
};

export default React.memo(TodoPoint);

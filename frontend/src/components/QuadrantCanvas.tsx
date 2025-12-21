import React from 'react';
import { TodoSchema } from '../types/todo';
import Icon from './Icon';
import TodoPoint from './TodoPoint';
import { getQuadrantLabel, scoreToPosition, getQuadrantColor } from '../utils/quadrantUtils';

interface QuadrantCanvasProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  assignedTodos: TodoSchema[];
  draggingTodo: TodoSchema | null;
  localDragPos: { x: number; y: number } | null;
  previewScores: { x: number; y: number } | null;
  isDraggingFromStack: boolean;
  selectedTodoId: number | null;
  hoveredTodoId: number | null;
  tooltipData: { id: number; x: number; y: number } | null;
  handleCanvasDrop: (e: React.DragEvent) => void;
  handleCanvasDragOver: (e: React.DragEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
  handleMouseDown: (e: React.MouseEvent | React.TouchEvent, todo: TodoSchema) => void;
  handleTouchStart: (e: React.TouchEvent, todo: TodoSchema) => void;
  handleTodoPointHover: (todoId: number, xPercent: number, yPercent: number) => void;
  handleTodoPointLeave: () => void;
  handleTodoPointClick: (todoId: number) => void;
}

const QuadrantCanvas: React.FC<QuadrantCanvasProps> = ({
  canvasRef,
  assignedTodos,
  draggingTodo,
  localDragPos,
  previewScores,
  isDraggingFromStack,
  selectedTodoId,
  hoveredTodoId,
  tooltipData,
  handleCanvasDrop,
  handleCanvasDragOver,
  handleMouseMove,
  handleMouseUp,
  handleTouchMove,
  handleTouchEnd,
  handleMouseDown,
  handleTouchStart,
  handleTodoPointHover,
  handleTodoPointLeave,
  handleTodoPointClick,
}) => {
  return (
    <div
      className={`quadrant-card ${draggingTodo ? 'quadrant-card-dragging' : ''} ${selectedTodoId ? 'quadrant-card-selected' : ''}`}
      onDrop={handleCanvasDrop}
      onDragOver={handleCanvasDragOver}
    >
      <div className="quadrant-card-header">
        <h3 className="quadrant-card-title">
          <Icon name="grid" size={20} />
          四象限画布
        </h3>
        <div className="quadrant-info-hint">
          <Icon name="info" size={14} />
          <span>拖拽点位可调整优先级</span>
        </div>
      </div>

      <div
        className={`quadrant-canvas ${isDraggingFromStack ? 'dragging-from-stack' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: draggingTodo ? 'grabbing' : 'default' } as React.CSSProperties}
      >
        <div ref={canvasRef} className="quadrant-main-area">
          {/* 象限背景色 */}
          <div className="quadrant-bg-colors">
            <div className="bg-color q2" style={{ backgroundColor: getQuadrantColor(3, -3) }}></div>
            <div className="bg-color q1" style={{ backgroundColor: getQuadrantColor(3, 3) }}></div>
            <div className="bg-color q4" style={{ backgroundColor: getQuadrantColor(-3, -3) }}></div>
            <div className="bg-color q3" style={{ backgroundColor: getQuadrantColor(-3, 3) }}></div>
          </div>

          {/* 象限背景标签 */}
          <div className="quadrant-bg-labels">
            <div className="bg-label l1">重要且紧急</div>
            <div className="bg-label l2">重要不紧急</div>
            <div className="bg-label l3">不重要但紧急</div>
            <div className="bg-label l4">不重要不紧急</div>
          </div>

          {/* 网格线 */}
          <div className="quadrant-grid">
            <div className="grid-line vertical" style={{ left: '50%' }}></div>
            <div className="grid-line horizontal" style={{ top: '50%' }}></div>
          </div>

          {/* 坐标轴 */}
          <div className="axis x-axis">
            <div className="axis-line"></div>
            <div className="axis-arrow"></div>
            <span className="axis-label-text title">紧急性</span>
          </div>

          <div className="axis y-axis">
            <div className="axis-line"></div>
            <div className="axis-arrow"></div>
            <span className="axis-label-text title">重要性</span>
          </div>

          {(() => {
            return assignedTodos.map(todo => {
              const isDragging = draggingTodo?.id === todo.id;

              let x, y;
              if (isDragging && localDragPos) {
                x = localDragPos.x;
                y = localDragPos.y;
              } else {
                x = scoreToPosition(todo.urgency_score ?? 0);
                y = 100 - scoreToPosition(todo.future_score ?? 0);
              }

              const clampedX = Math.max(0, Math.min(100, x));
              const clampedY = Math.max(0, Math.min(100, y));

              return (
                <TodoPoint
                  key={todo.id}
                  todo={todo}
                  isDragging={isDragging}
                  isSelected={selectedTodoId === todo.id}
                  isHovered={hoveredTodoId === todo.id}
                  x={clampedX}
                  y={clampedY}
                  zIndex={isDragging ? 1000 : (selectedTodoId === todo.id ? 999 : 50)}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  onMouseEnter={handleTodoPointHover}
                  onMouseLeave={handleTodoPointLeave}
                  onClick={handleTodoPointClick}
                />
              );
            });
          })()}

          {tooltipData && !draggingTodo && (
            <div
              className="todo-tooltip"
              style={{
                left: `${tooltipData.x}%`,
                top: `${tooltipData.y}%`,
                transform: `translate(${tooltipData.x > 80 ? '-105%' : '15px'}, ${tooltipData.y > 80 ? '-105%' : '15px'})`
              }}
            >
              {(() => {
                const todo = assignedTodos.find(t => t.id === tooltipData.id);
                if (!todo) return null;
                return (
                  <div className="todo-tooltip-content">
                    <div className="todo-tooltip-title">{todo.title}</div>
                    <div className="todo-tooltip-scores">
                      重要性: {todo.future_score ?? 0} / 紧急性: {todo.urgency_score ?? 0}
                    </div>
                    <div className="todo-tooltip-quadrant">
                      {getQuadrantLabel(todo.future_score ?? 0, todo.urgency_score ?? 0)}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 实时坐标预览 */}
          {previewScores && localDragPos && (
            <div
              className="drag-coordinate-preview"
              style={{
                left: `${localDragPos.x}%`,
                top: `${localDragPos.y}%`,
                zIndex: 2000,
                transform: `translate(${localDragPos.x > 70 ? '-105%' : '15px'}, ${localDragPos.y < 20 ? '15px' : '-115%'})`
              }}
            >
              <div className="preview-scores">
                <span className="preview-score-item">
                  <span className="score-label">紧急性:</span>
                  <span className={`score-value ${previewScores.x > 0 ? 'positive' : previewScores.x < 0 ? 'negative' : ''}`}>
                    {previewScores.x > 0 ? `+${previewScores.x}` : previewScores.x}
                  </span>
                </span>
                <span className="preview-divider">|</span>
                <span className="preview-score-item">
                  <span className="score-label">重要性:</span>
                  <span className={`score-value ${previewScores.y > 0 ? 'positive' : previewScores.y < 0 ? 'negative' : ''}`}>
                    {previewScores.y > 0 ? `+${previewScores.y}` : previewScores.y}
                  </span>
                </span>
              </div>
              <div className="preview-quadrant">
                {getQuadrantLabel(previewScores.y, previewScores.x).split(' - ')[0]}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(QuadrantCanvas);

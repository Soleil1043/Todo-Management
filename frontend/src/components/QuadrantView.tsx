import React, { useState, useRef, useCallback, useMemo } from 'react';
import { sortTodosByPriority } from '../types/todo';
import PriorityList from './PriorityList';
import UnassignedStack from './UnassignedStack';
import QuadrantCanvas from './QuadrantCanvas';
import { useDragLogic } from '../hooks/useDragLogic';
import { useTodoEditLogic } from '../hooks/useTodoEditLogic';
import { useTodoState, useTodoActions } from '../contexts/TodoContext';

export interface QuadrantViewProps {
  spotlightType: 'glow' | 'flow' | 'focus' | 'none';
}

const QuadrantView: React.FC<QuadrantViewProps> = ({ spotlightType }) => {
  const { todos } = useTodoState();
  const { 
    handleUpdateTodoWithScores: onUpdateTodo,
  } = useTodoActions();

  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [hoveredTodoId, setHoveredTodoId] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<{ id: number; x: number; y: number } | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  const {
    editingTodoId,
    handleEditStart: handlePriorityEditStart,
    handleEditCancel: handlePriorityEditCancel,
    handleEditSave: handlePriorityEditSave
  } = useTodoEditLogic({ onUpdateTodo });

  const {
    draggingTodo,
    localDragPos,
    previewScores,
    isDraggingFromStack,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleUnassignedDragStart,
    handleUnassignedDragEnd,
    handleCanvasDrop,
    handleCanvasDragOver
  } = useDragLogic({
    canvasRef,
    todos,
    onUpdateTodo,
    setSelectedTodoId
  });

  // 分类待办事项
  const { unassignedTodos, assignedTodos } = useMemo(() => {
    const unassigned = todos.filter(todo => 
      todo.future_score === null || todo.future_score === undefined ||
      todo.urgency_score === null || todo.urgency_score === undefined
    );
    const assigned = todos.filter(todo => 
      todo.future_score !== null && todo.future_score !== undefined &&
      todo.urgency_score !== null && todo.urgency_score !== undefined &&
      !todo.completed // 只显示未完成的任务
    );
    return { unassignedTodos: unassigned, assignedTodos: assigned };
  }, [todos]);

  // 按创建时间排序（最新的在顶部）
  const sortedUnassignedTodos = useMemo(() => {
    return [...unassignedTodos].sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [unassignedTodos]);

  // 优先级排序算法 - 包含所有已分配的任务（用于右侧列表显示）
  const prioritySortedTodos = useMemo(() => {
    const allAssigned = todos.filter(todo => 
      todo.future_score !== null && todo.future_score !== undefined &&
      todo.urgency_score !== null && todo.urgency_score !== undefined
    );
    return sortTodosByPriority(allAssigned);
  }, [todos]);

  const handleTodoPointHover = useCallback((todoId: number, xPercent: number, yPercent: number) => {
    setHoveredTodoId(todoId);
    setTooltipData({ id: todoId, x: xPercent, y: yPercent });
  }, []);

  const handleTodoPointLeave = useCallback(() => {
    setHoveredTodoId(null);
    setTooltipData(null);
  }, []);

  const handleTodoPointClick = useCallback((todoId: number) => {
    setSelectedTodoId(prev => (prev === todoId ? null : todoId));
  }, []);

  return (
    <div className="new-quadrant-view">
      <div className="quadrant-layout">
        <UnassignedStack
          todos={sortedUnassignedTodos}
          onDragStart={handleUnassignedDragStart}
          onDragEnd={handleUnassignedDragEnd}
          editingTodoId={editingTodoId}
          handleEditStart={handlePriorityEditStart}
          handleEditCancel={handlePriorityEditCancel}
          handleEditSave={handlePriorityEditSave}
        />

        <QuadrantCanvas
          canvasRef={canvasRef}
          assignedTodos={assignedTodos}
          draggingTodo={draggingTodo}
          localDragPos={localDragPos}
          previewScores={previewScores}
          isDraggingFromStack={isDraggingFromStack}
          selectedTodoId={selectedTodoId}
          hoveredTodoId={hoveredTodoId}
          tooltipData={tooltipData}
          handleCanvasDrop={handleCanvasDrop}
          handleCanvasDragOver={handleCanvasDragOver}
          handleMouseMove={handleMouseMove}
          handleMouseUp={handleMouseUp}
          handleTouchMove={handleTouchMove}
          handleTouchEnd={handleTouchEnd}
          handleMouseDown={handleMouseDown}
          handleTouchStart={handleTouchStart}
          handleTodoPointHover={handleTodoPointHover}
          handleTodoPointLeave={handleTodoPointLeave}
          handleTodoPointClick={handleTodoPointClick}
        />

        <PriorityList
            todos={prioritySortedTodos}
            editingTodoId={editingTodoId}
            handlePriorityEditStart={handlePriorityEditStart}
            handlePriorityEditCancel={handlePriorityEditCancel}
            handlePriorityEditSave={handlePriorityEditSave}
            spotlightType={spotlightType}
            onHoverTodo={handleTodoPointHover}
            onLeaveTodo={handleTodoPointLeave}
            hoveredTodoId={hoveredTodoId}
          />
      </div>
    </div>
  );
};

export default React.memo(QuadrantView);

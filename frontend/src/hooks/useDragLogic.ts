import { useState, useCallback, RefObject } from 'react';
import { TodoSchema } from '../types/todo';
import { positionToScore } from '../utils/quadrantUtils';

interface Point {
  x: number;
  y: number;
}

interface UseDragLogicProps {
  canvasRef: RefObject<HTMLDivElement>;
  todos: TodoSchema[];
  onUpdateTodo: (todo: TodoSchema) => void;
  setSelectedTodoId: (id: number | null) => void;
}

export const useDragLogic = ({ canvasRef, todos, onUpdateTodo, setSelectedTodoId }: UseDragLogicProps) => {
  const [draggingTodo, setDraggingTodo] = useState<TodoSchema | null>(null);
  const [localDragPos, setLocalDragPos] = useState<Point | null>(null);
  const [previewScores, setPreviewScores] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingFromStack, setIsDraggingFromStack] = useState(false);
  const [draggingFromStack, setDraggingFromStack] = useState<TodoSchema | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent, todo: TodoSchema) => {
    if (!todo.id) return;
    
    // 如果是触摸事件，使用第一个触点
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (!('touches' in e)) {
      e.preventDefault();
    }
    
    setDraggingTodo(todo);
    setSelectedTodoId(todo.id);
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const xPercent = ((clientX - rect.left) / rect.width) * 100;
      const yPercent = ((clientY - rect.top) / rect.height) * 100;
      
      setLocalDragPos({ x: xPercent, y: yPercent });
      
      const urgencyScore = positionToScore(xPercent);
      const futureScore = positionToScore(100 - yPercent);
      setPreviewScores({ x: urgencyScore, y: futureScore });
    }
  }, [canvasRef, setSelectedTodoId]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingTodo || !canvasRef.current) return;
      
      const clientX = e.clientX;
      const clientY = e.clientY;
      
      // 使用 requestAnimationFrame 优化性能
      window.requestAnimationFrame(() => {
        if (!draggingTodo || !canvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const xPercent = Math.max(0, Math.min(((clientX - rect.left) / rect.width) * 100, 100));
        const yPercent = Math.max(0, Math.min(((clientY - rect.top) / rect.height) * 100, 100));
        
        setLocalDragPos({ x: xPercent, y: yPercent });
        
        const urgencyScore = positionToScore(xPercent);
        const futureScore = positionToScore(100 - yPercent);
        setPreviewScores({ x: urgencyScore, y: futureScore });
      });
    },
    [draggingTodo, canvasRef]
  );

  const handleMouseUp = useCallback(() => {
    if (draggingTodo && localDragPos) {
      const urgencyScore = positionToScore(localDragPos.x);
      const futureScore = positionToScore(100 - localDragPos.y);

      const currentTodo = todos.find(t => t.id === draggingTodo.id);
      
      if (currentTodo) {
        if (currentTodo.urgency_score !== urgencyScore || currentTodo.future_score !== futureScore) {
          onUpdateTodo({
            ...currentTodo,
            urgency_score: urgencyScore,
            future_score: futureScore
          });
        }
      }
      
      setDraggingTodo(null);
      setLocalDragPos(null);
      setPreviewScores(null);
    }
  }, [draggingTodo, localDragPos, todos, onUpdateTodo, canvasRef]);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent, todo: TodoSchema) => {
      if (!todo.id) return;
      e.preventDefault();
      const touch = e.touches[0];
      setDraggingTodo(todo);
      setSelectedTodoId(todo.id);
      
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const xPercent = ((touch.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((touch.clientY - rect.top) / rect.height) * 100;
        
        setLocalDragPos({ x: xPercent, y: yPercent });
        
        const urgencyScore = positionToScore(xPercent);
        const futureScore = positionToScore(100 - yPercent);
        setPreviewScores({ x: urgencyScore, y: futureScore });
      }
    },
    [canvasRef, setSelectedTodoId]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!draggingTodo || !canvasRef.current) return;
      const touch = e.touches[0];
      const clientX = touch.clientX;
      const clientY = touch.clientY;

      window.requestAnimationFrame(() => {
        if (!draggingTodo || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const xPercent = Math.max(0, Math.min(((clientX - rect.left) / rect.width) * 100, 100));
        const yPercent = Math.max(0, Math.min(((clientY - rect.top) / rect.height) * 100, 100));
        
        setLocalDragPos({ x: xPercent, y: yPercent });
        
        const urgencyScore = positionToScore(xPercent);
        const futureScore = positionToScore(100 - yPercent);
        setPreviewScores({ x: urgencyScore, y: futureScore });
      });
    },
    [draggingTodo, canvasRef]
  );

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  const handleUnassignedDragStart = useCallback((e: React.DragEvent, todo: TodoSchema) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(todo));
    setDraggingFromStack(todo);
    setIsDraggingFromStack(true);
  }, []);

  const handleUnassignedDragEnd = useCallback(() => {
    setDraggingFromStack(null);
    setIsDraggingFromStack(false);
    setPreviewScores(null);
    setLocalDragPos(null);
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFromStack(false);
    setPreviewScores(null);
    setLocalDragPos(null);
    if (!canvasRef.current) return;

    let baseTodo: TodoSchema | null = draggingFromStack;

    if (!baseTodo) {
      const todoData = e.dataTransfer.getData('application/json');
      if (!todoData) return;
      try {
        baseTodo = JSON.parse(todoData) as TodoSchema;
      } catch (err) {
        return;
      }
    }

    if (!baseTodo) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPercent = Math.max(0, Math.min(((e.clientX - rect.left) / rect.width) * 100, 100));
    const yPercent = Math.max(0, Math.min(((e.clientY - rect.top) / rect.height) * 100, 100));

    const urgencyScore = positionToScore(xPercent);
    const futureScore = positionToScore(100 - yPercent);

    onUpdateTodo({
      ...baseTodo,
      urgency_score: urgencyScore,
      future_score: futureScore,
      completed: baseTodo.completed ?? false
    });
    setDraggingFromStack(null);
  }, [draggingFromStack, onUpdateTodo, canvasRef]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const clientX = e.clientX;
    const clientY = e.clientY;

    window.requestAnimationFrame(() => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const xPercent = Math.max(0, Math.min(((clientX - rect.left) / rect.width) * 100, 100));
        const yPercent = Math.max(0, Math.min(((clientY - rect.top) / rect.height) * 100, 100));
        
        setLocalDragPos({ x: xPercent, y: yPercent });
        
        const urgencyScore = positionToScore(xPercent);
        const futureScore = positionToScore(100 - yPercent);
        setPreviewScores({ x: urgencyScore, y: futureScore });
      }
    });
  }, [canvasRef]);

  return {
    draggingTodo,
    localDragPos,
    previewScores,
    isDraggingFromStack,
    draggingFromStack,
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
  };
};

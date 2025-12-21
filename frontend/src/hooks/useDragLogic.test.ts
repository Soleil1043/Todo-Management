import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useDragLogic } from './useDragLogic'
import { TodoSchema } from '../types/todo'

// Mock quadrantUtils
vi.mock('../utils/quadrantUtils', () => ({
  positionToScore: (position: number) => Math.round((position / 100) * 6 - 3),
  getQuadrantColor: vi.fn(),
  getPointColor: vi.fn(),
  getQuadrantBorderColor: vi.fn(),
  getQuadrantLabel: vi.fn(),
  scoreToPosition: vi.fn(),
}))

describe('useDragLogic', () => {
  const mockTodos: TodoSchema[] = [
    {
      id: 1,
      title: '测试任务1',
      description: '描述1',
      completed: false,
      future_score: 1,
      urgency_score: 2,
    },
    {
      id: 2,
      title: '测试任务2',
      description: '描述2',
      completed: true,
      future_score: -1,
      urgency_score: -2,
    },
  ]

  const mockCanvasRef = {
    current: {
      getBoundingClientRect: () => ({
        left: 0,
        top: 0,
        width: 400,
        height: 400,
      }),
    } as HTMLDivElement,
  }

  const defaultProps = {
    canvasRef: mockCanvasRef,
    todos: mockTodos,
    onUpdateTodo: vi.fn(),
    setSelectedTodoId: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    // Mock requestAnimationFrame
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => cb(0))
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('initializes with default state', () => {
    const { result } = renderHook(() => useDragLogic(defaultProps))
    
    expect(result.current.draggingTodo).toBeNull()
    expect(result.current.localDragPos).toBeNull()
    expect(result.current.previewScores).toBeNull()
    expect(result.current.isDraggingFromStack).toBe(false)
    expect(result.current.draggingFromStack).toBeNull()
  })

  it('handles mouse down event', () => {
    const { result } = renderHook(() => useDragLogic(defaultProps))
    
    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 100,
    } as unknown as React.MouseEvent

    act(() => {
      result.current.handleMouseDown(mockEvent, mockTodos[0])
    })

    expect(mockEvent.preventDefault).toHaveBeenCalled()
    expect(result.current.draggingTodo).toEqual(mockTodos[0])
    expect(defaultProps.setSelectedTodoId).toHaveBeenCalledWith(1)
    // 100px 在 400px 宽度的 canvas 中是 25%
    expect(result.current.localDragPos).toEqual({ x: 25, y: 25 })
  })

  it('handles mouse move event during drag', () => {
    const { result } = renderHook(() => useDragLogic(defaultProps))
    
    // 先开始拖拽
    const mockMouseDownEvent = {
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 100,
    } as unknown as React.MouseEvent

    act(() => {
      result.current.handleMouseDown(mockMouseDownEvent, mockTodos[0])
    })

    // 然后移动
    const mockMouseMoveEvent = {
      clientX: 200,
      clientY: 200,
    } as unknown as React.MouseEvent

    act(() => {
      result.current.handleMouseMove(mockMouseMoveEvent)
      vi.runAllTimers()
    })

    // 200px 在 400px 宽度的 canvas 中是 50%
    expect(result.current.localDragPos).toEqual({ x: 50, y: 50 })
    expect(result.current.previewScores).toEqual({ x: 0, y: 0 }) // 50% 对应 score 0
  }) // 基于positionToScore的计算

  it('handles mouse up event and updates todo', () => {
    const { result } = renderHook(() => useDragLogic(defaultProps))
    
    // 开始拖拽
    const mockMouseDownEvent = {
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 100,
    } as unknown as React.MouseEvent

    act(() => {
      result.current.handleMouseDown(mockMouseDownEvent, mockTodos[0])
    })

    // 移动鼠标到新位置
    const mockMouseMoveEvent = {
      clientX: 300,
      clientY: 100,
    } as unknown as React.MouseEvent

    act(() => {
      result.current.handleMouseMove(mockMouseMoveEvent)
    })

    // 释放鼠标
    act(() => {
      result.current.handleMouseUp()
    })

    expect(defaultProps.onUpdateTodo).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        urgency_score: 2,
        future_score: 2,
      })
    )
    
    expect(result.current.draggingTodo).toBeNull()
    expect(result.current.localDragPos).toBeNull()
    expect(result.current.previewScores).toBeNull()
  })

  it('handles touch events', () => {
    const { result } = renderHook(() => useDragLogic(defaultProps))
    
    const mockTouchEvent = {
      preventDefault: vi.fn(),
      touches: [{
        clientX: 150,
        clientY: 150,
      }],
    } as unknown as React.TouchEvent

    act(() => {
      result.current.handleTouchStart(mockTouchEvent, mockTodos[1])
    })

    expect(result.current.draggingTodo).toEqual(mockTodos[1])
    expect(defaultProps.setSelectedTodoId).toHaveBeenCalledWith(2)
    // 150px 在 400px 宽度的 canvas 中是 37.5%
    expect(result.current.localDragPos).toEqual({ x: 37.5, y: 37.5 })
  })

  it('handles touch move event', () => {
    const { result } = renderHook(() => useDragLogic(defaultProps))
    
    // 先开始触摸
    const mockTouchStartEvent = {
      preventDefault: vi.fn(),
      touches: [{ clientX: 150, clientY: 150 }]
    } as unknown as React.TouchEvent

    act(() => {
      result.current.handleTouchStart(mockTouchStartEvent, mockTodos[1])
    })

    // 然后移动
    const mockTouchMoveEvent = {
      preventDefault: vi.fn(),
      touches: [{ clientX: 250, clientY: 250 }]
    } as unknown as React.TouchEvent

    act(() => {
      result.current.handleTouchMove(mockTouchMoveEvent)
      vi.runAllTimers()
    })

    // 250px 在 400px 宽度的 canvas 中是 62.5%
    expect(result.current.localDragPos).toEqual({ x: 62.5, y: 62.5 })
  })

  it('handles unassigned drag start', () => {
    const { result } = renderHook(() => useDragLogic(defaultProps))
    
    const mockDragEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    } as unknown as React.DragEvent

    act(() => {
      result.current.handleUnassignedDragStart(mockDragEvent, mockTodos[0])
    })

    expect(mockDragEvent.dataTransfer.effectAllowed).toBe('move')
    expect(mockDragEvent.dataTransfer.setData).toHaveBeenCalledWith(
      'application/json',
      JSON.stringify(mockTodos[0])
    )
    expect(result.current.isDraggingFromStack).toBe(true)
    expect(result.current.draggingFromStack).toEqual(mockTodos[0])
  })

  it('handles unassigned drag end', () => {
    const { result } = renderHook(() => useDragLogic(defaultProps))
    
    // 先开始拖拽
    const mockDragEvent = {
      dataTransfer: {
        effectAllowed: '',
        setData: vi.fn(),
      },
    } as unknown as React.DragEvent

    act(() => {
      result.current.handleUnassignedDragStart(mockDragEvent, mockTodos[0])
    })

    // 结束拖拽
    act(() => {
      result.current.handleUnassignedDragEnd()
    })

    expect(result.current.isDraggingFromStack).toBe(false)
    expect(result.current.draggingFromStack).toBeNull()
    expect(result.current.previewScores).toBeNull()
    expect(result.current.localDragPos).toBeNull()
  })

  it('handles canvas drop event', () => {
    const { result } = renderHook(() => useDragLogic(defaultProps))
    
    const mockDropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 200,
      clientY: 200,
      dataTransfer: {
        getData: vi.fn().mockReturnValue(JSON.stringify(mockTodos[0])),
      },
    } as unknown as React.DragEvent

    act(() => {
      result.current.handleCanvasDrop(mockDropEvent)
    })

    expect(mockDropEvent.preventDefault).toHaveBeenCalled()
    expect(mockDropEvent.stopPropagation).toHaveBeenCalled()
    expect(defaultProps.onUpdateTodo).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        urgency_score: 0,
        future_score: 0,
      })
    )
  })

  it('handles canvas drag over event', () => {
    const { result } = renderHook(() => useDragLogic(defaultProps))
    
    const mockDragOverEvent = {
      preventDefault: vi.fn(),
      dataTransfer: {
        dropEffect: '',
      },
      clientX: 250,
      clientY: 150,
    } as unknown as React.DragEvent

    act(() => {
      result.current.handleCanvasDragOver(mockDragOverEvent)
    })

    expect(mockDragOverEvent.preventDefault).toHaveBeenCalled()
    expect(mockDragOverEvent.dataTransfer.dropEffect).toBe('move')
    // 250px 是 62.5%, 150px 是 37.5%
    expect(result.current.localDragPos).toEqual({ x: 62.5, y: 37.5 })
    expect(result.current.previewScores).toEqual({ x: 1, y: 1 }) // 62.5% -> 1, 37.5% (100-37.5=62.5%) -> 1
  })

  it('handles invalid JSON in data transfer', () => {
    const { result } = renderHook(() => useDragLogic(defaultProps))
    
    const mockDropEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      clientX: 200,
      clientY: 200,
      dataTransfer: {
        getData: vi.fn().mockReturnValue('invalid json'),
      },
    } as unknown as React.DragEvent

    act(() => {
      result.current.handleCanvasDrop(mockDropEvent)
    })

    // 不应该调用onUpdateTodo，因为JSON解析失败
    expect(defaultProps.onUpdateTodo).not.toHaveBeenCalled()
  })

  it('handles missing canvas reference', () => {
    const propsWithoutCanvas = {
      ...defaultProps,
      canvasRef: { current: null },
    }

    const { result } = renderHook(() => useDragLogic(propsWithoutCanvas))
    
    const mockEvent = {
      preventDefault: vi.fn(),
      clientX: 100,
      clientY: 100,
    } as unknown as React.MouseEvent

    act(() => {
      result.current.handleMouseDown(mockEvent, mockTodos[0])
    })

    // 应该仍然设置draggingTodo，但localDragPos为null
    expect(result.current.draggingTodo).toEqual(mockTodos[0])
    expect(result.current.localDragPos).toBeNull()
  })
})
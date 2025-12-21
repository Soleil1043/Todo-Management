import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { TodoSchema, TodoFormData } from '../types/todo'
import { todoApi, recordToArray } from '../services/api'
import { useToast } from '../components/Toast'
import { useLoading } from '../contexts/LoadingContext'

/**
 * 待办事项核心业务逻辑 Hook
 */
export function useAppTodos(autoTrash: boolean = false) {
  const [todos, setTodos] = useState<TodoSchema[]>([])
  const todosRef = useRef<TodoSchema[]>(todos)

  // 同步 todos 到 ref，以便在 useCallback 中使用而不增加依赖
  useEffect(() => {
    todosRef.current = todos
  }, [todos])

  const { showToast } = useToast()
  const { setLoading } = useLoading()

  /**
   * 加载所有待办事项
   */
  const loadTodos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await todoApi.getTodos()
      const todoArray = recordToArray(data)
      setTodos(todoArray)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载待办事项失败'
      showToast(errorMessage, 'error')
      console.error('Error loading todos:', err)
    } finally {
      setLoading(false)
    }
  }, [setLoading, showToast])

  /**
   * 添加待办事项
   */
  const handleAddTodo = useCallback(async (data: TodoFormData) => {
    try {
      const newTodo = await todoApi.createTodo({
        ...data,
        completed: false
      } as TodoSchema)
      setTodos(prevTodos => [...prevTodos, newTodo])
      showToast('添加成功', 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '添加待办事项失败'
      showToast(errorMessage, 'error')
      console.error('Error adding todo:', err)
    }
  }, [showToast])

  /**
   * 切换完成状态
   */
  const handleToggleComplete = useCallback(async (id: number) => {
    // 获取当前待办的状态
    const currentTodo = todosRef.current.find(t => t.id === id)
    if (!currentTodo) return

    const newCompletedStatus = !currentTodo.completed

    // 乐观更新：先在本地更新状态
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: newCompletedStatus } : todo
      )
    )

    // 如果开启了自动移入回收站，且新状态是完成，则直接移入回收站
    if (autoTrash && newCompletedStatus) {
      try {
        await todoApi.deleteTodo(id)
        setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id))
        showToast('已完成并移至回收站', 'success')
      } catch (err) {
        // 如果删除失败，我们需要恢复状态
        setTodos(prevTodos =>
          prevTodos.map(todo =>
            todo.id === id ? { ...todo, completed: !newCompletedStatus } : todo
          )
        )
        const errorMessage = err instanceof Error ? err.message : '操作失败'
        showToast(errorMessage, 'error')
        console.error('Error auto-trashing todo:', err)
      }
      return
    }

    try {
      const updatedTodo = await todoApi.toggleTodoStatus(id)
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      )
    } catch (err) {
      // 回滚
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? { ...todo, completed: !newCompletedStatus } : todo
        )
      )
      const errorMessage = err instanceof Error ? err.message : '更新状态失败'
      showToast(errorMessage, 'error')
      console.error('Error toggling status:', err)
    }
  }, [autoTrash, showToast])

  /**
   * 删除待办事项（移至回收站）
   */
  const handleDeleteTodo = useCallback(async (id: number) => {
    try {
      await todoApi.deleteTodo(id)
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id))
      showToast('已移动到回收站', 'success')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除待办事项失败'
      showToast(errorMessage, 'error')
      console.error('Error deleting todo:', err)
    }
  }, [showToast])

  /**
   * 更新待办事项
   */
  const handleUpdateTodo = useCallback(async (id: number, title: string, description: string, future_score?: number, urgency_score?: number, start_time?: string, end_time?: string) => {
    let previousTodos: TodoSchema[] = todosRef.current;
    
    try {
      setTodos(prevTodos => {
        previousTodos = prevTodos;
        return prevTodos.map(todo =>
          todo.id === id
            ? { ...todo, title, description, future_score, urgency_score, start_time, end_time }
            : todo
        )
      })

      const updatedTodo = await todoApi.updateTodo(id, {
        title,
        description,
        future_score: future_score ?? undefined,
        urgency_score: urgency_score ?? undefined,
        start_time,
        end_time,
        operation_source: 'editor',
      })

      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === id ? updatedTodo : todo
        )
      )
    } catch (err) {
      if (previousTodos.length > 0) {
        setTodos(previousTodos);
      }
      const errorMessage = err instanceof Error ? err.message : '更新待办事项失败'
      showToast(errorMessage, 'error')
      console.error('Error updating todo:', err)
    }
  }, [showToast])

  /**
   * 更新待办事项分数（四象限操作）
   */
  const handleUpdateTodoWithScores = useCallback(async (updatedTodo: TodoSchema) => {
    // 保存旧状态以便回滚
    let previousTodos: TodoSchema[] = todosRef.current;
    
    try {
      setTodos(prevTodos => {
        previousTodos = prevTodos;
        return prevTodos.map(todo =>
          todo.id === updatedTodo.id ? updatedTodo : todo
        )
      })

      // 不在四象限移动时显示全局遮罩，避免打断用户操作
      // 但我们可以记录正在更新的状态，如果需要可以在 UI 上显示小转圈
      
      const savedTodo = await todoApi.updateTodo(updatedTodo.id!, {
        title: updatedTodo.title,
        description: updatedTodo.description || '',
        future_score: updatedTodo.future_score,
        urgency_score: updatedTodo.urgency_score,
        start_time: updatedTodo.start_time,
        end_time: updatedTodo.end_time,
        operation_source: 'quadrant',
      })
      
      setTodos(prevTodos =>
        prevTodos.map(todo =>
          todo.id === savedTodo.id ? savedTodo : todo
        )
      )
    } catch (err) {
      // 出错时回滚到之前的状态，而不是重新加载全部
      if (previousTodos.length > 0) {
        setTodos(previousTodos);
      }
      
      const errorMessage = err instanceof Error ? err.message : '更新待办事项失败'
      showToast(errorMessage, 'error')
      console.error('Error updating todo:', err)
    }
  }, [showToast]) // 移除对 loadTodos 的依赖

  /**
   * 恢复待办事项（从回收站）
   */
  const handleRestoreTodo = useCallback(async (id: number) => {
    try {
      const restoredTodo = await todoApi.restoreTodo(id)
      setTodos(prevTodos => {
        const exists = prevTodos.some(t => t.id === id)
        if (exists) {
          return prevTodos.map(t => (t.id === id ? restoredTodo : t))
        }
        return [...prevTodos, restoredTodo]
      })
      showToast('已恢复待办事项', 'success')
      return restoredTodo
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '恢复失败'
      showToast(errorMessage, 'error')
      throw err
    }
  }, [showToast])

  /**
   * 批量恢复待办事项
   */
  const handleBatchRestore = useCallback(async (ids: number[]) => {
    try {
      const result = await todoApi.batchRestoreTodos(ids)
      setTodos(prevTodos => {
        const newTodos = [...prevTodos]
        result.restored_todos.forEach(todo => {
          const index = newTodos.findIndex(t => t.id === todo.id)
          if (index !== -1) {
            newTodos[index] = todo
          } else {
            newTodos.push(todo)
          }
        })
        return newTodos
      })
      showToast(`已恢复 ${result.restored_todos.length} 个待办事项`, 'success')
      return result.restored_todos
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '恢复失败'
      showToast(errorMessage, 'error')
      throw err
    }
  }, [showToast])

  // 统计数据
  const completedCount = useMemo(() =>
    todos.filter(todo => todo.completed).length,
    [todos]
  )
  
  const totalCount = todos.length

  return {
    todos,
    loadTodos,
    handleAddTodo,
    handleToggleComplete,
    handleDeleteTodo,
    handleUpdateTodo,
    handleUpdateTodoWithScores,
    handleRestoreTodo,
    handleBatchRestore,
    completedCount,
    totalCount
  }
}

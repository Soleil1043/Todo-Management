import { useCallback, useRef } from 'react'

/**
 * 批量状态更新钩子 - 用于优化多个状态更新的性能
 * 通过防抖机制减少不必要的重新渲染
 */
export function useBatchState<T>() {
  const pendingUpdates = useRef<((prevState: T) => T)[]>([])
  const timeoutId = useRef<NodeJS.Timeout | null>(null)

  const batchUpdate = useCallback((updateFn: (prevState: T) => T) => {
    pendingUpdates.current.push(updateFn)
    
    // 清除之前的定时器
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }
    
    // 设置新的定时器，在下一个事件循环中执行所有更新
    timeoutId.current = setTimeout(() => {
      if (pendingUpdates.current.length > 0) {
        // 合并所有更新函数
        const combinedUpdate = (prevState: T) => {
          let newState = prevState
          pendingUpdates.current.forEach(update => {
            newState = update(newState)
          })
          pendingUpdates.current = []
          return newState
        }
        
        // 执行合并后的更新
        return combinedUpdate
      }
    }, 0)
  }, [])

  return { batchUpdate }
}

/**
 * 优化的选择器钩子 - 用于从复杂对象中选择特定属性
 * 通过浅比较减少不必要的更新
 */
export function useShallowSelector<T, K>(
  obj: T,
  selector: (obj: T) => K
): K {
  const selected = selector(obj)
  const prevSelected = useRef<K>()
  
  // 浅比较
  const hasChanged = JSON.stringify(selected) !== JSON.stringify(prevSelected.current)
  
  if (hasChanged) {
    prevSelected.current = selected
  }
  
  return prevSelected.current || selected
}
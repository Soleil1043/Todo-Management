import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useTimeValidation } from './useTimeValidation'

// Mock API服务
vi.mock('../services/api', () => ({
  isValidTimeFormat: (time: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time),
}))

describe('useTimeValidation', () => {
  it('initializes with no error', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    expect(result.current.error).toBeNull()
    expect(typeof result.current.setError).toBe('function')
    expect(typeof result.current.validateTime).toBe('function')
  })

  it('validates correct time format', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    act(() => {
      const isValid = result.current.validateTime('09:30', '17:45')
      expect(isValid).toBe(true)
    })
    
    expect(result.current.error).toBeNull()
  })

  it('validates invalid start time format', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    act(() => {
      const isValid = result.current.validateTime('25:30', '17:45')
      expect(isValid).toBe(false)
    })
    
    expect(result.current.error).toBe('开始时间格式不正确，请使用 HH:MM 格式')
  })

  it('validates invalid end time format', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    act(() => {
      const isValid = result.current.validateTime('09:30', '24:45')
      expect(isValid).toBe(false)
    })
    
    expect(result.current.error).toBe('结束时间格式不正确，请使用 HH:MM 格式')
  })

  it('validates start time before end time', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    act(() => {
      const isValid = result.current.validateTime('17:30', '09:45')
      expect(isValid).toBe(false)
    })
    
    expect(result.current.error).toBe('开始时间必须早于结束时间')
  })

  it('validates equal start and end time', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    act(() => {
      const isValid = result.current.validateTime('09:30', '09:30')
      expect(isValid).toBe(false)
    })
    
    expect(result.current.error).toBe('开始时间必须早于结束时间')
  })

  it('allows empty time fields', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    act(() => {
      const isValid = result.current.validateTime('', '')
      expect(isValid).toBe(true)
    })
    
    expect(result.current.error).toBeNull()
  })

  it('allows only start time', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    act(() => {
      const isValid = result.current.validateTime('09:30', '')
      expect(isValid).toBe(true)
    })
    
    expect(result.current.error).toBeNull()
  })

  it('allows only end time', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    act(() => {
      const isValid = result.current.validateTime('', '17:45')
      expect(isValid).toBe(true)
    })
    
    expect(result.current.error).toBeNull()
  })

  it('validates edge case times correctly', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    // 边界时间测试
    act(() => {
      const isValid1 = result.current.validateTime('00:00', '00:01')
      expect(isValid1).toBe(true)
    })
    
    act(() => {
      const isValid2 = result.current.validateTime('23:58', '23:59')
      expect(isValid2).toBe(true)
    })
    
    expect(result.current.error).toBeNull()
  })

  it('manually sets error', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    act(() => {
      result.current.setError('自定义错误信息')
    })
    
    expect(result.current.error).toBe('自定义错误信息')
    
    // 验证时间应该清除手动设置的错误
    act(() => {
      const isValid = result.current.validateTime('09:30', '17:45')
      expect(isValid).toBe(true)
    })
    
    expect(result.current.error).toBeNull()
  })

  it('clears error when validation passes', () => {
    const { result } = renderHook(() => useTimeValidation())
    
    // 先设置一个错误
    act(() => {
      result.current.setError('初始错误')
    })
    
    expect(result.current.error).toBe('初始错误')
    
    // 验证通过的时间应该清除错误
    act(() => {
      result.current.validateTime('09:30', '17:45')
    })
    
    expect(result.current.error).toBeNull()
  })
})
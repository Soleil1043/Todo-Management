import { useEffect, useRef, useCallback } from 'react'
import * as Sentry from "@sentry/react"
import { onCLS, onINP, onLCP, onFCP, onTTFB, Metric } from 'web-vitals'

/**
 * 性能监控钩子
 * 用于监控组件渲染时间和内存使用情况
 */
export function usePerformanceMonitoring(componentName: string) {
  const renderCount = useRef(0)
  const renderStartTime = useRef<number>(performance.now())

  // 在组件主体中记录开始时间（每次渲染都会执行）
  renderStartTime.current = performance.now()

  useEffect(() => {
    renderCount.current += 1
    const renderEndTime = performance.now()
    const renderTime = renderEndTime - renderStartTime.current
    
    // 如果渲染时间超过阈值（例如 16ms），记录警告
    if (renderTime > 16) {
      const message = `[Performance] ${componentName} 渲染耗时: ${renderTime.toFixed(2)}ms (第 ${renderCount.current} 次渲染)`;
      console.warn(message)
      
      Sentry.addBreadcrumb({
        category: 'performance',
        message: message,
        level: 'warning',
      });
    } else if (process.env.NODE_ENV === 'development') {
      console.log(
        `[Performance] ${componentName} 渲染耗时: ${renderTime.toFixed(2)}ms ` +
        `(第 ${renderCount.current} 次渲染)`
      )
    }
  })

  // 清理函数
  useEffect(() => {
    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Performance] ${componentName} 组件卸载 - 总渲染次数: ${renderCount.current}`
        )
      }
    }
  }, [componentName])
}

/**
 * 内存使用监控钩子
 */
export function useMemoryMonitoring(componentName: string) {
  const memoryInfo = useRef<any>(null)

  const checkMemory = useCallback(() => {
    if ('memory' in performance) {
      memoryInfo.current = (performance as any).memory
      const usedMB = (memoryInfo.current.usedJSHeapSize / 1024 / 1024).toFixed(2);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Memory] ${componentName} 内存使用情况:`,
          `已用: ${usedMB}MB`,
          `总分配: ${(memoryInfo.current.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          `限制: ${(memoryInfo.current.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        )
      }

      // 如果内存占用过高（例如超过 500MB），上报警告
      if (parseFloat(usedMB) > 500) {
        Sentry.captureMessage(`High memory usage in ${componentName}: ${usedMB}MB`, 'warning');
      }
    }
  }, [componentName])

  useEffect(() => {
    // 定期检查内存使用
    const interval = setInterval(checkMemory, 30000) // 30秒检查一次
    
    return () => clearInterval(interval)
  }, [checkMemory])

  return { checkMemory }
}

/**
 * 网络请求性能监控钩子
 */
export function useNetworkMonitoring() {
  const requestTimes = useRef<Map<string, number>>(new Map())

  const startTiming = useCallback((requestId: string) => {
    requestTimes.current.set(requestId, performance.now())
  }, [])

  const endTiming = useCallback((requestId: string) => {
    const startTime = requestTimes.current.get(requestId)
    if (startTime) {
      const duration = performance.now() - startTime
      requestTimes.current.delete(requestId)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Network] 请求 ${requestId} 耗时: ${duration.toFixed(2)}ms`)
      }

      // 如果请求耗时超过 2 秒，记录到 Sentry 面包屑
      if (duration > 2000) {
        Sentry.addBreadcrumb({
          category: 'network',
          message: `Slow request ${requestId}: ${duration.toFixed(2)}ms`,
          level: 'warning',
        });
      }
      
      return duration
    }
    return 0
  }, [])

  return { startTiming, endTiming }
}

/**
 * Web Vitals 监控
 */
export function useWebVitals() {
  useEffect(() => {
    const reportWebVitals = (metric: Metric) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, metric.value);
      }
      
      // 可以将这些指标发送到 Sentry 或其他分析服务
      Sentry.addBreadcrumb({
        category: 'web-vitals',
        message: `${metric.name}: ${metric.value}`,
        level: 'info',
      });
    };

    onCLS(reportWebVitals);
    onINP(reportWebVitals);
    onLCP(reportWebVitals);
    onFCP(reportWebVitals);
    onTTFB(reportWebVitals);
  }, []);
}

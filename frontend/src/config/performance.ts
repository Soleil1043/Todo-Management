/**
 * 应用性能优化配置
 * 包含各种性能优化策略和最佳实践
 */

// React 渲染优化配置
export const RENDER_OPTIMIZATION = {
  // 是否启用 React.StrictMode（开发模式下）
  strictMode: process.env.NODE_ENV === 'development',
  
  // 并发渲染配置
  concurrentFeatures: {
    // 是否启用并发特性
    enabled: true,
    // 过渡更新优先级
    transitionTimeout: 5000,
  },
  
  // 批量更新配置
  batching: {
    // 是否启用自动批量更新
    enabled: true,
    // 批量更新延迟时间（毫秒）
    delay: 16, // 约1帧的时间
  },
}

// 组件懒加载配置
export const LAZY_LOADING = {
  // 回收站组件懒加载
  recycleBin: {
    enabled: true,
    // 预加载延迟（毫秒）
    preloadDelay: 1000,
  },
  
  // 外观设置组件懒加载
  appearanceSettings: {
    enabled: true,
    // 预加载延迟（毫秒）
    preloadDelay: 1000,
  },
}

// 内存优化配置
export const MEMORY_OPTIMIZATION = {
  // 虚拟列表配置（用于大量待办事项）
  virtualList: {
    enabled: true,
    // 视口外缓冲区项目数
    overscan: 5,
    // 项目高度（像素）
    itemHeight: 80,
  },
  
  // 对象池配置
  objectPool: {
    enabled: true,
    // 最大池大小
    maxSize: 100,
  },
  
  // 垃圾回收优化
  garbageCollection: {
    // 定期清理未使用的引用
    enabled: true,
    // 清理间隔（毫秒）
    interval: 30000, // 30秒
  },
}

// 网络优化配置
export const NETWORK_OPTIMIZATION = {
  // 请求缓存配置
  requestCache: {
    enabled: true,
    // 缓存过期时间（毫秒）
    ttl: 300000, // 5分钟
    // 最大缓存条目数
    maxSize: 50,
  },
  
  // 请求去重配置
  requestDedup: {
    enabled: true,
    // 去重时间窗口（毫秒）
    window: 1000, // 1秒
  },
  
  // 批量请求配置
  batchRequests: {
    enabled: true,
    // 批处理延迟（毫秒）
    delay: 100,
    // 最大批处理大小
    maxSize: 10,
  },
}

// 计算优化配置
export const COMPUTATION_OPTIMIZATION = {
  // 四象限计算缓存
  quadrantCalculation: {
    enabled: true,
    // 缓存大小
    cacheSize: 1000,
    // 缓存过期时间（毫秒）
    ttl: 60000, // 1分钟
  },
  
  // 优先级计算缓存
  priorityCalculation: {
    enabled: true,
    // 缓存大小
    cacheSize: 500,
    // 缓存过期时间（毫秒）
    ttl: 30000, // 30秒
  },
  
  // 时间验证缓存
  timeValidation: {
    enabled: true,
    // 缓存大小
    cacheSize: 200,
    // 缓存过期时间（毫秒）
    ttl: 600000, // 10分钟
  },
}

// 性能监控配置
export const PERFORMANCE_MONITORING = {
  // 是否启用性能监控
  enabled: process.env.NODE_ENV === 'development',
  
  // 渲染时间监控
  renderTiming: {
    enabled: true,
    // 慢渲染阈值（毫秒）
    slowRenderThreshold: 16, // 1帧
  },
  
  // 内存使用监控
  memoryMonitoring: {
    enabled: true,
    // 内存警告阈值（MB）
    warningThreshold: 100,
    // 内存严重阈值（MB）
    criticalThreshold: 200,
  },
  
  // 网络请求监控
  networkMonitoring: {
    enabled: true,
    // 慢请求阈值（毫秒）
    slowRequestThreshold: 1000,
  },
}

// 默认导出所有配置
export default {
  RENDER_OPTIMIZATION,
  LAZY_LOADING,
  MEMORY_OPTIMIZATION,
  NETWORK_OPTIMIZATION,
  COMPUTATION_OPTIMIZATION,
  PERFORMANCE_MONITORING,
}
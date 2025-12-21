# 性能优化检查清单

## 🚀 组件级优化

### 开始之前

- [ ] 使用 React DevTools 分析当前性能
- [ ] 识别实际的性能瓶颈
- [ ] 衡量优化前后的性能差异

### 组件渲染

- [ ] 对接收稳定 Props 且渲染开销大的组件使用 `React.memo`
- [ ] 为复杂的计算逻辑实现 `useMemo`
- [ ] 使用 `useCallback` 稳定函数引用
- [ ] 将大型组件拆分为更小、更专注的子组件
- [ ] 延迟加载 (Lazy load) 非立即需要的组件
- [ ] **Canvas 渲染**: 对于数据密集型可视化（如 QuadrantView），使用 HTML5 Canvas 渲染以减少 DOM 节点数量，并提升交互时的帧率。

### Props 与 State

- [ ] 保持 Props 稳定（避免在 render 中创建新的对象/数组）
- [ ] 尽可能为 Props 使用原始类型值
- [ ] 仅在必要时才提升状态 (Lift state up)
- [ ] 对于复杂的状态逻辑，考虑使用 `useReducer`
- [ ] 尽可能批量处理状态更新 (Batch state updates)

## 🎯 Hook 优化

### useMemo 使用

```typescript
// ✅ 推荐 - 缓存昂贵的计算结果
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(props.data);
}, [props.data]);

// ❌ 不推荐 - 对简单操作进行不必要的记忆化
const simpleValue = useMemo(() => {
  return props.value * 2;
}, [props.value]);
```

### useCallback 使用

```typescript
// ✅ 推荐 - 为子组件提供稳定的函数引用
const handleClick = useCallback(() => {
  doSomething(props.id);
}, [props.id]);

// ❌ 不推荐 - 对简单函数进行不必要的记忆化
const handleSubmit = useCallback(() => {
  console.log('Submitted');
}, []);
```

## 📊 列表渲染优化

### Key Props

- [ ] 始终为列表项提供稳定、唯一的 key
- [ ] 避免使用数组索引 (index) 作为 key
- [ ] 优先使用数据库 ID 或其他唯一标识符

### 虚拟化 (Virtualization)

- [ ] 对于长列表（>100 项），考虑使用虚拟化技术
- [ ] 使用 `react-window` 或 `react-virtualized` 等库
- [ ] 为大数据集实现分页加载

## 🌐 API 与数据获取

### 请求优化

- [ ] 为搜索输入实现请求防抖 (Debouncing)
- [ ] 在合适的情况下使用请求缓存
- [ ] 尽可能合并多个 API 调用
- [ ] 实现乐观更新 (Optimistic updates) 以提升用户体验

### 数据管理

- [ ] 规范化 (Normalize) 复杂的数据结构
- [ ] 实现完善的错误边界 (Error Boundaries)
- [ ] 有效使用加载状态 (Loading states)
- [ ] 考虑为页面导航实现数据预取 (Prefetching)

## 🎨 样式与资源

### CSS 优化

- [ ] 审慎使用 CSS-in-JS 方案
- [ ] 实现关键 CSS 提取
- [ ] 使用 CSS Modules 实现组件级样式作用域
- [ ] 优化 CSS 包体积

### 图片与资源优化

- [ ] 使用合适的图片格式（如 WebP, AVIF）
- [ ] 为图片实现延迟加载
- [ ] 使用 `srcset` 实现响应式图片
- [ ] 对资源进行适当的压缩

## 🔧 构建与包体积优化

### 代码分割 (Code Splitting)

- [ ] 实现基于路由的代码分割
- [ ] 将第三方库 (Vendor libraries) 单独拆分
- [ ] 对条件性功能使用动态导入 (Dynamic imports)
- [ ] 实现渐进式加载

### 包体积分析

- [ ] 定期分析包体积
- [ ] 识别并移除未使用的依赖项
- [ ] 有效利用 Tree Shaking
- [ ] 在 CI/CD 中监控包体积变化

## 🧪 测试性能

### 测试优化

- [ ] Mock 昂贵的外部依赖项
- [ ] 使用适当规模的测试数据
- [ ] 为关键路径实现性能测试
- [ ] 监控测试执行时间

### 覆盖率与性能平衡

- [ ] 在测试覆盖率与执行性能之间取得平衡
- [ ] 重点测试用户的关键操作路径
- [ ] 使用生产环境构建进行性能测试
- [ ] 实现视觉回归测试

## 📱 移动端性能

### 响应式设计

- [ ] 在真实设备上进行测试
- [ ] 优化触摸交互体验
- [ ] 实现正确的 viewport meta 标签
- [ ] 考虑移动端优先 (Mobile-first) 的设计思路

### 网络优化

- [ ] 实现 Service Workers 以支持离线功能
- [ ] 使用适当的缓存策略
- [ ] 针对弱网环境进行优化
- [ ] 实现渐进式增强 (Progressive Enhancement)

## 🔍 调试性能问题

### React DevTools Profiler

- [ ] 使用 Profiler 标签页识别运行缓慢的组件
- [ ] 分析渲染模式和频率
- [ ] 检查不必要的重渲染
- [ ] 监控组件的挂载 (Mount) 和更新时间

### 浏览器开发者工具 (Browser DevTools)

- [ ] 使用 Performance 标签页进行详细分析
- [ ] 分析网络瀑布流图 (Network waterfall charts)
- [ ] 检查内存泄漏
- [ ] 监控 JavaScript 执行时间

### 常见的性能陷阱

- [ ] 在 render 中创建新的函数或对象
- [ ] 在列表中使用不稳定的 key
- [ ] 对简单操作过度使用记忆化 (Over-memoizing)
- [ ] 未及时清理事件监听器或 Effect 副作用
- [ ] 在 render 中进行同步的 API 调用

## 📈 性能指标

### 核心 Web 指标 (Core Web Vitals)

- [ ] **LCP (最大内容渲染时间)**: < 2.5s
- [ ] **FID (首次输入延迟)**: < 100ms
- [ ] **CLS (累积布局偏移)**: < 0.1

### 自定义指标

- [ ] 可交互时间 (TTI)
- [ ] 首次内容渲染时间 (FCP)
- [ ] 包体积 (主包体积 < 500KB)
- [ ] 组件渲染耗时 (< 16ms 以保持 60fps 的流畅度)

## 🚀 部署性能

### 构建优化

- [ ] 使用生产环境构建进行性能分析
- [ ] 开启 gzip/brotli 压缩
- [ ] 实现正确的缓存头 (Caching headers)
- [ ] 为静态资源使用 CDN

### 监控

- [ ] 设置性能监控告警
- [ ] 实现真实用户监控 (RUM)
- [ ] 设定性能预算 (Performance budgets)
- [ ] 创建性能数据看板

## 🎯 性能评审流程

### 合并代码前

- [ ] 运行性能测试
- [ ] 检查对包体积的影响
- [ ] 验证 Core Web Vitals 是否有退化
- [ ] 在多种设备和浏览器上进行测试

### 定期评审

- [ ] 每月进行一次性能审计
- [ ] 每季度进行一次架构评审
- [ ] 强制执行性能预算
- [ ] 开展团队性能优化培训

## 📚 更多资源

### 工具

- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://www.npmjs.com/package/webpack-bundle-analyzer)

### 文档

- [React 性能优化官方文档](https://react.dev/learn/render-and-commit)
- [Web Vitals 指标说明](https://web.dev/vitals/)
- [性能预算最佳实践](https://web.dev/performance-budgets-101/)

---

**最后更新时间**: 2025-12-21

---

**切记**: 过早的优化是万恶之源。在优化之前，请务必先进行测量！

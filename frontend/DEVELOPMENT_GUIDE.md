# 开发体验优化指南

## 🚀 快速开始

### 前置条件

- Node.js 18.x 或 20.x
- npm 9.x 或更高版本
- Python 3.10+ (用于后端服务)

### 安装

```bash
cd frontend
npm install
```

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 以监听模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage:component

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 📁 项目结构

```text
src/
├── components/          # React 组件
│   ├── DashboardView.tsx # 数据分析仪表盘
│   ├── MatrixView.tsx    # 优先级矩阵
│   ├── QuadrantView.tsx  # 艾森豪威尔矩阵
│   ├── AppearanceSettings.tsx # 外观设置与自定义
│   ├── Sidebar.tsx      # 导航栏
│   └── ...
├── contexts/           # React Context 提供者
│   ├── TodoContext.tsx   # 待办事项数据与逻辑
│   ├── SettingsContext.tsx # 应用偏好设置
│   └── LoadingContext.tsx # 全局加载状态
├── hooks/              # 自定义 React hooks
│   ├── useAppTodos.ts    # 主要待办事项操作
│   ├── useAppSettings.ts # 设置管理
│   ├── useTimeValidation.ts # 时间校验
│   ├── useDragLogic.ts    # 拖拽逻辑
│   └── ...
├── services/           # API 服务
│   └── api.ts           # Axios 服务封装
├── config/             # 全局配置
│   ├── sentry.ts        # Sentry 初始化
│   └── performance.ts   # 性能追踪配置
├── utils/              # 工具函数
│   └── quadrantUtils.ts # 象限计算工具
├── types/              # TypeScript 类型定义
│   └── todo.ts
└── styles/             # CSS 样式表
    ├── Common.css
    └── ...
```

## 🧪 测试策略

### 测试类型

1. **组件测试** - React 组件的单元测试
2. **Hook 测试** - 自定义 React hooks 的测试
3. **工具函数测试** - 工具函数的单元测试
4. **E2E 测试** - 端到端测试 (使用 Playwright)

### 测试命令

```bash
# 运行所有测试
npm test

# 以监听模式运行测试
npm run test:watch

# 仅运行组件测试
npm test -- --exclude="**/e2e/**" --exclude="**/api.test.ts"

# 运行测试并生成覆盖率报告
npm run test:coverage:component

# 运行 E2E 测试
npm run test:e2e
```

### 测试覆盖率目标

- **高优先级组件**: 90%+ 覆盖率
- **中优先级组件**: 80%+ 覆盖率
- **低优先级组件**: 70%+ 覆盖率

## 🛡️ 错误与性能监控

### 错误边界 (Error Boundary)

应用被封装在 `ErrorBoundary` 组件中，以优雅地捕获和处理渲染错误。它提供了后备 UI，并允许用户重试或刷新页面。

### Sentry 集成

集成 Sentry 用于实时错误追踪和性能监控。

- 要启用 Sentry，请在 `.env` 文件中添加您的 DSN：`VITE_SENTRY_DSN=your_dsn_here`
- 错误会被 `ErrorBoundary` 自动捕获并报告给 Sentry。

### 性能监控

- **Web Vitals**: 使用 `web-vitals` 库监控核心指标 (CLS, FID, LCP, FCP, TTFB)。
- **自定义 Hooks**:
  - `usePerformanceMonitoring`: 监控组件渲染时间。
  - `useMemoryMonitoring`: 监控内存使用情况。
  - `useNetworkMonitoring`: 监控 API 请求性能。
- 性能数据在开发环境下记录到控制台，并在生产环境下作为面包屑 (breadcrumbs) 发送到 Sentry。

## ⚡ 性能优化

### 已实现的优化

1. **React.memo** - 组件记忆化
2. **useMemo** - 昂贵计算结果缓存
3. **useCallback** - 稳定函数引用
4. **代码分割 (Code Splitting)** - 对大型组件进行延迟加载

### 优化监控

```bash
# 构建并分析包体积
npm run build
ls -lh dist/assets/
```

### 性能最佳实践

- 对渲染开销大的组件使用 `React.memo`
- 使用 `useMemo` 缓存复杂计算结果
- 使用 `useCallback` 稳定传递给子组件的回调函数
- 实现乐观 UI 更新
- 在 hooks 中正确配置依赖数组

## 🎯 代码质量

### 代码规范与格式化

```bash
# 运行 ESLint
npm run lint

# 运行 TypeScript 类型检查
npm run typecheck
```

### 代码标准

- 使用 TypeScript 确保类型安全
- 遵循 React 最佳实践
- 编写完善的测试用例
- 为复杂逻辑编写文档注释
- 使用具有明确意义的变量命名

## 🔧 开发工具

### 推荐的 VS Code 扩展

1. **ESLint** - 实时代码规范检查
2. **Prettier** - 代码格式化
3. **TypeScript Vue Plugin** - TypeScript 支持
4. **Vitest** - 测试运行器集成
5. **GitLens** - Git 集成增强

### 开发配置

项目包含以下配置：

- **ESLint 配置** (`.eslintrc.json`)
- **TypeScript 配置** (`tsconfig.json`)
- **Vitest 配置** (`vitest.config.ts`)
- **Vite 配置** (`vite.config.ts`)

## 📊 调试与分析

### React Developer Tools

安装浏览器扩展 React Developer Tools 用于：

- 查看组件树结构
- 调试 Props 和 State
- 进行性能分析 (Profiling)

### 控制台调试

```typescript
// 开发环境下的调试日志
if (process.env.NODE_ENV === 'development') {
  console.log('调试信息:', data);
}
```

### 性能分析

使用 React DevTools 的 Profiler 标签页：

- 识别性能瓶颈
- 分析组件渲染耗时
- 优化不必要的重渲染

## 🚦 CI/CD 流水线

### GitHub Actions 工作流

CI 流水线会自动执行以下任务：

1. 运行组件测试 (支持 Node.js 18.x 和 20.x)
2. 生成覆盖率报告
3. 执行代码规范检查和类型检查
4. 构建应用程序
5. 分析包体积
6. 在 PR 下方自动回复覆盖率状态

### Pre-commit 钩子

Pre-commit 钩子确保：

- 提交代码前测试必须通过
- 代码符合规范
- TypeScript 编译成功

## 📈 监控指标

### 测试覆盖率

- 自动生成覆盖率报告
- 可在 `coverage/` 目录下查看 HTML 格式报告
- CI 流程中会强制执行覆盖率阈值检查

### 包体积分析

- 在 CI 中监控包体积
- 配置了性能预算 (Performance Budgets)
- 包体积过大时会发出警告

## 🎯 开发工作流

### 功能开发

1. 创建功能分支 (feature branch)
2. 实现组件并编写配套测试
3. 确保覆盖率达到目标阈值
4. 运行规范检查和类型检查
5. 创建 Pull Request
6. CI 自动验证变更

### Bug 修复

1. 首先编写一个能够复现该 Bug 的失败测试
2. 实现修复逻辑
3. 确保所有测试通过
4. 根据需要更新相关文档

### 性能改进

1. 分析当前性能表现
2. 实现优化策略
3. 测量改进效果
4. 如果适用，添加性能基准测试

## 🔗 常用链接

- [React 官方文档](https://react.dev/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Vitest 官方文档](https://vitest.dev/)
- [Vite 官方文档](https://vitejs.dev/)
- [Testing Library 官方文档](https://testing-library.com/)

## 🤝 贡献指南

1. 遵循既定的开发工作流
2. 为新功能编写测试用例
3. 保持代码质量标准
4. 同步更新相关文档
5. 合并前确保 CI 通过

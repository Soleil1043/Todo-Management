# 🎨 Todo Management Frontend

[![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Axios](https://img.shields.io/badge/Axios-1.6-5A29E4?style=for-the-badge&logo=axios&logoColor=white)](https://axios-http.com/)

现代化的React + TypeScript前端应用，为Todo Management系统提供完整的用户界面和交互体验。

## ✨ 核心功能

### 📝 待办事项管理
- ✅ **创建待办事项** - 支持标题、描述、优先级和时间规划
- ✅ **编辑功能** - 实时编辑标题、描述、时间信息
- ✅ **状态管理** - 标记完成/未完成状态
- ✅ **优先级系统** - 高/中/低三级优先级，可视化标识
- ✅ **时间规划** - 开始时间和结束时间选择

### 🗂️ 回收站系统
- ✅ **软删除** - 删除的项目移至回收站
- ✅ **恢复功能** - 从回收站恢复误删的项目
- ✅ **永久删除** - 彻底删除回收站中的项目
- ✅ **批量清空** - 一键清空整个回收站

### 📊 智能统计
- ✅ **实时统计** - 显示总数、已完成、待完成数量
- ✅ **回收站计数** - 显示回收站中的项目数量
- ✅ **动态更新** - 数据变化时自动更新统计

### 🎯 用户体验
- ✅ **响应式设计** - 完美适配桌面端和移动端
- ✅ **现代化UI** - 卡片式设计，优雅的视觉效果
- ✅ **加载状态** - 优雅的加载动画和状态提示
- ✅ **错误处理** - 友好的错误提示和恢复机制
- ✅ **实时反馈** - 操作即时响应和视觉反馈

## 🏗️ 技术架构

### 核心技术栈
- **React 18** - 现代React框架，支持并发特性
- **TypeScript** - 类型安全的JavaScript，提升开发体验
- **Vite** - 极速的前端构建工具
- **Axios** - 强大的HTTP客户端
- **CSS3** - 现代化样式和动画

### 项目结构
```
frontend/
├── 📁 源代码
│   └── src/
│       ├── 📁 组件层
│       │   ├── TodoForm.tsx      # 添加待办事项表单组件
│       │   ├── TodoList.tsx      # 待办事项列表容器组件
│       │   ├── TodoItem.tsx      # 单个待办事项展示组件
│       │   ├── TimeSelector.tsx  # 时间选择下拉组件
│       │   └── RecycleBin.tsx    # 回收站管理模态框
│       ├── 📁 服务层
│       │   └── api.ts           # Axios API服务封装
│       ├── 📁 类型定义
│       │   └── todo.ts          # TypeScript接口定义
│       ├── 📁 样式
│       │   ├── App.css          # 主应用样式文件
│       │   └── index.css        # 全局样式文件
│       ├── App.tsx              # 主应用组件和状态管理
│       └── main.tsx             # React应用入口文件
├── 📁 配置文件
│   ├── vite.config.ts          # Vite构建工具配置
│   ├── tsconfig.json           # TypeScript编译配置
│   ├── tsconfig.node.json      # Node端TypeScript配置
│   ├── vite.config.ts          # Vite开发服务器配置
│   └── package.json            # 项目依赖和脚本
└── 📖 README.md                # 前端开发文档
```

### 组件架构
```
App (主应用)
├── Header (头部统计和操作)
├── TodoForm (添加表单)
├── TodoList (列表容器)
│   └── TodoItem (单个事项)
│       ├── 显示模式
│       └── 编辑模式
└── RecycleBin (回收站模态框)
```

## 🚀 快速开始

### 环境要求
- **Node.js** 16.0 或更高版本
- **npm** 7.0 或更高版本（或 yarn）

### 安装依赖
```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install
```

### 开发环境
```bash
# 启动开发服务器
npm run dev

# 应用将在 http://localhost:3000 启动
```

### 代码检查
```bash
# TypeScript类型检查
npm run typecheck

# ESLint代码检查
npm run lint
```

### 生产构建
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 🔧 开发指南

### API服务配置
前端通过Vite代理配置与后端API通信：

```typescript
// vite.config.ts 代理配置
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
      // 无需重写路径，保持/api前缀
    }
  }
}

// API服务封装 (services/api.ts)
const API_BASE_URL = '/api/v2.0.0'

export const todoApi = {
  getAllTodos: () => apiClient.get<Record<number, TodoItem>>(`${API_BASE_URL}/todos`),
  createTodo: (todo: TodoItem) => apiClient.post<TodoItem>(`${API_BASE_URL}/todos`, todo),
  updateTodo: (id: number, todo: Partial<TodoItem>) =>
    apiClient.patch<TodoItem>(`${API_BASE_URL}/todos/${id}`, todo),
  deleteTodo: (id: number) => apiClient.delete(`${API_BASE_URL}/todos/${id}`),
  toggleTodoStatus: (id: number) =>
    apiClient.patch<TodoItem>(`${API_BASE_URL}/todos/${id}/toggle`),
  // 回收站相关API
  getRecycleBin: () => apiClient.get<Record<number, TodoItem>>(`${API_BASE_URL}/recycle-bin`),
  restoreTodo: (id: number) =>
    apiClient.post<TodoItem>(`${API_BASE_URL}/recycle-bin/${id}/restore`),
  permanentlyDeleteTodo: (id: number) =>
    apiClient.delete(`${API_BASE_URL}/recycle-bin/${id}`),
  clearRecycleBin: () => apiClient.delete(`${API_BASE_URL}/recycle-bin`),
}
```

### 类型定义
```typescript
// 待办事项完整接口 (types/todo.ts)
export interface TodoItem {
  id?: number;                    // 唯一标识符，可选
  title: string;                  // 标题，必填
  description?: string;           // 描述，可选
  completed: boolean;             // 完成状态
  priority: Priority;             // 优先级枚举
  start_time?: string;            // 开始时间 (HH:MM格式)
  end_time?: string;              // 结束时间 (HH:MM格式)
}

// 待办事项表单数据接口
export interface TodoFormData {
  title: string;
  description?: string;
  priority: Priority;
  start_time?: string;
  end_time?: string;
}

// 优先级枚举
export enum Priority {
  HIGH = 'high',      // 高优先级
  MEDIUM = 'medium',  // 中优先级
  LOW = 'low'         // 低优先级
}

// API响应类型
export type TodoApiResponse<T> = {
  data: T;
  status: number;
  message?: string;
}
```

### 组件设计原则
1. **单一职责** - 每个组件只负责一个功能
2. **类型安全** - 使用TypeScript确保类型正确
3. **可复用性** - 组件设计考虑复用场景
4. **性能优化** - 合理使用React Hooks和memo
5. **错误边界** - 优雅处理组件错误
6. **状态管理** - 局部状态与全局状态分离

## 🎨 样式系统

### 设计特点
- **现代化卡片设计** - 阴影、圆角、层次感
- **优先级颜色编码** - 高(红)/中(橙)/低(绿)
- **响应式布局** - 移动端优先设计
- **平滑动画** - 过渡效果和交互反馈

### CSS架构
```css
/* 组件化样式系统 */
.todo-item { /* 单个待办事项卡片 */ }
.todo-form { /* 添加表单容器 */ }
.recycle-bin-modal { /* 回收站模态框 */ }
.recycle-bin-item { /* 回收站项目卡片 */ }

/* 工具类和状态 */
.loading { /* 加载状态指示器 */ }
.empty-state { /* 空列表提示 */ }
.error-message { /* 错误信息展示 */ }
.stats { /* 统计信息样式 */ }

/* 优先级颜色编码 */
.priority-high { background-color: #ffebee; color: #c62828; }
.priority-medium { background-color: #fff3e0; color: #ef6c00; }
.priority-low { background-color: #e8f5e8; color: #2e7d32; }

/* 响应式断点设计 */
@media (max-width: 600px) {
  /* 移动端适配：堆叠布局，增大触摸目标 */
  .todo-item { flex-direction: column; }
  .btn-recycle-bin { font-size: 14px; padding: 8px 12px; }
}

@media (max-width: 400px) {
  /* 小屏手机优化 */
  .app-header h1 { font-size: 1.5rem; }
  .stats { font-size: 0.9rem; }
}
```

## 📱 响应式设计

### 断点设置
- **桌面端**: > 600px
- **移动端**: ≤ 600px

### 适配特性
- **弹性布局** - Flexbox自适应
- **触摸优化** - 适合触摸操作
- **字体缩放** - 自动调整字体大小
- **组件重排** - 移动端重新布局

## 🔌 API集成

### 服务端点
```typescript
// 待办事项管理
GET    /api/todos              // 获取所有待办事项
POST   /api/todos              // 创建新的待办事项
PATCH  /api/todos/:id          // 更新待办事项
PATCH  /api/todos/:id/toggle   // 切换完成状态
DELETE /api/todos/:id          // 删除到回收站

// 回收站管理
GET    /api/recycle-bin                    // 获取回收站
POST   /api/recycle-bin/:id/restore        // 恢复项目
DELETE /api/recycle-bin/:id                // 永久删除
DELETE /api/recycle-bin                    // 清空回收站

// 统计信息
GET    /api/stats                          // 获取统计信息
```

### 错误处理
```typescript
// 统一的错误处理机制
const loadTodos = async () => {
  try {
    setLoading(true)
    setError(null)
    const data = await todoApi.getAllTodos()
    setTodos(Object.values(data))
  } catch (error) {
    setError('加载待办事项失败，请稍后重试')
    console.error('Error loading todos:', error)
  } finally {
    setLoading(false)
  }
}

// 用户友好的错误提示
{error && (
  <div className="error-message">
    {error}
    <button onClick={() => setError(null)} className="btn-close">×</button>
  </div>
)}
```

### 状态管理
```typescript
// 主应用状态管理
const [todos, setTodos] = useState<TodoItem[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false)

// 实时统计计算
const completedCount = todos.filter(todo => todo.completed).length
const totalCount = todos.length

// 回收站状态管理
const [recycledTodos, setRecycledTodos] = useState<TodoItem[]>([])
const [recycleLoading, setRecycleLoading] = useState(false)
```

## ⚡ 性能优化

### 已实现优化
- **组件懒加载** - 回收站组件按需加载
- **状态本地化** - 减少不必要的API调用
- **事件防抖** - 避免频繁的状态更新
- **条件渲染** - 减少DOM操作

### 建议优化
- **React.memo** - 组件记忆化
- **useMemo/useCallback** - 计算和函数缓存
- **虚拟滚动** - 大数据量列表优化
- **代码分割** - 路由级别代码分割

## 🧪 测试策略

### 测试类型
- **单元测试** - 组件和功能测试
- **集成测试** - API集成测试
- **E2E测试** - 端到端用户流程测试

### 测试工具推荐
```bash
# 安装测试依赖
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

## 🚀 部署指南

### 静态部署
```bash
# 构建生产版本
npm run build

# 部署到静态服务器
# 构建产物在 dist/ 目录
```

### 环境变量
```bash
# 生产环境API地址
VITE_API_BASE_URL=https://api.yourdomain.com/api/v2.0.0
```

## 🔍 调试技巧

### 开发工具
- **React DevTools** - 组件树和状态查看
- **Redux DevTools** - 状态管理调试
- **Network Tab** - API请求监控
- **Console** - 日志和错误信息

### 常见问题
1. **CORS错误** - 检查代理配置
2. **类型错误** - 检查TypeScript类型定义
3. **构建失败** - 检查依赖版本兼容性

## 📈 监控和分析

### 性能监控
- **Lighthouse** - 性能评分和优化建议
- **Web Vitals** - 核心性能指标
- **Bundle分析** - 包大小优化

### 用户分析
- **Google Analytics** - 用户行为分析
- **错误追踪** - Sentry错误监控

## 🎯 最佳实践

### 代码规范
- **ESLint配置** - 统一的代码风格
- **Prettier格式化** - 自动代码格式化
- **Git提交规范** - 语义化提交信息

### 开发流程
1. **功能规划** - 明确需求和用户故事
2. **组件设计** - 拆分和设计组件结构
3. **类型定义** - 先定义TypeScript类型
4. **功能实现** - 按组件逐步开发
5. **测试验证** - 功能和交互测试
6. **代码审查** - 团队代码审查

## 🔮 未来扩展

### 功能增强
- [ ] **用户系统** - 登录注册和个人化
- [ ] **数据同步** - 云端数据同步
- [ ] **离线支持** - PWA离线功能
- [ ] **主题系统** - 深色模式和主题切换
- [ ] **国际化** - 多语言支持
- [ ] **键盘快捷键** - 高效操作支持

### 技术升级
- [ ] **状态管理** - Redux Toolkit或Zustand
- [ ] **UI框架** - 集成Ant Design或Material-UI
- [ ] **图表展示** - 数据可视化图表
- [ ] **动画系统** - Framer Motion动画
- [ ] **测试覆盖** - 完整的测试体系

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

### 开发流程
1. Fork 项目仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 代码规范
- 遵循TypeScript最佳实践
- 保持组件纯净和可测试
- 添加适当的注释和文档
- 确保通过所有测试

## 📄 许可证

本项目采用 MIT 许可证 - 查看主项目 [LICENSE](../LICENSE) 文件了解详情。

---

<div align="center">
  <p>Made with ❤️ by Roo</p>
  <p>
    <a href="../../issues">🐛 报告问题</a> •
    <a href="../../pulls">🔀 提交PR</a> •
    <a href="../../discussions">💬 参与讨论</a>
  </p>
</div>

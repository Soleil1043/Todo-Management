# E2E 测试指南

本目录包含使用 Playwright 对 TodoGravita 应用程序进行的端到端 (E2E) 测试。

## 环境准备

1. 安装 Playwright：

   ```bash
   npm install --save-dev @playwright/test
   ```

2. 安装测试所需的浏览器：

   ```bash
   npx playwright install
   ```

## 运行测试

### 运行所有测试

```bash
npm run test:e2e
```

### 以headed模式运行（查看浏览器界面）

```bash
npm run test:e2e:headed
```

### 在特定浏览器上运行

```bash
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### 使用 UI 模式运行

```bash
npm run test:e2e:ui
```

### 生成测试报告

```bash
npm run test:e2e:report
```

## 测试结构

- `todo-app.spec.ts` - 基础功能测试
- `advanced-features.spec.ts` - 性能、无障碍及高级特性测试

## 测试覆盖范围

### 基础测试 (`todo-app.spec.ts`)

- ✅ 页面加载及标题验证
- ✅ 待办事项表单可见性及功能
- ✅ 待办事项创建与列表展示
- ✅ 多视图导航（仪表盘、矩阵、四象限）
- ✅ 仪表盘视图统计数据验证
- ✅ 矩阵视图分类与优先级
- ✅ 四象限视图功能（坐标、缩放、拖拽更新）
- ✅ 回收站操作（恢复、永久删除、清空）
- ✅ 外观设置（壁纸上传、模糊度、主题切换）
- ✅ 待办事项状态切换
- ✅ 待办事项删除确认
- ✅ 表单验证与错误处理

### 高级测试 (`advanced-features.spec.ts`)

- ✅ 页面加载性能（< 3 秒）
- ✅ 键盘无障碍支持
- ✅ ARIA 标签验证
- ✅ 大数据量处理（10+ 待办事项）
- ✅ 移动端响应式适配（iPhone SE 视口）
- ✅ 触摸手势支持
- ✅ **四象限交互**：支持通过拖拽更新评分
- ✅ **智能优先级**：自动计算最终优先级的验证
- ✅ API 集成与错误处理
- ✅ 网络超时处理
- ✅ 页面重载后的数据持久化
- ✅ localStorage 操作验证

## 最佳实践

1. **使用 data-testid 属性** 以实现可靠的元素选择
2. **在断言前等待网络空闲 (network idle)**
3. **为 API 调用设置适当的超时时间**
4. **测试成功与错误两种场景**
5. **验证无障碍 (Accessibility) 特性**
6. **在多个视口尺寸下进行测试**
7. **监控性能指标**
8. **使用页面对象模型 (POM)** 以提升可维护性

## 调试技巧

1. 使用 `--headed` 模式在执行测试时查看浏览器界面
2. 查看 `test-results/` 目录下的截图和视频
3. 使用 `--debug` 标志启动 Playwright Inspector
4. 查看跟踪文件 (trace files) 获取详细的执行日志
5. 使用 UI 模式进行交互式调试

## CI/CD 集成

测试已配置为在 CI 环境中运行，具有以下特点：

- 禁用并行执行 (`workers: 1`)
- 重试机制 (`retries: 2`)
- 无头模式运行
- 自动启动服务器

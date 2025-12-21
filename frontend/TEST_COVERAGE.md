# 测试覆盖率与 CI/CD 文档

## 📊 测试覆盖率

### 当前覆盖率状态

- **行覆盖率 (Lines)**: 43.74% (阈值: 80%)
- **函数覆盖率 (Functions)**: 61.05% (阈值: 80%)
- **分支覆盖率 (Branches)**: 67.4% (阈值: 80%)
- **语句覆盖率 (Statements)**: 43.74% (阈值: 80%)

*注意：覆盖率下降是由于引入了大量新组件（如 QuadrantCanvas, MatrixView, DashboardView 等），这些组件目前尚未完成单元测试编写。*

### 覆盖率脚本

```bash
# 运行所有测试并生成覆盖率报告
npm run test:coverage

# 仅运行组件测试并生成覆盖率报告（不包括 E2E 和 API 测试）
npm run test:coverage:component

# 生成并打开 HTML 格式的覆盖率报告
npm run test:coverage:report

# 以监听模式运行测试并实时生成覆盖率
npm run test:watch:coverage
```

### 覆盖率配置

覆盖率在 `vitest.config.ts` 中配置，主要设置如下：

- **提供者 (Provider)**: v8
- **报告格式 (Reporters)**: text, json, html, lcov
- **阈值 (Thresholds)**: 所有指标设为 80% (行, 函数, 分支, 语句)
- **排除项 (Exclusions)**: 测试文件、设置文件、E2E 测试和配置文件

### 报告输出位置

HTML 覆盖率报告生成在 `coverage/` 目录下：

- `coverage/index.html` - 主报告入口
- `coverage/lcov-report/` - 详细的逐行覆盖报告
- `coverage/coverage-final.json` - 原始覆盖率数据

## 🔄 CI/CD 流水线

### GitHub Actions 工作流

CI 流水线配置在 `.github/workflows/ci.yml` 中，包含：

1. **测试任务 (Test Job)** (支持 Node.js 18.x 和 20.x):
   - 安装依赖
   - 运行组件测试
   - 生成覆盖率报告
   - 上传覆盖率产物
   - 在 PR 下方自动评论覆盖率状态

2. **代码规范任务 (Lint Job)**:
   - 运行 ESLint
   - 运行 TypeScript 类型检查

3. **性能分析任务 (Performance Job)**:
   - 构建应用程序
   - 分析包体积
   - 报告构建指标

### Pre-commit 钩子

配置了 pre-commit 钩子以确保：

- 组件测试通过
- 代码规范检查通过
- TypeScript 编译成功

安装 pre-commit 钩子：

```bash
cp .git/hooks/pre-commit .git/hooks/pre-commit.backup 2>/dev/null || true
cp .git/hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

## 🎯 覆盖率目标

### 高优先级组件 (目标: 90%+ 覆盖率)

- [x] `src/components/TodoForm.tsx` (当前 100% ✅)
- [x] `src/components/TodoItem.tsx` (当前 100% ✅)
- [x] `src/components/TodoList.tsx` (当前 100% ✅)
- [x] `src/utils/quadrantUtils.ts` (当前 100% ✅)
- [x] `src/hooks/useTimeValidation.ts` (当前 100% ✅)
- [ ] `src/components/QuadrantView.tsx` (待编写)
- [ ] `src/components/MatrixView.tsx` (待编写)

### 中优先级组件 (目标: 80%+ 覆盖率)

- [x] `src/components/Toast.tsx` (当前 100% ✅)
- [x] `src/components/Modal.tsx` (当前 100% ✅)
- [x] `src/components/RecycleBin.tsx` (当前 100% ✅)
- [ ] `src/components/AppearanceSettings.tsx` (待编写)
- [ ] `src/components/DashboardView.tsx` (待编写)

### 低优先级组件 (目标: 70%+ 覆盖率)

- [x] `src/components/Icon.tsx` (当前 100% ✅)
- [ ] `src/components/Sidebar.tsx` (待编写)
- [ ] `src/components/LoadingOverlay.tsx` (待编写)

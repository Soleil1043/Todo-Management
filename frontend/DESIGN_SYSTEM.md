# Todo Management 前端设计系统（v1）

## 设计目标

- 现代化、简约、信息层次清晰
- 主色不超过 3 种（Neutral / Primary / Danger）
- 动效统一且克制（200–300ms）
- 交互控件符合可达性与可点击面积要求（WCAG 2.1 AA、Fitts）

## 配色（Tokens）

定义位置：`frontend/src/index.css`

| Token | 用途 |
| --- | --- |
| `--color-bg` | 页面背景 |
| `--color-surface` | 卡片/弹窗背景 |
| `--color-text` | 主文本 |
| `--color-muted` | 次要文本 |
| `--color-border` | 分割线/边框 |
| `--color-primary` | 主操作（按钮、强调） |
| `--color-danger` | 危险操作（删除、清空） |

主色控制：Neutral（灰阶）+ Primary（蓝）+ Danger（红）。

## 排版

- 字体：系统无衬线字体栈（`ui-sans-serif, system-ui, Segoe UI, Roboto, ...`）
- 默认行高：`1.5`
- 标题：更高字重 + 轻微负字距，增强层次

## 间距 / 圆角 / 阴影（Tokens）

定义位置：`frontend/src/index.css`

- 间距：`--space-*`（4px 为基准刻度）
- 圆角：`--radius-sm/md/lg/xl`（8–20px）
- 阴影：`--shadow-sm/md/lg`（用于卡片、hover、弹窗）

## 动效规范

定义位置：`frontend/src/index.css`

- 时长：`--motion-duration: 240ms`（满足 200–300ms 要求）
- 缓动：`--motion-ease: cubic-bezier(0.2, 0, 0, 1)`
- 减少动态：遵循 `prefers-reduced-motion`

## 组件样式约定

定义位置：`frontend/src/App.css`

- 卡片：`--color-surface` + `--color-border` + `--shadow-sm`
- 按钮：统一最小高度 40px，图标线性风格（`frontend/src/components/Icon.tsx`）
- 输入：统一最小高度 44px，`focus-visible` 以蓝色环强调焦点

## 响应式断点

- `<= 600px`：表单与列表纵向堆叠，弹窗减小 padding
- `<= 920px`：主布局从双列网格切换为单列

## 无障碍（WCAG 2.1 AA）

- `:focus-visible` 提供清晰可见的键盘焦点
- 关键控件提供可访问名称（按钮文本/`aria-label`）
- 表单错误使用 `role="alert"` 进行即时提示
- 避免仅凭颜色传达信息（优先级同时含文本）


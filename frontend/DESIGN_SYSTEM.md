# TodoGravita 前端设计系统（v1）

## 设计目标

- 现代化、简约、信息层次清晰
- 主色不超过 3 种（Neutral / Primary / Danger）
- 动效统一且克制（200–300ms）
- 交互控件符合可达性与可点击面积要求（WCAG 2.1 AA、Fitts）
- 响应式设计，适配多终端尺寸（Mobile / Tablet / Desktop）

## 配色（Tokens）

定义位置：`frontend/src/index.css`

| Token | 用途 |
| :--- | :--- |
| `--color-bg` | 页面背景 |
| `--color-surface` | 卡片/弹窗背景 |
| `--color-text` | 主文本 |
| `--color-muted` | 次要文本 |
| `--color-border` | 分割线/边框 |
| `--color-primary` | 主操作（按钮、强调） |
| `--color-danger` | 危险操作（删除、清空） |
| `--color-quadrant-1` | 四象限：重要且紧急（右上） |
| `--color-quadrant-2` | 四象限：重要不紧急（左上） |
| `--color-quadrant-3` | 四象限：紧急不重要（右下） |
| `--color-quadrant-4` | 四象限：不重要不紧急（左下） |
| `--glass-bg` | 毛玻璃效果背景色 |
| `--glass-border` | 毛玻璃效果边框色 |

## 个性化与外观

- **自定义壁纸**: 支持上传本地图片作为背景，存储于后端 `system_settings`。
- **毛玻璃效果 (Glassmorphism)**: 侧边栏和设置面板采用模糊背景设计，支持调节模糊度。
- **主题系统**: 提供多种预设主题色，动态修改 `--color-primary` 及相关 Token。
- **布局调节**: 支持侧边栏展开/收起，自动适配不同视口宽度。

## 排版

- 字体：系统无衬线字体栈（`ui-sans-serif, system-ui, Segoe UI, Roboto, ...`）
- 默认行高：`1.5`
- 标题：更高字重 + 轻微负字距，增强层次

## 间距 / 圆角 / 阴影（Tokens）

定义位置：`frontend/src/index.css`

- 间距：`--space-*`（4px 为基准刻度）
- 圆角：`--radius-sm/md/lg/xl`（8–24px）
- 阴影：`--shadow-sm/md/lg/xl`（用于卡片、hover、弹窗、浮层）

## 动效规范

定义位置：`frontend/src/index.css`

- 时长：`--motion-duration: 300ms`（满足 200–300ms 要求）
- 缓动：`--motion-ease: cubic-bezier(0.4, 0, 0.2, 1)`
- 减少动态：遵循 `prefers-reduced-motion`

## 组件样式约定

定义位置：`frontend/src/App.css`

- 卡片：`--color-surface` + `--color-border` + `--shadow-sm`
- 按钮：统一最小高度 44px，图标线性风格（`frontend/src/components/Icon.tsx`）
- 输入：统一最小高度 44px，`focus-visible` 以 `--color-primary` 环强调焦点

## 响应式断点

- `<= 600px`：表单与列表纵向堆叠，弹窗减小 padding
- `<= 920px`：主布局从双列网格切换为单列

## 无障碍（WCAG 2.1 AA）

- `:focus-visible` 提供清晰可见的键盘焦点
- 关键控件提供可访问名称（按钮文本/`aria-label`）
- 表单错误使用 `role="alert"` 进行即时提示
- **四象限可视化**：通过位置和文本标签辅助传达优先级，避免仅凭颜色区分。
- **拖拽交互**：支持键盘辅助定位或通过详情面板修改分数，确保无法使用鼠标的用户也能调整优先级。
- **颜色对比度**：确保文本与背景对比度符合 WCAG 2.1 AA 标准（至少 4.5:1）。
- **色彩辅助**：避免仅凭颜色传达信息，所有优先级标识均应包含文字标签或图标说明。

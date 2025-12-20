# Todo Management Frontend - Architecture Documentation

## 🏗️ System Architecture Overview

The Todo Management Frontend is a React-based single-page application (SPA) built with TypeScript, featuring a modern component architecture with performance optimizations and comprehensive testing.

### Technology Stack

- **Frontend Framework**: React 18.x with TypeScript
- **Build Tool**: Vite 5.x
- **Testing**: Vitest + React Testing Library
- **Styling**: CSS Modules + Custom CSS
- **State Management**: React Context + Local State
- **Drag & Drop**: @dnd-kit/core
- **HTTP Client**: Axios

## 📐 Component Architecture

### Core Components

#### 1. App.tsx (Root Component)

- **Responsibility**: Application orchestration and state management
- **Features**: Todo CRUD operations, optimistic updates, performance optimizations
- **Optimizations**: Memoized quadrant statistics, batched state updates

#### 2. TodoList.tsx

- **Responsibility**: Todo list rendering and management
- **Features**: Memoized todo item rendering, stable component references
- **Optimizations**: React.memo for expensive re-renders

#### 3. TodoItem.tsx

- **Responsibility**: Individual todo item display and interaction
- **Features**: Edit mode, completion toggle, drag-and-drop
- **Optimizations**: Cached time display, optimized quadrant calculation

#### 4. TodoForm.tsx

- **Responsibility**: Todo creation and editing
- **Features**: Time validation, form state management
- **Optimizations**: Memoized TimeSelector callbacks

#### 5. QuadrantView.tsx

- **Responsibility**: Eisenhower Matrix visualization
- **Features**: Drag-and-drop positioning, quadrant-based organization, multi-dimensional scoring (future value vs urgency)
- **Optimizations**: Canvas-based rendering for performance, memoized coordinate calculations

#### 6. QuadrantCanvas.tsx

- **Responsibility**: Specialized rendering layer for the quadrant view
- **Features**: Canvas API integration, responsive grid rendering
- **Optimizations**: Efficient re-rendering logic for smooth drag operations

### Context Architecture

#### LoadingContext

- **Purpose**: Global loading state management
- **Features**: Loading overlay, async operation coordination
- **Optimizations**: Memoized context value to prevent unnecessary re-renders

#### ToastContext

- **Purpose**: Global notification system
- **Features**: Toast messages, auto-dismissal, multiple message support
- **Optimizations**: Memoized toast item rendering

### Hook Architecture

#### useTimeValidation

- **Purpose**: Time input validation
- **Features**: Format validation, range checking
- **Testing**: 100% test coverage

#### useDragLogic

- **Purpose**: Drag-and-drop interaction handling
- **Features**: Mouse/touch support, quadrant positioning
- **Testing**: Comprehensive test suite

#### usePerformance

- **Purpose**: Performance monitoring and optimization
- **Features**: Render tracking, performance metrics
- **Testing**: Performance benchmarks, render profiling

## ⚡ Performance Architecture

### Optimization Strategies

#### 1. Component Memoization

```typescript
// TodoList.tsx - Memoized todo rendering
const todoItems = useMemo(() => {
  return todos.map((todo) => (
    <TodoItemComponent
      key={todo.id}
      todo={todo}
      onToggleComplete={onToggleComplete}
      onDelete={onDelete}
      onUpdate={onUpdate}
    />
  ))
}, [todos, onToggleComplete, onDelete, onUpdate])
```

#### 2. Expensive Calculation Caching

```typescript
// App.tsx - Cached quadrant statistics and smart priorities
const quadrantStats = useMemo(() => {
  // Multi-dimensional priority scoring cached
  return calculateQuadrantStats(todos);
}, [todos]);
```

#### 3. Function Reference Stabilization

```typescript
// TodoForm.tsx - Memoized callbacks
const handleStartTimeChange = useCallback((time: string) => {
  setStartTime(time);
  validateTimeRange(time, endTime);
}, [endTime, validateTimeRange]);
```

#### 4. Code Splitting

```typescript
// App.tsx - Lazy loading for large components
const RecycleBin = lazy(() => import('./components/RecycleBin'));
const AppearanceSettings = lazy(() => import('./components/AppearanceSettings'));
```

### Performance Monitoring

- Bundle size analysis in CI
- Component render tracking
- Performance budgets enforcement

## 🧪 Testing Architecture

### Test Strategy

#### Component Tests

- **Coverage Target**: 90%+ for core components
- **Tools**: Vitest + React Testing Library
- **Focus**: User interactions, accessibility, edge cases

#### Hook Tests

- **Coverage Target**: 100% for custom hooks
- **Tools**: Vitest + React Hooks Testing Library
- **Focus**: State management, side effects, error handling

#### Utility Tests

- **Coverage Target**: 100% for utility functions
- **Tools**: Vitest
- **Focus**: Edge cases, performance, correctness

### Test Structure

```text
src/
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx
├── hooks/
│   ├── useHook.ts
│   └── useHook.test.ts
└── utils/
    ├── util.ts
    └── util.test.ts
```

### Mock Strategy

- **API Mocks**: MSW (Mock Service Worker) for API calls
- **Component Mocks**: Jest mocks for complex dependencies
- **Data Mocks**: Centralized mock data in `src/test/mock-data.ts`

## 🔄 State Management Architecture

### Local State Pattern

- **Philosophy**: Keep state close to where it's used
- **Implementation**: useState and useReducer hooks
- **Benefits**: Predictable, testable, performant

### Context Pattern

- **Global State**: Loading state, notifications
- **Feature State**: Todo management, user preferences
- **Performance**: Memoized context values

### State Flow

```text
User Action → Local State Update → API Call → Context Update → UI Update
```

## 🌐 API Integration Architecture

### Service Layer

- **File**: `src/services/api.ts`
- **Features**: Axios interceptors, error handling, request/response transformation
- **Testing**: Mocked API calls in tests

### Error Handling

- **Global**: Axios interceptors for network errors
- **Local**: Component-level error boundaries
- **User Feedback**: Toast notifications for user-facing errors

### Optimistic Updates

```typescript
// App.tsx - Optimistic todo completion
const handleToggleComplete = useCallback(async (id: number) => {
  // Optimistic UI update
  setTodos(prevTodos =>
    prevTodos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  );
  
  // API call with rollback on failure
  try {
    await todoApi.toggleTodoStatus(id);
  } catch (err) {
    // Rollback on failure
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
    showToast('更新状态失败', 'error');
  }
}, [showToast]);
```

## 🎨 UI/UX Architecture

### Component Design Principles

- **Atomic Design**: Atoms → Molecules → Organisms
- **Consistency**: Reusable components with consistent APIs
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support

### Styling Architecture

- **CSS Modules**: Component-scoped styles
- **CSS Variables**: Theme customization support
- **Responsive Design**: Mobile-first approach

### Theme System

- **Light/Dark Mode**: CSS variable-based theming
- **Customizable**: User preference persistence
- **Consistent**: Centralized design tokens

## 🔧 Development Experience Architecture

### Tooling

- **TypeScript**: Type safety and IDE support
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Vitest**: Fast test execution
- **Vite**: Fast development builds

### Development Workflow

1. **Local Development**: `npm run dev`
2. **Testing**: `npm run test:watch`
3. **Linting**: `npm run lint`
4. **Type Checking**: `npm run typecheck`
5. **Building**: `npm run build`

### CI/CD Pipeline

- **GitHub Actions**: Automated testing and deployment
- **Coverage Reports**: Automated coverage tracking
- **Performance Monitoring**: Bundle size analysis
- **Quality Gates**: Linting, type checking, test execution

## 📊 Performance Metrics

### Current Performance

- **Bundle Size**: ~XXX KB (main bundle)
- **Test Coverage**: 41.27% lines, 49.33% functions
- **Build Time**: ~X seconds
- **Test Execution**: ~6 seconds

### Performance Goals

- **Bundle Size**: < 500KB for main bundle
- **Test Coverage**: > 80% for all metrics
- **Build Time**: < 30 seconds
- **Test Execution**: < 10 seconds

## 🔮 Future Architecture Considerations

### Scalability

- **Module Federation**: Micro-frontend architecture
- **State Management**: Consider Redux Toolkit for complex state
- **API Layer**: GraphQL integration for efficient data fetching

### Performance

- **Server-Side Rendering**: Next.js migration consideration
- **Progressive Web App**: Offline capability
- **Web Workers**: Background processing

### Developer Experience

- **Storybook**: Component documentation
- **Visual Regression Testing**: Chromatic integration
- **Performance Budgets**: Automated performance monitoring

# Development Experience Optimization Guide

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or 20.x
- npm 9.x or higher

### Installation

```bash
cd frontend
npm install
```

### Development Commands

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage:component

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```text
src/
├── components/          # React components
│   ├── TodoForm.tsx   # Todo creation form
│   ├── TodoItem.tsx   # Individual todo item
│   ├── TodoList.tsx   # Todo list container
│   ├── QuadrantView.tsx # Eisenhower Matrix visualization
│   └── ...
├── contexts/           # React Context providers
│   └── LoadingContext.tsx
├── hooks/              # Custom React hooks
│   ├── useTimeValidation.ts
│   ├── useDragLogic.ts
│   └── ...
├── services/           # API services
│   └── api.ts
├── utils/              # Utility functions
│   └── quadrantUtils.ts
├── types/              # TypeScript type definitions
│   └── todo.ts
└── styles/             # CSS stylesheets
    ├── Common.css
    └── ...
```

## 🧪 Testing Strategy

### Test Types

1. **Component Tests** - Unit tests for React components
2. **Hook Tests** - Tests for custom React hooks
3. **Utility Tests** - Tests for utility functions
4. **E2E Tests** - End-to-end tests (Playwright)

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run component tests only
npm test -- --exclude="**/e2e/**" --exclude="**/api.test.ts"

# Run tests with coverage
npm run test:coverage:component

# Run E2E tests
npm run test:e2e
```

### Test Coverage Goals

- **High Priority Components**: 90%+ coverage
- **Medium Priority Components**: 80%+ coverage
- **Low Priority Components**: 70%+ coverage

## 🛡️ Error & Performance Monitoring

### Error Boundary

The application is wrapped with an `ErrorBoundary` component to catch and handle rendering errors gracefully. It provides a fallback UI and allows users to retry or refresh the page.

### Sentry Integration

Sentry is integrated for real-time error tracking and performance monitoring.

- To enable Sentry, add your DSN to the `.env` file: `VITE_SENTRY_DSN=your_dsn_here`
- Errors are automatically captured by the `ErrorBoundary` and reported to Sentry.

### Performance Monitoring

- **Web Vitals**: Core Web Vitals (CLS, FID, LCP, FCP, TTFB) are monitored using the `web-vitals` library.
- **Custom Hooks**:
  - `usePerformanceMonitoring`: Monitors component rendering time.
  - `useMemoryMonitoring`: Monitors memory usage.
  - `useNetworkMonitoring`: Monitors API request performance.
- Performance data is logged to the console in development and sent as breadcrumbs to Sentry.

## ⚡ Performance Optimization

### Implemented Optimizations

1. **React.memo** - Component memoization
2. **useMemo** - Expensive calculation caching
3. **useCallback** - Function reference stability
4. **Code Splitting** - Lazy loading for large components

### Optimization Monitoring

```bash
# Build and analyze bundle size
npm run build
ls -lh dist/assets/
```

### Performance Best Practices

- Use `React.memo` for expensive components
- Cache expensive calculations with `useMemo`
- Stabilize function references with `useCallback`
- Implement optimistic UI updates
- Use proper dependency arrays in hooks

## 🎯 Code Quality

### Linting & Formatting

```bash
# Run ESLint
npm run lint

# Run TypeScript type checking
npm run typecheck
```

### Code Standards

- Use TypeScript for type safety
- Follow React best practices
- Write comprehensive tests
- Document complex logic
- Use meaningful variable names

## 🔧 Development Tools

### Recommended VS Code Extensions

1. **ESLint** - Real-time linting
2. **Prettier** - Code formatting
3. **TypeScript Vue Plugin** - TypeScript support
4. **Vitest** - Test runner integration
5. **GitLens** - Git integration

### Development Configuration

The project includes:

- **ESLint configuration** (`.eslintrc.json`)
- **TypeScript configuration** (`tsconfig.json`)
- **Vitest configuration** (`vitest.config.ts`)
- **Vite configuration** (`vite.config.ts`)

## 📊 Debugging & Profiling

### React Developer Tools

Install the React Developer Tools browser extension for:

- Component tree inspection
- Props and state debugging
- Performance profiling

### Console Debugging

```typescript
// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info:', data);
}
```

### Performance Profiling

Use the React DevTools Profiler to:

- Identify performance bottlenecks
- Analyze component render times
- Optimize re-renders

## 🚦 CI/CD Pipeline

### GitHub Actions Workflow

The CI pipeline automatically:

1. Runs component tests (Node.js 18.x & 20.x)
2. Generates coverage reports
3. Runs linting and type checking
4. Builds the application
5. Analyzes bundle size
6. Comments on PRs with coverage status

### Pre-commit Hooks

Pre-commit hooks ensure:

- Tests pass before commits
- Code is properly linted
- TypeScript compiles successfully

## 📈 Monitoring & Metrics

### Test Coverage

- Coverage reports generated automatically
- HTML reports available in `coverage/` directory
- Coverage thresholds enforced in CI

### Bundle Analysis

- Bundle size monitored in CI
- Performance budgets configured
- Size warnings on large bundles

## 🎯 Development Workflow

### Feature Development

1. Create feature branch
2. Implement component with tests
3. Ensure coverage meets thresholds
4. Run linting and type checking
5. Create pull request
6. CI automatically validates changes

### Bug Fixes

1. Write failing test first
2. Implement fix
3. Ensure all tests pass
4. Update documentation if needed

### Performance Improvements

1. Profile current performance
2. Implement optimization
3. Measure improvement
4. Add performance tests if applicable

## 🔗 Useful Links

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vitest Documentation](https://vitest.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Testing Library Documentation](https://testing-library.com/)

## 🤝 Contributing

1. Follow the development workflow
2. Write tests for new features
3. Maintain code quality standards
4. Update documentation
5. Ensure CI passes before merging

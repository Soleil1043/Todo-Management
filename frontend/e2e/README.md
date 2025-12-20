# E2E Testing Guide

This directory contains end-to-end tests for the Todo Management application using Playwright.

## Setup

1. Install Playwright:

```bash
npm install --save-dev @playwright/test
```

1. Install browsers for testing:

```bash
npx playwright install
```

## Running Tests

### Run all tests

```bash
npm run test:e2e
```

### Run tests in headed mode (see browser)

```bash
npm run test:e2e:headed
```

### Run tests on specific browser

```bash
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Run tests with UI mode

```bash
npm run test:e2e:ui
```

### Generate test report

```bash
npm run test:e2e:report
```

## Test Structure

- `todo-app.spec.ts` - Basic functionality tests
- `advanced-features.spec.ts` - Performance, accessibility, and advanced feature tests

## Test Coverage

### Basic Tests (`todo-app.spec.ts`)

- ✅ Page loading and title verification
- ✅ Todo form visibility and functionality
- ✅ Todo creation and listing
- ✅ Tab navigation (All, Active, Completed, Quadrant)
- ✅ Quadrant view functionality (Coordinates, Scaling)
- ✅ Recycle bin operations
- ✅ Todo completion toggling
- ✅ Todo deletion with confirmation
- ✅ Settings modal and dark mode
- ✅ Form validation and error handling

### Advanced Tests (`advanced-features.spec.ts`)

- ✅ Page load performance (< 3 seconds)
- ✅ Keyboard accessibility
- ✅ ARIA labels verification
- ✅ Large dataset handling (10+ todos)
- ✅ Mobile responsiveness (iPhone SE viewport)
- ✅ Touch gesture support
- ✅ **Quadrant Interaction**: Drag-and-drop support for updating scores
- ✅ **Smart Priority**: Automatic final_priority calculation verification
- ✅ API integration and error handling
- ✅ Network timeout handling
- ✅ Data persistence after reload
- ✅ localStorage operations

## Best Practices

1. **Use data-testid attributes** for reliable element selection
2. **Wait for network idle** before assertions
3. **Use appropriate timeouts** for API calls
4. **Test both success and error scenarios**
5. **Verify accessibility features**
6. **Test on multiple viewports**
7. **Monitor performance metrics**
8. **Use Page Object Model (POM)** for better maintainability

## Debugging Tips

1. Use `--headed` mode to see browser during test execution
2. Check screenshots and videos in `test-results/` directory
3. Use Playwright Inspector with `--debug` flag
4. Review trace files for detailed execution logs
5. Use UI mode for interactive debugging

## CI/CD Integration

Tests are configured to run in CI environment with:

- Parallel execution disabled (`workers: 1`)
- Retry mechanism (`retries: 2`)
- Headless mode
- Automatic server startup

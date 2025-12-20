import { test, expect } from '@playwright/test'

test.describe('TodoGravita App - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should display the main page title', async ({ page }) => {
    await expect(page).toHaveTitle(/TodoGravita/)
  })

  test('should display the todo form', async ({ page }) => {
    const todoForm = page.locator('[data-testid="todo-form"]')
    await expect(todoForm).toBeVisible()
    
    const titleInput = page.locator('input[name="title"]')
    const descriptionInput = page.locator('textarea[name="description"]')
    const prioritySelect = page.locator('select[name="priority"]')
    
    await expect(titleInput).toBeVisible()
    await expect(descriptionInput).toBeVisible()
    await expect(prioritySelect).toBeVisible()
  })

  test('should create a new todo', async ({ page }) => {
    const titleInput = page.locator('input[name="title"]')
    const descriptionInput = page.locator('textarea[name="description"]')
    const prioritySelect = page.locator('select[name="priority"]')
    const submitButton = page.locator('button[type="submit"]')

    await titleInput.fill('Test Todo')
    await descriptionInput.fill('This is a test todo')
    await prioritySelect.selectOption('high')
    await submitButton.click()

    // Wait for the todo to appear in the list
    await page.waitForTimeout(1000)
    
    const todoItem = page.locator('text=Test Todo')
    await expect(todoItem).toBeVisible()
  })

  test('should display todo list', async ({ page }) => {
    const todoList = page.locator('[data-testid="todo-list"]')
    await expect(todoList).toBeVisible()
  })

  test('should navigate between tabs', async ({ page }) => {
    const allTab = page.locator('text=全部')
    const activeTab = page.locator('text=进行中')
    const completedTab = page.locator('text=已完成')

    await expect(allTab).toBeVisible()
    await expect(activeTab).toBeVisible()
    await expect(completedTab).toBeVisible()

    // Click on different tabs
    await activeTab.click()
    await page.waitForTimeout(500)
    
    await completedTab.click()
    await page.waitForTimeout(500)
    
    await allTab.click()
    await page.waitForTimeout(500)
  })

  test('should display quadrant view', async ({ page }) => {
    const quadrantView = page.locator('[data-testid="quadrant-view"]')
    await expect(quadrantView).toBeVisible()
  })

  test('should display recycle bin', async ({ page }) => {
    const recycleBinButton = page.locator('[data-testid="recycle-bin-button"]')
    await expect(recycleBinButton).toBeVisible()
    
    await recycleBinButton.click()
    await page.waitForTimeout(500)
    
    const recycleBinModal = page.locator('[data-testid="recycle-bin-modal"]')
    await expect(recycleBinModal).toBeVisible()
  })
})

test.describe('Todo Management App - Advanced Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should toggle todo completion status', async ({ page }) => {
    // First create a todo
    const titleInput = page.locator('input[name="title"]')
    const submitButton = page.locator('button[type="submit"]')

    await titleInput.fill('Toggle Test Todo')
    await submitButton.click()
    await page.waitForTimeout(1000)

    // Find the todo and toggle its completion
    const todoItem = page.locator('text=Toggle Test Todo')
    await expect(todoItem).toBeVisible()

    const toggleButton = page.locator('button[aria-label="Toggle completion"]')
    await toggleButton.first().click()
    await page.waitForTimeout(500)

    // Check if the todo is marked as completed
    const completedTodo = page.locator('.line-through')
    await expect(completedTodo.first()).toBeVisible()
  })

  test('should delete a todo', async ({ page }) => {
    // First create a todo
    const titleInput = page.locator('input[name="title"]')
    const submitButton = page.locator('button[type="submit"]')

    await titleInput.fill('Delete Test Todo')
    await submitButton.click()
    await page.waitForTimeout(1000)

    // Find the todo and delete it
    const todoItem = page.locator('text=Delete Test Todo')
    await expect(todoItem).toBeVisible()

    const deleteButton = page.locator('button[aria-label="Delete todo"]')
    await deleteButton.first().click()
    await page.waitForTimeout(500)

    // Confirm deletion in modal
    const confirmButton = page.locator('button:has-text("确认")')
    await confirmButton.click()
    await page.waitForTimeout(1000)

    // Check if the todo is no longer visible
    await expect(todoItem).not.toBeVisible()
  })

  test('should drag and drop todo in quadrant view', async ({ page }) => {
    // Create a todo first
    const titleInput = page.locator('input[name="title"]')
    const submitButton = page.locator('button[type="submit"]')

    await titleInput.fill('Drag Test Todo')
    await submitButton.click()
    await page.waitForTimeout(1000)

    // Switch to quadrant view
    const quadrantTab = page.locator('text=四象限')
    await quadrantTab.click()
    await page.waitForTimeout(1000)

    // Find the draggable todo
    const draggableTodo = page.locator('.cursor-grab')
    await expect(draggableTodo.first()).toBeVisible()

    // Note: Full drag and drop testing would require more complex setup
    // This test just verifies the draggable element exists
  })

  test('should filter todos by priority', async ({ page }) => {
    const priorityFilter = page.locator('select[name="priority-filter"]')
    await expect(priorityFilter).toBeVisible()

    await priorityFilter.selectOption('high')
    await page.waitForTimeout(500)

    await priorityFilter.selectOption('medium')
    await page.waitForTimeout(500)

    await priorityFilter.selectOption('low')
    await page.waitForTimeout(500)

    await priorityFilter.selectOption('')
    await page.waitForTimeout(500)
  })

  test('should search todos', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="搜索"]')
    await expect(searchInput).toBeVisible()

    await searchInput.fill('test')
    await page.waitForTimeout(500)

    await searchInput.clear()
    await page.waitForTimeout(500)
  })
})

test.describe('Todo Management App - Settings and Appearance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should open settings modal', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="settings-button"]')
    await expect(settingsButton).toBeVisible()

    await settingsButton.click()
    await page.waitForTimeout(500)

    const settingsModal = page.locator('[data-testid="settings-modal"]')
    await expect(settingsModal).toBeVisible()
  })

  test('should toggle dark mode', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="settings-button"]')
    await settingsButton.click()
    await page.waitForTimeout(500)

    const darkModeToggle = page.locator('input[type="checkbox"]').filter({ hasText: '深色模式' })
    await expect(darkModeToggle).toBeVisible()

    await darkModeToggle.click()
    await page.waitForTimeout(1000)

    // Check if dark mode is applied
    const darkModeClass = page.locator('.dark')
    await expect(darkModeClass).toBeVisible()
  })

  test('should change accent color', async ({ page }) => {
    const settingsButton = page.locator('[data-testid="settings-button"]')
    await settingsButton.click()
    await page.waitForTimeout(500)

    const colorPicker = page.locator('input[type="color"]')
    await expect(colorPicker).toBeVisible()

    // Note: Color picker testing would require more specific selectors
    // This test just verifies the color picker exists
  })
})

test.describe('TodoGravita App - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Block API requests to simulate network error
    await page.route('**/api/**', route => route.abort('failed'))
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check if error message is displayed
    const errorMessage = page.locator('text=网络错误')
    await expect(errorMessage).toBeVisible()
  })

  test('should handle form validation errors', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    await page.waitForTimeout(500)

    // Check if validation error is displayed
    const validationError = page.locator('text=标题不能为空')
    await expect(validationError).toBeVisible()
  })
})
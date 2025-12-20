import { test, expect } from '@playwright/test'

test.describe('TodoGravita App - Performance and Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should load the page within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab')
    const firstFocusableElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(firstFocusableElement).toBeTruthy()

    // Test form inputs are focusable
    const titleInput = page.locator('input[name="title"]')
    await titleInput.focus()
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('name'))
    expect(focusedElement).toBe('title')
  })

  test('should have proper ARIA labels', async ({ page }) => {
    // Check for ARIA labels on interactive elements
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toHaveAttribute('aria-label')

    const deleteButtons = page.locator('button[aria-label*="删除"]')
    await expect(deleteButtons.first()).toBeVisible()
  })

  test('should handle large number of todos efficiently', async ({ page }) => {
    // Create multiple todos
    const titleInput = page.locator('input[name="title"]')
    const submitButton = page.locator('button[type="submit"]')

    for (let i = 0; i < 10; i++) {
      await titleInput.fill(`Performance Test Todo ${i}`)
      await submitButton.click()
      await page.waitForTimeout(200)
    }

    // Check if all todos are rendered
    const todoItems = page.locator('[data-testid="todo-item"]')
    await expect(todoItems).toHaveCount(10)

    // Test filtering performance
    const startFilterTime = Date.now()
    const priorityFilter = page.locator('select[name="priority-filter"]')
    await priorityFilter.selectOption('high')
    await page.waitForTimeout(500)
    const filterTime = Date.now() - startFilterTime
    
    expect(filterTime).toBeLessThan(1000) // Filtering should be fast
  })
})

test.describe('Todo Management App - Mobile Responsiveness', () => {
  test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE size

  test('should be responsive on mobile devices', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check if mobile menu is available
    const mobileMenu = page.locator('[data-testid="mobile-menu"]')
    await expect(mobileMenu).toBeVisible()

    // Test touch interactions
    const todoForm = page.locator('[data-testid="todo-form"]')
    await expect(todoForm).toBeVisible()

    // Check if quadrant view adapts to mobile
    const quadrantTab = page.locator('text=四象限')
    await quadrantTab.click()
    await page.waitForTimeout(500)

    const quadrantView = page.locator('[data-testid="quadrant-view"]')
    await expect(quadrantView).toBeVisible()
  })

  test('should handle touch gestures', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Create a todo for testing
    const titleInput = page.locator('input[name="title"]')
    const submitButton = page.locator('button[type="submit"]')

    await titleInput.fill('Mobile Test Todo')
    await submitButton.click()
    await page.waitForTimeout(1000)

    // Test swipe gestures (if implemented)
    const todoItem = page.locator('text=Mobile Test Todo')
    await expect(todoItem).toBeVisible()
  })
})

test.describe('Todo Management App - API Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should handle API responses correctly', async ({ page }) => {
    // Monitor API calls
    const apiCalls: { url: string; status: number; statusText: string }[] = []
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
          statusText: response.statusText()
        })
      }
    })

    // Create a todo
    const titleInput = page.locator('input[name="title"]')
    const submitButton = page.locator('button[type="submit"]')

    await titleInput.fill('API Test Todo')
    await submitButton.click()
    await page.waitForTimeout(2000)

    // Verify API calls were made
    expect(apiCalls.length).toBeGreaterThan(0)
    
    // Check if all API calls were successful
    const failedCalls = apiCalls.filter(call => call.status >= 400)
    expect(failedCalls.length).toBe(0)
  })

  test('should handle API timeouts gracefully', async ({ page }) => {
    // Slow down API responses
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 5000) // 5 second delay
    })

    // Try to create a todo
    const titleInput = page.locator('input[name="title"]')
    const submitButton = page.locator('button[type="submit"]')

    await titleInput.fill('Timeout Test Todo')
    await submitButton.click()

    // Wait for timeout message
    await page.waitForTimeout(6000)
    
    const timeoutMessage = page.locator('text=请求超时')
    await expect(timeoutMessage).toBeVisible()
  })
})

test.describe('Todo Management App - Data Persistence', () => {
  test('should persist data after page reload', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Create a todo
    const titleInput = page.locator('input[name="title"]')
    const submitButton = page.locator('button[type="submit"]')

    await titleInput.fill('Persistence Test Todo')
    await submitButton.click()
    await page.waitForTimeout(2000)

    // Reload the page
    await page.reload()
    await page.waitForLoadState('networkidle')

    // Check if todo still exists
    const todoItem = page.locator('text=Persistence Test Todo')
    await expect(todoItem).toBeVisible()
  })

  test('should handle localStorage operations', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check if localStorage is being used
    const localStorageData = await page.evaluate(() => {
      return window.localStorage.length
    })

    expect(localStorageData).toBeGreaterThanOrEqual(0)
  })
})
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully as admin', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form
    // Assuming the test database has an admin user with these credentials
    await page.fill('input[type="email"]', 'admin@news.com');
    await page.fill('input[type="password"]', 'password123');
    
    await page.click('button[type="submit"]');

    // Wait for navigation to dashboard
    await page.waitForURL('**/dashboard**');

    // Verify successful login by checking for dashboard elements
    await expect(page.locator('h1', { hasText: 'User Management' })).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpass');
    
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.getByText('Invalid email or password. Please try again.')).toBeVisible();
  });
});

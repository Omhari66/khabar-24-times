import { test, expect } from '@playwright/test';

test.describe('Public Website Features', () => {
  test('should load homepage and display top headlines', async ({ page }) => {
    await page.goto('/');
    
    // Expect the title to contain Khabar 24 Times
    await expect(page).toHaveTitle(/Home \| Khabar 24 Times/i);
    
    // Expect the hero section to be visible
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
    
    // The breaking news ticker might not be visible if there are no breaking articles
    // so we don't strictly require it for the public homepage test.
  });

  test('should allow searching for articles', async ({ page }) => {
    await page.goto('/search');
    
    // Ensure the search page loaded
    await expect(page.getByRole('heading', { name: /Search News/i })).toBeVisible();

    // Perform a search
    await page.fill('input[type="search"]', 'Test');
    await page.click('button[type="submit"]');

    // Verify search results heading
    await expect(page.getByRole('heading', { name: /Showing results for/i })).toBeVisible();
  });

  test('should have working login redirect for protected paths', async ({ page }) => {
    // Attempting to visit dashboard without auth
    await page.goto('/dashboard/admin');
    
    // Should be redirected to login
    await expect(page).toHaveURL(/.*\/login/);
  });
});

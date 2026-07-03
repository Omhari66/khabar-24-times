import { test, expect } from '@playwright/test';

test.describe('Editor Workflow', () => {
  test('should allow creating a draft article', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@news.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for Next.js to navigate us (could be /dashboard or /dashboard/admin depending on session cache)
    await page.waitForURL('**/dashboard**');

    // 2. Go to Reporter Dashboard to create article
    await page.goto('/dashboard/reporter');
    await page.click('text=New Article');
    await page.waitForURL('**/dashboard/reporter/new**');

    // 3. Fill in article details
    const uniqueTitle = `Test Article ${Date.now()}`;
    await page.fill('input[name="title"]', uniqueTitle);
    
    // Select category (assuming the first category is fine)
    await page.selectOption('select[name="categoryId"]', { index: 1 });

    // The Tiptap editor doesn't use a standard textarea, we need to click into the Prosemirror div
    await page.locator('.ProseMirror').fill('This is a test article body content for end-to-end testing.');

    // 4. Save Draft
    await page.click('button:has-text("Save Draft")');

    // Wait for success toast or redirection
    // Next.js router might not redirect immediately, or we might stay on page depending on implementation.
    // The implementation of ArticleForm in reporter dashboard typically redirects to the edit page on success.
    await page.waitForURL('**/dashboard/reporter/**/edit**', { timeout: 10000 }).catch(() => {
        // If it doesn't redirect, that's fine, we just verify the network response or toast.
    });

    // 5. Verify the article appears in the dashboard
    await page.goto('/dashboard/reporter');
    await expect(page.locator(`text=${uniqueTitle}`).first()).toBeVisible();
  });
});

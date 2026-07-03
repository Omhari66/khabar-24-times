# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: editor.spec.ts >> Editor Workflow >> should allow creating a draft article
- Location: tests\e2e\editor.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard/reporter/new**" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - heading "Reporter Dashboard" [level=1] [ref=e6]
        - paragraph [ref=e7]: Welcome back, Admin User. Manage and write your news stories.
      - link "New Article" [active] [ref=e9] [cursor=pointer]:
        - /url: /dashboard/reporter/new
        - img [ref=e10]
        - text: New Article
    - generic [ref=e11]:
      - generic [ref=e12]:
        - generic [ref=e13]:
          - img [ref=e14]
          - generic [ref=e16]: Total
        - paragraph [ref=e17]: "1"
      - generic [ref=e18]:
        - generic [ref=e19]:
          - img [ref=e20]
          - generic [ref=e23]: Drafts
        - paragraph [ref=e24]: "0"
      - generic [ref=e25]:
        - generic [ref=e26]:
          - img [ref=e27]
          - generic [ref=e30]: Pending
        - paragraph [ref=e31]: "1"
      - generic [ref=e32]:
        - generic [ref=e33]:
          - img [ref=e34]
          - generic [ref=e37]: Published
        - paragraph [ref=e38]: "0"
      - generic [ref=e39]:
        - generic [ref=e40]:
          - img [ref=e41]
          - generic [ref=e45]: Rejected
        - paragraph [ref=e46]: "0"
    - generic [ref=e48]:
      - generic [ref=e49]:
        - generic [ref=e50]:
          - generic [ref=e51]:
            - img [ref=e52]
            - text: Pending Review
          - generic [ref=e55]:
            - img [ref=e56]
            - text: महाराष्ट्र
          - generic [ref=e59]:
            - img [ref=e60]
            - text: 23h ago
        - generic [ref=e62]:
          - heading "'बेटी के अफेयर की भनक भी होती तो...', केतन हत्याकांड में सिया के पिता का बड़ा बयान" [level=2] [ref=e63]
          - paragraph [ref=e64]: "slug: केतन अग्रवाल हत्याकांड में गिरफ्तार सिया गोयल के पिता प्रवीण"
      - generic [ref=e65]:
        - generic [ref=e66]: Under Review
        - img [ref=e67]
  - alert [ref=e69]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Editor Workflow', () => {
  4  |   test('should allow creating a draft article', async ({ page }) => {
  5  |     // 1. Login
  6  |     await page.goto('/login');
  7  |     await page.fill('input[type="email"]', 'admin@news.com');
  8  |     await page.fill('input[type="password"]', 'password123');
  9  |     await page.click('button[type="submit"]');
  10 |     
  11 |     // Wait for Next.js to navigate us (could be /dashboard or /dashboard/admin depending on session cache)
  12 |     await page.waitForURL('**/dashboard**');
  13 | 
  14 |     // 2. Go to Reporter Dashboard to create article
  15 |     await page.goto('/dashboard/reporter');
  16 |     await page.click('text=New Article');
> 17 |     await page.waitForURL('**/dashboard/reporter/new**');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  18 | 
  19 |     // 3. Fill in article details
  20 |     const uniqueTitle = `Test Article ${Date.now()}`;
  21 |     await page.fill('input[name="title"]', uniqueTitle);
  22 |     
  23 |     // Select category (assuming the first category is fine)
  24 |     await page.selectOption('select[name="categoryId"]', { index: 1 });
  25 | 
  26 |     // The Tiptap editor doesn't use a standard textarea, we need to click into the Prosemirror div
  27 |     await page.locator('.ProseMirror').fill('This is a test article body content for end-to-end testing.');
  28 | 
  29 |     // 4. Save Draft
  30 |     await page.click('button:has-text("Save Draft")');
  31 | 
  32 |     // Wait for success toast or redirection
  33 |     // Next.js router might not redirect immediately, or we might stay on page depending on implementation.
  34 |     // The implementation of ArticleForm in reporter dashboard typically redirects to the edit page on success.
  35 |     await page.waitForURL('**/dashboard/reporter/**/edit**', { timeout: 10000 }).catch(() => {
  36 |         // If it doesn't redirect, that's fine, we just verify the network response or toast.
  37 |     });
  38 | 
  39 |     // 5. Verify the article appears in the dashboard
  40 |     await page.goto('/dashboard/reporter');
  41 |     await expect(page.locator(`text=${uniqueTitle}`).first()).toBeVisible();
  42 |   });
  43 | });
  44 | 
```
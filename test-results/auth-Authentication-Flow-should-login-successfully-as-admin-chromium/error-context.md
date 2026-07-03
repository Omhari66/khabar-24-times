# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should login successfully as admin
- Location: tests\e2e\auth.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard**" until "load"
  navigated to "http://localhost:3000/login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fdashboard"
  navigated to "http://localhost:3000/login?callbackUrl=http%3A%2F%2Flocalhost%3A3000%2Fdashboard"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e6]:
    - generic [ref=e7]:
      - img [ref=e9]
      - paragraph [ref=e12]: Internal newsroom
      - heading "Staff Login" [level=1] [ref=e13]
      - paragraph [ref=e14]: Sign in to manage reporting, review submissions, and operate the publishing desk.
    - generic [ref=e15]:
      - generic [ref=e16]:
        - generic [ref=e17]: Email address
        - textbox "Email address" [ref=e18]:
          - /placeholder: reporter@news.com
      - generic [ref=e19]:
        - generic [ref=e20]: Password
        - textbox "Password" [ref=e21]:
          - /placeholder: Enter your password
      - button "Sign in" [ref=e22] [cursor=pointer]:
        - img [ref=e23]
        - text: Sign in
  - alert [ref=e26]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flow', () => {
  4  |   test('should login successfully as admin', async ({ page }) => {
  5  |     await page.goto('/login');
  6  |     
  7  |     // Fill in login form
  8  |     // Assuming the test database has an admin user with these credentials
  9  |     await page.fill('input[type="email"]', 'admin@news.com');
  10 |     await page.fill('input[type="password"]', 'password123');
  11 |     
  12 |     await page.click('button[type="submit"]');
  13 | 
  14 |     // Wait for navigation to dashboard
> 15 |     await page.waitForURL('**/dashboard**');
     |                ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  16 | 
  17 |     // Verify successful login by checking for dashboard elements
  18 |     await expect(page.locator('h1', { hasText: 'User Management' })).toBeVisible();
  19 |   });
  20 | 
  21 |   test('should show error with invalid credentials', async ({ page }) => {
  22 |     await page.goto('/login');
  23 |     
  24 |     await page.fill('input[type="email"]', 'wrong@example.com');
  25 |     await page.fill('input[type="password"]', 'wrongpass');
  26 |     
  27 |     await page.click('button[type="submit"]');
  28 | 
  29 |     // Verify error message
  30 |     await expect(page.getByText('Invalid email or password. Please try again.')).toBeVisible();
  31 |   });
  32 | });
  33 | 
```
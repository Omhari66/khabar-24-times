# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication Flow >> should show error with invalid credentials
- Location: tests\e2e\auth.spec.ts:21:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Invalid email or password. Please try again.')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Invalid email or password. Please try again.')

```

```yaml
- paragraph: Internal newsroom
- heading "Staff Login" [level=1]
- paragraph: Sign in to manage reporting, review submissions, and operate the publishing desk.
- text: Email address
- textbox "Email address":
  - /placeholder: reporter@news.com
  - text: wrong@example.com
- text: Password
- textbox "Password":
  - /placeholder: Enter your password
  - text: wrongpass
- button "Signing in..." [disabled]
- alert
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
  15 |     await page.waitForURL('**/dashboard**');
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
> 30 |     await expect(page.getByText('Invalid email or password. Please try again.')).toBeVisible();
     |                                                                                  ^ Error: expect(locator).toBeVisible() failed
  31 |   });
  32 | });
  33 | 
```
import { test, expect } from '@playwright/test';

test('Landing Pages', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Expect a title "to contain" a substring.
  await expect(page.getByText('Get Started')).toBeVisible();
});
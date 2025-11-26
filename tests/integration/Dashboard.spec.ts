
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {

  const email = process.env.TEST_EMAIL!;
  const password = process.env.TEST_PASSWORD!;

  test.beforeEach(async ({ page }) => {
    // Log in before each test
    await page.goto('/auth/login');
    await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('displays all default widgets', async ({ page }) => {
    // Check for the presence of the default widgets
    await expect(page.getByRole('heading', { name: 'Upcoming Events' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upcoming Deadlines' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Progress Overview' })).toBeVisible();
  });

  test('allows a user to customize visible widgets', async ({ page }) => {
    // Open the customization modal
    await page.getByRole('button', { name: 'Customize Dashboard' }).click();

    //Reset to Default
    await page.getByRole('button', { name: 'Reset to Default' }).click();

    // Uncheck the "Upcoming Events" widget
    await page.getByRole('checkbox').first().click(); // Uncheck "Upcoming Events"

    // Save the changes
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify that the "Recent Activity" widget is no longer visible
    await expect(page.getByRole('heading', { name: 'Upcoming Events' })).not.toBeVisible();
    // Verify that other widgets are still visible
    await expect(page.getByRole('heading', { name: 'Recent Activity' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upcoming Deadlines' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Progress Overview' })).toBeVisible();
  });
});

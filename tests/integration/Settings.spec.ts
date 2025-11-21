
import { test, expect } from '@playwright/test';

const MOCK_USER = {
  id: 'user-123',
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  // other profile data
};

test.describe('Settings and Profile Management', () => {

  const email = process.env.TEST_EMAIL!;
  const password = process.env.TEST_PASSWORD!;

  // Log in before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login');
    await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display current user information on the settings page', async ({ page }) => {
    // Mock the API for fetching user data
    await page.route('**/api/user/profile', (route) => {
      route.fulfill({ status: 200, body: JSON.stringify(MOCK_USER) });
    });

    await page.goto('/settings');

    // Verify that the user's current data is visible
    await expect(page.locator(`text=${MOCK_USER.name}`)).toBeVisible();
    await expect(page.locator(`text=${MOCK_USER.email}`)).toBeVisible();
  });

  test('should allow a user to update their profile information', async ({ page }) => {
    // Mock the initial data load and the update API call
    await page.route('**/api/user/profile', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({ status: 200, body: JSON.stringify(MOCK_USER) });
      }
      if (route.request().method() === 'PUT') {
        route.fulfill({ status: 200, body: JSON.stringify({ ...MOCK_USER, name: 'Alexandra Johnson' }) });
      }
    });

    await page.goto('/settings');
    
    // Open the edit profile modal
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    await page.getByRole('dialog', { name: 'Edit Profile' }).waitFor();

    // Update the name field
    const nameInput = page.getByRole('textbox', { name: 'Full Name' });
    await nameInput.clear();
    await nameInput.fill('Alexandra Johnson');

    // Save the changes
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Assert that the UI is updated with the new information
    await expect(page.getByRole('dialog', { name: 'Edit Profile' })).not.toBeVisible();
    await expect(page.locator('text=Alexandra Johnson')).toBeVisible();
    await expect(page.locator('text=Profile updated successfully')).toBeVisible();
  });

});

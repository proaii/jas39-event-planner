import { test, expect } from '@playwright/test';

test('Landing Pages : Page Landing', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Expect a title "to contain" a substring.
  await expect(page.getByText('Get Started')).toBeVisible();
});

test('Landing Pages : Unauthorized Path for Unauthenticated User Blocked', async ({ page }) => {

    await page.goto('http://localhost:3000');

    // Expect a title "to contain" a substring.
    await expect(page.getByText('Get Started')).toBeVisible();

    await page.goto('http://localhost:3000/dashboard');
    
    await expect(page.locator('body')).toContainText('401');
    await expect(page.locator('body')).toContainText('You are not authorized to view this page.');
});

test('Landing Pages : Unauthorized Path for Authenticated User Blocked', async ({ page }) => {

    // Perform a successful login
    const email = process.env.TEST_EMAIL!;
    const password = process.env.TEST_PASSWORD!;

    await page.goto('http://localhost:3000/auth/login');

    // Expect a title "to contain" a substring.
    await expect(page.getByText('Welcome Back')).toBeVisible();

    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await page.waitForURL('**/dashboard');

    await expect(page.getByText(email)).toBeVisible();

    // Attempt to navigate back to the login page
    await page.goto('http://localhost:3000/auth/login');

    // Should be redirected back to the dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');

    // Attempt to navigate back to the sign-up page
    await page.goto('http://localhost:3000/auth/sign-up');

    // Should be redirected back to the dashboard
    await expect(page).toHaveURL('http://localhost:3000/dashboard');


});


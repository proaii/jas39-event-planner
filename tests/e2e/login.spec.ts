import 'dotenv/config';
import { test, expect } from '@playwright/test';

test('Login : Forgot Password Request Success', async ({ page }) => {

    const email = process.env.TEST_EMAIL!;  

    await page.goto('http://localhost:3000/auth/login');

    // Expect a title "to contain" a substring.
    await expect(page.getByText('Welcome Back')).toBeVisible();

    await page.getByRole('button', { name: 'Forgot Password?' }).click();
    await expect(page.locator('body')).toContainText('Type in your email and we\'ll send you a link to reset your password');

    await page.getByRole('textbox', { name: 'Email' }).fill(email);
    await page.getByRole('button', { name: 'Send reset email' }).click();

    await expect(page.locator('body')).toContainText('Password reset instructions sent');
});

test('Login : Failed (Invalid Credential)', async ({ page }) => {

    const email = process.env.TEST_EMAIL!;
    const wrongpass = process.env.TEST_WRONGPASS!;

    await page.goto('http://localhost:3000/auth/login');

    // Expect a title "to contain" a substring.
    await expect(page.getByText('Welcome Back')).toBeVisible();

    await page.getByRole('textbox', { name: 'Email Address' }).click();
    await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(wrongpass);
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();

    await expect(page.locator('form')).toContainText('Invalid login credentials');
});

test('Login : Success (Valid Credential)', async ({ page }) => {

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
});
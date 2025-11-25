import 'dotenv/config';
import { test, expect } from '@playwright/test';

test('Events : Create Event', async ({ page }) => {

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

    await page.getByRole('button', { name: 'Create Event' }).click();
    await page.getByRole('textbox', { name: 'Event Title' }).click();
    await page.getByRole('textbox', { name: 'Event Title' }).fill('Test Event');
    await page.getByRole('textbox').nth(1).click();
    await page.getByRole('textbox').nth(1).fill('Test Zone');
    await page.getByRole('checkbox').check();
    await page.getByRole('textbox').nth(2).fill('2025-11-27');
    await page.getByRole('textbox').nth(4).fill('2025-11-29');
    await page.getByRole('textbox').nth(3).click();
    await page.getByRole('textbox').nth(3).fill('08:00');
    await page.getByRole('textbox').nth(5).click();
    await page.getByRole('textbox').nth(5).fill('17:00');
    await page.locator('textarea').click();
    await page.locator('textarea').fill('Test Ja');

    await page.getByRole('button', { name: 'Accent' }).click();
    await page.getByRole('button', { name: 'Add Team Member' }).click();
    await page.getByText('Alice', { exact: true }).click();
    await page.locator('div').filter({ hasText: 'AAlicealice@example.com' }).nth(2).click();
    await page.getByRole('textbox', { name: 'Search by name or email...' }).click();
    await page.getByRole('textbox', { name: 'Search by name or email...' }).fill('Bob');
    await page.getByText('Bob', { exact: true }).click();
    await page.getByRole('button', { name: 'Invite (1)' }).click();
    await page.getByRole('button', { name: 'Create Event' }).click();


});
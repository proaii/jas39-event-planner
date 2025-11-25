// import 'dotenv/config';
// import { test, expect } from '@playwright/test';

// test('Tasks : Create & Assign Task', async ({ page }) => {

//     const email = process.env.TEST_EMAIL!;
//     const password = process.env.TEST_PASSWORD!;

//     await page.goto('http://localhost:3000/auth/login');

//     // Expect a title "to contain" a substring.
//     await expect(page.getByText('Welcome Back')).toBeVisible();

//     await page.getByRole('textbox', { name: 'Email Address' }).click();
//     await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
//     await page.getByRole('textbox', { name: 'Password' }).click();
//     await page.getByRole('textbox', { name: 'Password' }).fill(password);
//     await page.getByRole('button', { name: 'Sign In', exact: true }).click();

//     await page.waitForURL('**/dashboard');

//     await expect(page.getByText(email)).toBeVisible();

// });
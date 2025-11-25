// import 'dotenv/config';
// import { test as base, chromium, expect } from '@playwright/test';

// const test = base.extend({
//   context: async ({}, use) => {
//     const browser = await chromium.launch({
//       headless: false, // must be visible
//       args: [
//         '--disable-blink-features=AutomationControlled',
//         '--disable-web-security',
//         '--disable-features=IsolateOrigins,site-per-process'
//       ]
//     });
//     const context = await browser.newContext({
//       userAgent:
//         'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
//     });
//     await use(context);
//     await browser.close();
//   }
// });

// test('Google Auth Login Test', async ({ page }) => {

//     const gmail = process.env.TEST_GMAIL!;
//     const password = process.env.TEST_GMAILPASSWORD!;

//     await page.goto('http://localhost:3000/auth/login');
//     await page.getByRole('button', { name: 'Sign in with Google' }).click();

//     await page.getByRole('textbox', { name: 'Email or phone' }).click();
//     await page.getByRole('textbox', { name: 'Email or phone' }).fill(gmail);
//     await page.getByRole('button', { name: 'Next' }).click();

//     await expect(page.getByText('Show password')).toBeVisible({ timeout: 0 });

//     await page.getByRole('textbox', { name: 'Enter your password' }).click();
//     await page.getByRole('textbox', { name: 'Enter your password' }).fill(password);
//     await page.getByRole('button', { name: 'Next' }).click();

//     await page.waitForURL('**/dashboard');

//     await expect(page.getByText(gmail)).toBeVisible();

// });

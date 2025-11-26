// import 'dotenv/config';
// import { test, expect } from '@playwright/test';

// test.describe('Dashboard : Components Present', () => {
//   test.beforeEach(async ({ page }) => {
//     const email = process.env.TEST_EMAIL!;
//     const password = process.env.TEST_PASSWORD!;

//     // login
//     await page.goto('http://localhost:3000/auth/login');
//     await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
//     await page.getByRole('textbox', { name: 'Password' }).fill(password);
//     await page.getByRole('button', { name: 'Sign In', exact: true }).click();

//     await page.waitForURL('**/dashboard');
//   });

//   test('dashboard main components are not missing', async ({ page }) => {
//     // --- Page-level anchors ---
//     const email = process.env.TEST_EMAIL!;
//     await expect(page.getByText(email)).toBeVisible();

//     // --- Sidebar / nav items (from your HTML) ---
//     const sidebar = page.getByRole('navigation');
//     await expect(sidebar).toBeVisible();

//     await expect(sidebar.getByRole('link', { name: 'Dashboard' })).toBeVisible();
//     await expect(sidebar.getByRole('link', { name: 'Events' })).toBeVisible();
//     await expect(sidebar.getByRole('link', { name: 'Tasks' })).toBeVisible();
//     await expect(sidebar.getByRole('link', { name: 'Calendar' })).toBeVisible();
//     await expect(sidebar.getByRole('link', { name: 'Settings' })).toBeVisible();

//     // --- Primary header actions ---
//     await expect(page.getByRole('button', { name: /customize dashboard/i })).toBeVisible();
//     await expect(page.getByRole('button', { name: /create event/i })).toBeVisible();

//     // --- Key dashboard sections/cards ---
//     await expect(page.getByRole('heading', { name: /upcoming events/i })).toBeVisible();

//     // Optional: ensure at least one card/grid exists
//     await expect(page.locator('main .grid').first()).toBeVisible();
//   });
// });

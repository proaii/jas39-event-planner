
// import { test, expect } from '@playwright/test';

// const TEST_EMAIL = process.env.TEST_EMAIL!;
// const TEST_PASSWORD = process.env.TEST_PASSWORD!;

// test.describe('Authentication', () => {
//   test.describe('Sign-Up Flow', () => {
//     test('allows a new user to sign up successfully', async ({ page }) => {
//       await page.route('**/api/auth/callback/credentials', (route) => {
//         route.fulfill({ status: 200, body: JSON.stringify({ message: 'Sign up successful' }) });
//       });

//       await page.goto('/auth/sign-up');
//       await page.getByRole('textbox', { name: 'First Name' }).fill('newuser');
//       await page.getByRole('textbox', { name: 'Last Name' }).fill('newuser');
//       await page.getByRole('textbox', { name: 'Email' }).fill('newuser@gmail.com');
//       await page.getByRole('textbox', { name: 'Create a Password' }).fill('a-secure-password');
//       await page.getByRole('textbox', { name: 'Confirm your Password' }).fill('a-secure-password');
//       await page.getByRole('button', { name: 'Create Account' }).click();

//       await expect(page).toHaveURL('/auth/sign-up-success');
//       await expect(page.getByRole('heading', { name: 'Account Created!' })).toBeVisible();
//     });

//     test('displays an error if the email is already in use', async ({ page }) => {
//       await page.route('**/api/auth/callback/credentials', (route) => {
//         route.fulfill({ status: 409, body: JSON.stringify({ message: 'Email is already in use' }) });
//       });

//       await page.goto('/auth/sign-up');
//       await page.getByRole('textbox', { name: 'First Name' }).fill('Arkkhanirut');
//       await page.getByRole('textbox', { name: 'Last Name' }).fill('Pandej');
//       await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL);
//       await page.getByRole('textbox', { name: 'Create a Password' }).fill(TEST_PASSWORD);
//       await page.getByRole('textbox', { name: 'Confirm your Password' }).fill(TEST_PASSWORD);
//       await page.getByRole('button', { name: 'Create Account' }).click();

//       await expect(page.locator('text=permission denied for table users')).toBeVisible();
//       await expect(page).toHaveURL('/auth/sign-up');
//     });
//   });

//   test.describe('Login Flow', () => {
//     test('allows an existing user to log in successfully', async ({ page }) => {
//       await page.route('**/api/auth/login', (route) => {
//         route.fulfill({ status: 200, body: JSON.stringify({ message: 'Login successful' }) });
//       });

//       await page.goto('/auth/login');
//       await page.getByRole('textbox', { name: 'Email Address' }).fill(TEST_EMAIL);
//       await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD);
//       await page.getByRole('button', { name: 'Sign In', exact: true }).click();

//       await expect(page).toHaveURL('/dashboard');
//     });

//     test('displays an error message on a failed login attempt', async ({ page }) => {
//       await page.route('**/api/auth/login', (route) => {
//         route.fulfill({ status: 401, body: JSON.stringify({ message: 'Invalid credentials' }) });
//       });

//       await page.goto('/auth/login');
//       await page.getByRole('textbox', { name: 'Email Address' }).fill('wrong@example.com');
//       await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
//       await page.getByRole('button', { name: 'Sign In', exact: true }).click();

//       await expect(page.locator('text=Invalid login credentials')).toBeVisible();
//     });
//   });

//   test.describe('Password Reset', () => {
//     test('allows a user to request a password reset link', async ({ page }) => {
//       await page.route('**/api/auth/forgot-password', (route) => {
//         route.fulfill({ status: 200, body: JSON.stringify({ message: 'Password reset email sent' }) });
//       });

//       await page.goto('/auth/forgot-password');
//       await page.getByRole('textbox', { name: 'Email' }).fill(TEST_EMAIL);
//       await page.getByRole('button', { name: 'Send reset email' }).click();

//       await page.getByText('Check Your Email').click();
//     });

//     // test('allows a user to update their password via the reset flow', async ({ page }) => {
//     //   await page.route('**/api/auth/update-password', (route) => {
//     //     route.fulfill({ status: 200, body: JSON.stringify({ message: 'Password updated successfully' }) });
//     //   });
      
//     //   await page.goto('/auth/update-password');
//     //   await page.getByRole('textbox', { name: 'New Password' }).fill('new-secure-password');
//     //   await page.getByRole('textbox', { name: 'Confirm New Password' }).fill('new-secure-password');
//     //   await page.getByRole('button', { name: 'Update Password' }).click();

//     //   await expect(page).toHaveURL('/auth/login');
//     //   await expect(page.locator('text=Password updated successfully')).toBeVisible();
//     // });
//   });

//   test.describe('Route Protection', () => {
//     test('redirects unauthenticated users from protected routes', async ({ page }) => {
//       await page.goto('/dashboard');
//       await expect(page).toHaveURL('/error?code=401&message=You%20are%20not%20authorized%20to%20view%20this%20page.');
//       await page.getByRole('link', { name: 'Go back to Home' }).click();
//     });

//     test('redirects authenticated users from public-only routes', async ({ page }) => {
//       // Perform a successful login
//       await page.goto('/auth/login');
//       await page.getByRole('textbox', { name: 'Email Address' }).fill(TEST_EMAIL);
//       await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD);
//       await page.getByRole('button', { name: 'Sign In', exact: true }).click();
//       await expect(page).toHaveURL('/dashboard');

//       // Attempt to navigate back to the login page
//       await page.goto('/auth/login');
//       // Should be redirected back to the dashboard
//       await expect(page).toHaveURL('/dashboard');
//     });
//   });
// });

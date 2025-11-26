// import { test, expect } from '@playwright/test';

// const TEST_EMAIL = process.env.TEST_EMAIL!;
// const TEST_PASSWORD = process.env.TEST_PASSWORD!;

// const MOCK_EVENTS = [
//   { id: '1', name: 'Community Tech Day', date: '2025-10-26T10:00:00.000Z', location: 'City Convention Center', description: 'A full day of tech talks.', progress: 'Planning' },
//   { id: '2', name: "John's Birthday Party", date: '2025-11-05T18:00:00.000Z', location: 'Private Residence', description: 'A surprise party.', progress: 'Completed' },
//   { id: '3', name: 'Annual Conference', date: '2026-01-15T09:00:00.000Z', location: 'Grand Hotel', description: 'The company\'s annual conference.', progress: 'Planning' },
// ];

// test.describe('Events Management', () => {

//   // Authenticate once before any tests in this suite run.
//   test.beforeEach(async ({ page }) => {
//     await page.goto('/auth/login');
//     await page.getByRole('textbox', { name: 'Email Address' }).fill(TEST_EMAIL);
//     await page.getByRole('textbox', { name: 'Password' }).fill(TEST_PASSWORD);
//     await page.getByRole('button', { name: 'Sign In', exact: true }).click();
//     await expect(page).toHaveURL('/dashboard');
//   });

//   test.describe('CRUD Operations', () => {
    
//     test('allows a user to create, view, edit, and delete an event', async ({ page }) => {
//       // --- CREATE ---
//       await page.route('**/api/events', (route) => {
//         if (route.request().method() === 'POST') {
//           route.fulfill({ status: 201, body: JSON.stringify({ id: '4', name: 'New Test Event' }) });
//         }
//       });
      
//       await page.goto('/events');
//       await page.getByRole('button', { name: 'Create Event' }).click();

//       // Fill and submit the creation form
//       await page.getByRole('dialog', { name: 'Create Event' }).waitFor();
//       await page.getByRole('textbox', { name: 'Event Title' }).fill('New Test Event');
//       await page.getByRole('textbox', { name: 'Location' }).fill('Virtual');
//       await page.getByRole('button', { name: 'Create Event' }).click();
      
//       await expect(page.getByRole('dialog', { name: 'Create Event' })).not.toBeVisible();
//       await expect(page.getByRole('heading', { name: 'New Test Event' })).toBeVisible();

//       // --- VIEW ---
//       const viewEvent = MOCK_EVENTS[0];
//       await page.route(`**/api/events/${viewEvent.id}`, (route) => {
//         route.fulfill({ status: 200, body: JSON.stringify(viewEvent) });
//       });

//       await page.goto(`/events/${viewEvent.id}`);
//       await expect(page.getByRole('heading', { name: viewEvent.name })).toBeVisible();
//       await expect(page.locator(`text=${viewEvent.location}`)).toBeVisible();

//       // --- EDIT ---
//       await page.route(`**/api/events/${viewEvent.id}`, (route) => {
//         if (route.request().method().includes('PUT') || route.request().method().includes('PATCH')) {
//           route.fulfill({ status: 200, body: JSON.stringify({ ...viewEvent, name: 'Updated Community Day' }) });
//         }
//       });

//       await page.getByRole('button', { name: 'Edit Event' }).click();
//       await page.getByRole('dialog', { name: 'Edit Event' }).waitFor();
//       const titleInput = page.getByRole('textbox', { name: 'Event Title' });
//       await titleInput.clear();
//       await titleInput.fill('Updated Community Day');
//       await page.getByRole('button', { name: 'Save Changes' }).click();
      
//       await expect(page.getByRole('heading', { name: 'Updated Community Day' })).toBeVisible();
//       await expect(page.locator('text=Event updated successfully')).toBeVisible();

//       // --- DELETE ---
//       await page.route(`**/api/events/${viewEvent.id}`, (route) => {
//         if (route.request().method() === 'DELETE') {
//           route.fulfill({ status: 204 });
//         }
//       });

//       await page.getByRole('button', { name: 'Delete Event' }).click();
//       await page.getByRole('button', { name: 'Confirm' }).click();

//       await expect(page).toHaveURL('/events');
//       await expect(page.locator('text=Event deleted successfully')).toBeVisible();
//     });
//   });

//   test.describe('Search and Filtering', () => {
    
//     test.beforeEach(async ({ page }) => {
//       // Mock the API response for the events list for all filter tests
//       await page.route('**/api/events', (route) => {
//         route.fulfill({
//           status: 200,
//           body: JSON.stringify(MOCK_EVENTS),
//         });
//       });
//       await page.goto('/events');
//     });

//     test('filters events by a search term', async ({ page }) => {
//       await page.getByPlaceholder('Search events...').fill('Birthday');

//       await expect(page.getByRole('heading', { name: 'Community Tech Day' })).not.toBeVisible();
//       await expect(page.getByRole('heading', { name: "John's Birthday Party" })).toBeVisible();
//     });
//   });
// });

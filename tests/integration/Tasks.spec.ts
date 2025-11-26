
// import { test, expect } from '@playwright/test';

// const MOCK_TASK = {
//   id: 'task-1',
//   title: 'Draft Q4 Report',
//   description: 'Initial draft of the quarterly financial report.',
//   dueDate: '2025-11-15T23:59:59.000Z',
//   completed: false,
// };

// test.describe('Task Management Integration', () => {

//   const email = process.env.TEST_EMAIL!;
//   const password = process.env.TEST_PASSWORD!;

//   test.beforeEach(async ({ page }) => {
//     await page.goto('/auth/login');
//     await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
//     await page.getByRole('textbox', { name: 'Password' }).fill(password);
//     await page.getByRole('button', { name: 'Sign In', exact: true }).click();
//     await expect(page).toHaveURL('/dashboard');
//   });

//   test('should allow a user to create a new task', async ({ page }) => {
//     await page.route('**/api/tasks', (route) => {
//       if (route.request().method() === 'POST') {
//         route.fulfill({ status: 201, body: JSON.stringify({ ...MOCK_TASK, id: 'task-2' }) });
//       }
//     });

//     await page.goto('/tasks');
//     await page.getByRole('button', { name: 'Create Task' }).click();

//     // Fill out the form in the modal
//     await page.getByRole('dialog', { name: 'Add New Task' }).waitFor();
//     await page.getByRole('textbox', { name: 'Task Name *' }).fill('New Marketing Proposal');
//     await page.getByRole('textbox', { name: 'Description' }).fill('Create a proposal for the new campaign.');
//     await page.getByLabel('Due Date').fill('1999-01-01T23:59');
//     await page.getByRole('button', { name: 'Add Task' }).click();

//     // Verify the modal is closed and the new task is visible
//     await expect(page.getByRole('dialog', { name: 'Add Task' })).not.toBeVisible();
//     await expect(page.getByRole('heading', { name: 'New Marketing Proposal' })).toBeVisible();
//   });

//   test('should allow a user to edit a task', async ({ page }) => {
//     // Mock initial data and the update endpoint
//     await page.route('**/api/tasks', (route) => route.fulfill({ status: 200, body: JSON.stringify([MOCK_TASK]) }));
//     await page.route(`**/api/tasks/${MOCK_TASK.id}`, (route) => {
//         if (route.request().method() === 'PUT') {
//             route.fulfill({ status: 200, body: JSON.stringify({ ...MOCK_TASK, title: 'Final Q4 Report' }) });
//         }
//     });

//     await page.goto('/tasks');
//     await page.getByTestId(`task-card-${MOCK_TASK.id}`).getByRole('button', { name: 'Edit' }).click();

//     await page.getByRole('dialog', { name: 'Edit Task' }).waitFor();
//     const titleInput = page.getByRole('textbox', { name: 'Task Title' });
//     await titleInput.clear();
//     await titleInput.fill('Final Q4 Report');
//     await page.getByRole('button', { name: 'Save Changes' }).click();

//     await expect(page.getByRole('heading', { name: 'Final Q4 Report' })).toBeVisible();
//     await expect(page.getByRole('heading', { name: 'Draft Q4 Report' })).not.toBeVisible();
//   });

//   test('should allow a user to mark a task as complete', async ({ page }) => {
//     await page.route('**/api/tasks', (route) => route.fulfill({ status: 200, body: JSON.stringify([MOCK_TASK]) }));
//     await page.route(`**/api/tasks/${MOCK_TASK.id}`, (route) => {
//         if (route.request().method().includes('PATCH')) { // Could be PUT or PATCH
//             route.fulfill({ status: 200, body: JSON.stringify({ ...MOCK_TASK, completed: true }) });
//         }
//     });

//     await page.goto('/tasks');
//     const taskCard = page.getByTestId(`task-card-${MOCK_TASK.id}`);
//     await taskCard.getByRole('checkbox').click();

//     // Assert that the card now visually represents a completed state
//     await expect(taskCard).toHaveClass(/task-completed/); // Assuming a class is used for styling
//   });

//   test('should allow a user to delete a task', async ({ page }) => {
//     await page.route('**/api/tasks', (route) => route.fulfill({ status: 200, body: JSON.stringify([MOCK_TASK]) }));
//     await page.route(`**/api/tasks/${MOCK_TASK.id}`, (route) => {
//         if (route.request().method() === 'DELETE') {
//             route.fulfill({ status: 204 });
//         }
//     });

//     await page.goto('/tasks');
//     await page.getByTestId(`task-card-${MOCK_TASK.id}`).getByRole('button', { name: 'Delete' }).click();
//     await page.getByRole('button', { name: 'Confirm' }).click();

//     await expect(page.getByTestId(`task-card-${MOCK_TASK.id}`)).not.toBeVisible();
//     await expect(page.locator('text=Task deleted successfully')).toBeVisible();
//   });

// });

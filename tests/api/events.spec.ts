
import { test, expect } from '@playwright/test';

test.describe('POST /api/events', () => {
  test('should create a new event with valid data', async ({ request }) => {
    const response = await request.post('/api/events', {
      data: {
        name: 'Test Event from API',
        date: '2026-01-01',
        description: 'This is a test event created from the API test.',
      },
    });

    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('id');
    expect(responseBody.name).toBe('Test Event from API');
  });

  test('should return an error for invalid data', async ({ request }) => {
    const response = await request.post('/api/events', {
      data: {
        // Missing 'name' and 'date'
        description: 'This is an invalid event.',
      },
    });

    expect(response.status()).toBe(400);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('error');
  });
});

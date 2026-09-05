import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/auth/registration', (route) =>
    route.fulfill({ json: { enabled: false } }),
  );
});

test('first-run landing creates the administrator without exposing the token', async ({ page }) => {
  let submitted: unknown;
  let antiforgeryHeader: string | undefined;
  let available = true;
  await page.route('**/api/v1/bootstrap/status', async (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ available }),
    }),
  );
  await page.route('**/api/v1/auth/csrf', async (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"token":"test-antiforgery"}',
    }),
  );
  await page.route('**/api/v1/bootstrap', async (route) => {
    submitted = route.request().postDataJSON();
    antiforgeryHeader = route.request().headers()['x-csrf-token'];
    available = false;
    await route.fulfill({ status: 204 });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Create the first administrator' })).toBeVisible();
  await page.getByLabel('Username').fill('first-admin');
  await page.getByLabel('Password', { exact: true }).fill('Test-only!Password942');
  await page.getByLabel('Bootstrap token').fill('console-token');
  await page.getByRole('button', { name: 'Create administrator' }).click();

  await expect(page).toHaveURL(/\/login$/);
  expect(submitted).toEqual({
    username: 'first-admin',
    password: 'Test-only!Password942',
    token: 'console-token',
  });
  expect(antiforgeryHeader).toBe('test-antiforgery');
});

test('completed bootstrap redirects to sign in', async ({ page }) => {
  await page.route('**/api/v1/bootstrap/status', async (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"available":false}' }),
  );

  await page.goto('/bootstrap');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Bootstrap token')).toHaveCount(0);
});

test('normal sign in discovers first-run setup', async ({ page }) => {
  await page.route('**/api/v1/bootstrap/status', async (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"available":true}' }),
  );

  await page.goto('/login');
  await expect(page).toHaveURL(/\/bootstrap$/);
  await expect(page.getByLabel('Bootstrap token')).toBeVisible();
});

test('status failure falls back to normal sign in', async ({ page }) => {
  await page.route('**/api/v1/bootstrap/status', async (route) =>
    route.fulfill({ status: 503, contentType: 'application/problem+json', body: '{}' }),
  );

  await page.goto('/login');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('rejected token is cleared and reported without server detail', async ({ page }) => {
  await page.route('**/api/v1/bootstrap/status', async (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"available":true}' }),
  );
  await page.route('**/api/v1/auth/csrf', async (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"token":"test-antiforgery"}',
    }),
  );
  await page.route('**/api/v1/bootstrap', async (route) =>
    route.fulfill({
      status: 403,
      contentType: 'application/problem+json',
      body: '{"title":"sensitive backend detail","code":"bootstrap.invalid"}',
    }),
  );

  await page.goto('/bootstrap');
  await page.getByLabel('Username').fill('first-admin');
  await page.getByLabel('Password', { exact: true }).fill('Test-only!Password942');
  await page.getByLabel('Bootstrap token').fill('wrong-token');
  await page.getByRole('button', { name: 'Create administrator' }).click();

  await expect(page.getByRole('alert').filter({ hasText: 'Check the details' })).toBeVisible();
  await expect(page.getByText('sensitive backend detail')).toHaveCount(0);
  await expect(page.getByLabel('Bootstrap token')).toHaveValue('');
});

test('bootstrap form has no detectable WCAG A or AA violations', async ({ page }) => {
  await page.route('**/api/v1/bootstrap/status', async (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{"available":true}' }),
  );
  await page.goto('/bootstrap');
  await expect(page.getByLabel('Bootstrap token')).toBeVisible();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(result.violations).toEqual([]);
});

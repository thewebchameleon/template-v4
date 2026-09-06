import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v1/bootstrap/status', (route) =>
    route.fulfill({ json: { available: false } }),
  );
  await page.route('**/api/v1/auth/registration', (route) =>
    route.fulfill({ json: { enabled: true } }),
  );
  await page.route('**/api/v1/auth/csrf', (route) =>
    route.fulfill({ json: { token: 'test-csrf' } }),
  );
});

test('signup validates passwords, submits only account fields, and requests email verification', async ({
  page,
}) => {
  let submitted: unknown;
  await page.route('**/api/v1/auth/register', (route) => {
    submitted = route.request().postDataJSON();
    expect(route.request().headers()['x-csrf-token']).toBe('test-csrf');
    return route.fulfill({ status: 202 });
  });
  await page.goto('/login');
  await page.getByRole('link', { name: 'Sign up', exact: true }).click();
  await page.getByLabel('Full name').fill('New Reader');
  await page.getByLabel('Email', { exact: true }).fill('reader@example.test');
  await page.getByLabel('Password', { exact: true }).fill('Test-only!Password942');
  await page.getByLabel('Confirm password').fill('different');
  await page.getByRole('heading').click();
  await expect(page.getByText('Passwords must match.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create account' })).toBeDisabled();
  await page.getByLabel('Confirm password').fill('Test-only!Password942');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
  expect(submitted).toEqual({
    displayName: 'New Reader',
    email: 'reader@example.test',
    password: 'Test-only!Password942',
    culture: 'en-ZA',
  });
  await expect(page).toHaveURL(/\/signup$/);
});

test('disabled registration hides signup and handles disabling while form is open', async ({
  page,
}) => {
  await page.route('**/api/v1/auth/registration', (route) =>
    route.fulfill({ json: { enabled: false } }),
  );
  await page.goto('/login');
  await expect(page.getByRole('link', { name: 'Sign up', exact: true })).toHaveCount(0);
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: 'Registration is closed' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Create account' })).toHaveCount(0);
  await page.route('**/api/v1/auth/registration', (route) =>
    route.fulfill({ json: { enabled: true } }),
  );
  await page.reload();
  await page.route('**/api/v1/auth/register', (route) =>
    route.fulfill({
      status: 403,
      json: {
        title: 'Registration is closed',
        code: 'auth.registration_disabled',
        traceId: '00-e37dc492bb35ea3e2b29eebaca947c98-14a26bc7d87d00e2-01',
      },
    }),
  );
  await page.getByLabel('Full name').fill('New Reader');
  await page.getByLabel('Email', { exact: true }).fill('reader@example.test');
  await page.getByLabel('Password', { exact: true }).fill('Test-only!Password942');
  await page.getByLabel('Confirm password').fill('Test-only!Password942');
  await page.getByRole('button', { name: 'Create account' }).click();
  const notification = page.getByRole('region', { name: /Notifications/ });
  await expect(notification).toContainText('Registration is closed');
  await expect(notification).not.toContainText('auth.registration_disabled');
  await expect(notification).not.toContainText('e37dc492');
  await expect(page.getByRole('button', { name: 'Create account' })).toHaveCount(0);
});

test('authentication layouts are accessible and responsive in both themes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/login', '/signup']) {
      await page.goto(route);
      await expect(page.getByRole('heading').first()).toBeVisible();
      await expect(page.locator('.app-header')).toHaveCount(0);
      const panel = await page.locator('.auth-main').boundingBox();
      const preferences = await page.locator('.auth-preferences').boundingBox();
      expect(panel).not.toBeNull();
      expect(preferences).not.toBeNull();
      expect(
        Math.abs(preferences!.x + preferences!.width / 2 - (panel!.x + panel!.width / 2)),
      ).toBeLessThan(2);
      expect(panel!.y + panel!.height - (preferences!.y + preferences!.height)).toBeLessThan(48);
      for (const mode of ['light', 'dark']) {
        await page.getByRole('combobox', { name: 'Appearance' }).click();
        await page
          .getByRole('option', { name: mode === 'light' ? 'Light theme' : 'Dark theme' })
          .click();
        await expect(page.getByRole('option').first()).toBeHidden();
        await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished)));
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await expect(page.locator('.auth-artwork')).toBeVisible({ visible: width >= 1024 });
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
        ).toEqual([]);
      }
    }
  }
  expect(errors).toEqual([]);
});

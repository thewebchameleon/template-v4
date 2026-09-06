import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function mockApp(
  page: Page,
  permissions = ['users.manage', 'settings.manage'],
  mfaConfigured = true,
) {
  const access = {
    accessToken: 'test-access',
    userId: 'current-user',
    culture: 'en-ZA',
    permissions,
    mfaConfigured,
    setupRequired: false,
  };
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const responses: Record<string, unknown> = {
      '/api/v1/auth/csrf': { token: 'test-csrf' },
      '/api/v1/auth/refresh': access,
      '/api/v1/bootstrap/status': { available: false },
      '/api/v1/auth/registration': { enabled: false },
      '/api/v1/auth/registration/options': { enabled: false },
      '/api/v1/auth/profile': {
        id: 'current-user',
        displayName: 'Template Administrator',
        email: 'admin@example.test',
        culture: 'en-ZA',
        mfaEnabled: false,
        mfaRequired: false,
        passkeys: [],
        recoveryCodes: 0,
        roles: ['Administrator'],
      },
      '/api/v1/auth/sessions': [
        {
          id: 'session-1',
          device: 'Browser test device',
          createdAt: '2026-09-05T10:00:00Z',
          current: true,
        },
      ],
      '/api/v1/auth/settings/security': {
        mfaPolicy: 'Administrators',
        registrationEnabled: false,
        version: 'v1',
      },
      '/api/v1/auth/operations': [],
      '/api/v1/features': {},
      '/api/v1/users': {
        items: [
          {
            id: 'reader-user',
            displayName: 'Reader Example',
            email: 'reader@example.test',
            roles: ['Reader'],
            status: 'Active',
            disabled: false,
            version: 'v1',
          },
        ],
        total: 1,
        pageNumber: 1,
        pageSize: 25,
      },
    };
    if (path === '/api/v1/auth/logout') return route.fulfill({ status: 204 });
    if (Object.hasOwn(responses, path)) return route.fulfill({ json: responses[path] });
    return route.fulfill({ status: 404, json: { title: 'Unexpected test API request' } });
  });
}
async function accessible(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
}

test('forgot password captures the recovery email in a dialog', async ({ page }) => {
  let recoveryEmail: string | undefined;
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/bootstrap/status') return route.fulfill({ json: { available: false } });
    if (path === '/api/v1/auth/registration') return route.fulfill({ json: { enabled: false } });
    if (path === '/api/v1/auth/csrf') return route.fulfill({ json: { token: 'test-csrf' } });
    if (path === '/api/v1/auth/forgot-password') {
      recoveryEmail = route.request().postDataJSON().email;
      return route.fulfill({ status: 202 });
    }
    return route.fulfill({ status: 404, json: { title: 'Unexpected test API request' } });
  });

  await page.goto('/login');
  await expect(page.getByLabel('Recovery email', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Forgot password?', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Reset your password' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Recovery email', { exact: true }).fill('recover@example.test');
  await accessible(page);
  await dialog.getByRole('button', { name: 'Send reset link', exact: true }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByText('Check your email for the next step.', { exact: true }),
  ).toBeVisible();
  expect(recoveryEmail).toBe('recover@example.test');
});

test('desktop sidebar exposes permission links, collapses, and signs out from account menu', async ({
  page,
}) => {
  await mockApp(page);
  await page.goto('/profile');
  await expect(page.getByRole('link', { name: 'User management', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Admin settings', exact: true })).toBeVisible();
  const sidebar = page.locator('hlm-sidebar');
  await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  await page.getByRole('button', { name: 'Toggle navigation', exact: true }).click();
  await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  await page.getByRole('button', { name: 'Toggle navigation', exact: true }).click();
  await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  await page.getByRole('button', { name: /Manage your account/ }).click();
  await expect(page.getByRole('menuitem', { name: 'My profile', exact: true })).toBeVisible();
  await page.getByRole('menuitem', { name: 'Your sessions', exact: true }).click();
  await expect(page).toHaveURL(/\/sessions$/);
  await page.getByRole('button', { name: /Manage your account/ }).click();
  await page.getByRole('menuitem', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back', exact: true })).toBeVisible();
});

test('navigation shows sessions when MFA is not required', async ({ page }) => {
  await mockApp(page, [], false);
  await page.goto('/profile');

  await expect(page.getByRole('link', { name: 'Your sessions', exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Manage your account/ }).click();
  await expect(page.getByRole('menuitem', { name: 'Your sessions', exact: true })).toBeVisible();
});

test('breadcrumbs name the current page and return through browser history', async ({ page }) => {
  await mockApp(page);
  await page.goto('/profile');

  const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(breadcrumb.getByText('My profile', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back to My profile' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Your sessions', exact: true }).click();
  await expect(breadcrumb.getByText('Your sessions', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to My profile' }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(breadcrumb.getByText('My profile', { exact: true })).toBeVisible();
});

test('reader sidebar hides administration and mobile navigation closes after selection and Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApp(page, []);
  await page.goto('/profile');
  const trigger = page.getByRole('button', { name: 'Toggle navigation', exact: true });
  await trigger.click();
  const navigation = page
    .getByRole('dialog', { name: 'Toggle navigation' })
    .locator('hlm-sheet-content');
  await expect(navigation).toBeVisible();
  await expect(page.getByRole('link', { name: 'User management', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Admin settings', exact: true })).toHaveCount(0);
  await accessible(page);
  await navigation.getByRole('link', { name: 'Your sessions', exact: true }).click();
  await expect(page).toHaveURL(/\/sessions$/);
  await expect(navigation).toBeHidden();
  await trigger.click();
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
});

for (const path of ['profile', 'users', 'sessions', 'settings']) {
  test(`${path} uses accessible Spartan components on desktop and mobile`, async ({ page }) => {
    await mockApp(page);
    await page.goto(`/${path}`);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('hlm-spinner')).toHaveCount(0);
    await accessible(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true);
    await accessible(page);
  });
}

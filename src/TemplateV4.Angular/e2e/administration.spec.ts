import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function administration(
  page: Page,
  permissions = ['users.read', 'users.manage', 'roles.manage', 'settings.manage'],
) {
  const roles = [
    {
      id: 'admin',
      name: 'Administrator',
      description: '',
      builtIn: true,
      version: 'v1',
      members: 1,
      permissions,
    },
    {
      id: 'support',
      name: 'Support',
      description: 'Help people',
      builtIn: false,
      version: 'v1',
      members: 1,
      permissions: ['users.read'],
    },
  ];
  const user = {
    id: 'person',
    email: 'person@example.test',
    displayName: 'Example Person',
    culture: 'en-ZA',
    roles: ['Support'],
    disabled: false,
    status: 'Active',
    version: 'v1',
  };
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const responses: Record<string, unknown> = {
      '/api/v1/auth/csrf': { token: 'test' },
      '/api/v1/auth/refresh': {
        userId: 'operator',
        accessToken: 'test',
        permissions,
        culture: 'en-ZA',
        setupRequired: false,
      },
      '/api/v1/features': { files: false, maintenance: false },
      '/api/v1/auth/notifications/summary': { unread: 0 },
      '/api/v1/roles': {
        roles,
        permissions: ['users.read', 'users.manage', 'roles.manage', 'settings.manage'].map(
          (key) => ({ key, group: key.split('.')[0] }),
        ),
      },
      '/api/v1/users/person': { user, effectivePermissions: ['users.read'], roles: [roles[1]] },
      '/api/v1/users': { items: [user], total: 1, pageNumber: 1, pageSize: 25 },
      '/api/v1/auth/settings/security': {
        mfaPolicy: 'Administrators',
        registrationEnabled: false,
        version: 'v1',
      },
    };
    if (route.request().method() === 'PUT' && path === '/api/v1/users/person')
      return route.fulfill({
        status: 409,
        json: { title: 'The record changed. Reload it.', code: 'concurrency.conflict' },
      });
    if (path in responses) return route.fulfill({ json: responses[path] });
    return route.fulfill({ status: 404, json: { title: 'Unexpected request' } });
  });
}

test('role catalog is accessible and built-in grants cannot be edited', async ({ page }) => {
  await administration(page);
  await page.goto('/roles');
  await expect(page.getByRole('columnheader', { name: 'Role name', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Members', exact: true })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'Type', exact: true })).toBeVisible();

  const search = page.getByLabel('Search', { exact: true });
  await search.fill('Support');
  await expect(page).toHaveURL(/search=Support/);
  await expect(page.getByRole('row', { name: /Support/ })).toBeVisible();
  await expect(page.getByRole('row', { name: /Administrator/ })).toHaveCount(0);
  await page.getByRole('button', { name: 'Clear', exact: true }).click();
  await expect(page).not.toHaveURL(/search=/);

  await page
    .getByRole('row', { name: /Administrator/ })
    .getByRole('button', { name: 'View role', exact: true })
    .click();
  const drawer = page.getByRole('dialog');
  await expect(drawer.getByRole('heading', { name: 'View role', exact: true })).toBeVisible();
  await expect(drawer.getByLabel('Role name', { exact: true })).toBeDisabled();
  await expect(drawer.getByRole('button', { name: 'Save role', exact: true })).toHaveCount(0);
  await drawer.getByRole('button', { name: 'Close', exact: true }).click();
  await page
    .getByRole('row', { name: /Support/ })
    .getByRole('button', { name: 'Edit role', exact: true })
    .click();
  await expect(drawer.getByRole('heading', { name: 'Edit role', exact: true })).toBeVisible();
  await expect(drawer.getByLabel('Role name', { exact: true })).toBeEnabled();
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(result.violations.map((v) => v.id)).toEqual([]);
});

test('person access conflicts preserve the draft and effective grants remain explicit', async ({
  page,
}) => {
  await administration(page);
  await page.goto('/users/person');
  await expect(page.getByRole('heading', { name: 'Effective permissions' })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Administrator', exact: true }).check();
  await page.getByRole('button', { name: 'Save access', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(
    page.getByText('This record changed. Your edits are retained.', { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Administrator', exact: true })).toBeChecked();
  await expect(page.getByRole('button', { name: 'Save access', exact: true })).toBeDisabled();
});

test('settings-only operators can reach settings without user management permission', async ({
  page,
}) => {
  await administration(page, ['settings.manage']);
  await page.goto('/settings');
  await expect(page.getByRole('heading', { level: 1, name: 'Admin settings' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Users', exact: true })).toHaveCount(0);
});

test('list filtering debounces automatically, retains focus, and uses a person detail destination', async ({
  page,
}) => {
  await administration(page);
  await page.goto('/users');
  const search = page.getByLabel('Search', { exact: true });
  await search.fill('Example');
  await expect(page).toHaveURL(/search=Example/);
  await expect(search).toBeFocused();
  await page.getByRole('link', { name: 'Example Person', exact: true }).click();
  await expect(page).toHaveURL(/users\/person$/);
});

test('inviting a user from the directory opens a right-side drawer', async ({ page }) => {
  await administration(page);
  await page.goto('/users');
  await page.getByRole('button', { name: 'Invite', exact: true }).click();

  const drawer = page.getByRole('dialog', { name: 'Invite' });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAttribute('data-vaul-drawer-direction', 'right');
  await expect(drawer.getByLabel('Name', { exact: true })).toBeVisible();
  await expect(drawer.getByLabel('Email', { exact: true })).toBeVisible();
});

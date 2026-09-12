import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function administration(
  page: Page,
  permissions = ['users.read', 'users.manage', 'roles.manage', 'settings.manage'],
  saveSucceeds = false,
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
    username: 'example.person',
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
        roles: { items: roles, total: roles.length, pageNumber: 1, pageSize: 100 },
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
    if (route.request().method() === 'PUT' && path === '/api/v1/users/person') {
      if (saveSucceeds) {
        Object.assign(user, route.request().postDataJSON(), { version: 'v2' });
        return route.fulfill({ json: user });
      }
      return route.fulfill({
        status: 409,
        json: { title: 'The record changed. Reload it.', code: 'concurrency.conflict' },
      });
    }
    if (path in responses) return route.fulfill({ json: responses[path] });
    return route.fulfill({ status: 404, json: { title: 'Unexpected request' } });
  });
}

test('security tab changes preserve cancelled drafts and navigate after discard', async ({
  page,
}) => {
  await administration(page);
  await page.goto('/administration/users?section=security');
  const registration = page.getByRole('switch', { name: 'Allow public registration' });
  await expect(registration).toBeEnabled();
  await registration.click();
  const roles = page.getByRole('tab', { name: 'Roles', exact: true });
  const security = page.getByRole('tab', { name: 'Security', exact: true });
  await roles.click();
  const dialog = page.getByRole('alertdialog');
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/section=security/);
  await expect(security).toHaveAttribute('aria-selected', 'true');
  await expect(roles).toHaveAttribute('aria-selected', 'false');
  await expect(registration).toBeChecked();

  await roles.click();
  await dialog.getByRole('button', { name: 'Discard changes', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/section=roles/);
  await expect(page.getByRole('columnheader', { name: 'Role name', exact: true })).toBeVisible();
  await expect(roles).toHaveAttribute('aria-selected', 'true');
  await expect(registration).toHaveCount(0);

  await security.click();
  await expect(registration).toBeEnabled();
  await expect(registration).not.toBeChecked();
  await expect(dialog).toBeHidden();
});

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
  await page.goto('/administration/users/person');
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

test('settings-only operators can reach the account security tab without directory access', async ({
  page,
}) => {
  await administration(page, ['settings.manage']);
  await page.goto('/administration/users?section=security');
  await expect(page.getByRole('heading', { name: 'Account security', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Account security', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  for (const name of ['Users', 'Invitations', 'Roles']) {
    await expect(page.getByRole('tab', { name, exact: true })).toHaveCount(0);
  }
  await expect(page.locator('a[href="/administration/users"]').first()).toBeVisible();
  await expect(page.locator('a[href="/settings"]')).toHaveCount(0);
  await page.goto('/administration/users');
  await expect(page.getByRole('heading', { name: 'Account security', exact: true })).toBeVisible();
});

test('user rows open details without changing directory query state and restore keyboard focus', async ({
  page,
}) => {
  await administration(page);
  await page.goto('/administration/users');
  const search = page.getByLabel('Search', { exact: true });
  await search.fill('Example');
  await expect(page).toHaveURL(/search=Example/);
  await expect(search).toBeFocused();
  for (const name of ['Username', 'Display name', 'Email', 'Roles', 'Status']) {
    await expect(page.getByRole('columnheader', { name: new RegExp(`^${name}`) })).toBeVisible();
  }
  const directoryUrl = page.url();
  const row = page.getByRole('row', { name: /example.person/ });
  const action = row.getByRole('button', { name: 'User details: example.person', exact: true });
  await row.getByRole('cell', { name: 'person@example.test', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'User details', exact: true });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAttribute('data-vaul-drawer-direction', 'right');
  await expect(drawer.getByRole('heading', { name: 'Effective permissions' })).toBeVisible();
  await expect(page).toHaveURL(directoryUrl);
  await drawer.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(action).toBeFocused();
  await action.press('Enter');
  await expect(drawer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  await expect(action).toBeFocused();
  await action.press('Space');
  await expect(drawer).toBeVisible();
  await expect(page).toHaveURL(directoryUrl);
  for (const theme of ['light', 'dark']) {
    await page.evaluate(
      (dark) => document.documentElement.classList.toggle('dark', dark),
      theme === 'dark',
    );
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations.map((v) => v.id)).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const bounds = await drawer.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.width).toBeLessThanOrEqual(390);
  await expect(drawer.getByRole('button', { name: 'Close', exact: true })).toBeInViewport();
});

test('user drawer preserves conflicted drafts and confirms discard', async ({ page }) => {
  await administration(page);
  await page.goto('/administration/users');
  await page.getByRole('button', { name: 'User details: example.person', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'User details', exact: true });
  const admin = drawer.getByRole('checkbox', { name: 'Administrator', exact: true });
  await admin.check();
  await drawer.getByRole('button', { name: 'Save access', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(
    drawer.getByText('This record changed. Your edits are retained.', { exact: false }),
  ).toBeVisible();
  await expect(admin).toBeChecked();
  await drawer.getByRole('button', { name: 'Close', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(drawer).toBeVisible();
  await expect(admin).toBeChecked();
  await drawer.getByRole('button', { name: 'Close', exact: true }).click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Discard changes', exact: true })
    .click();
  await expect(drawer).toBeHidden();
  await expect(page).toHaveURL(/\/users$/);
});

test('saving user drawer access refreshes the directory without navigation', async ({ page }) => {
  await administration(page, undefined, true);
  await page.goto('/administration/users');
  await page.getByRole('button', { name: 'User details: example.person', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'User details', exact: true });
  await drawer.getByRole('checkbox', { name: 'Administrator', exact: true }).check();
  await drawer.getByRole('button', { name: 'Save access', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(drawer.getByRole('button', { name: 'Save access', exact: true })).toBeDisabled();
  await expect(
    page
      .getByRole('row', { name: /example.person/ })
      .getByRole('cell', { name: /Support, Administrator/ }),
  ).toHaveCount(1);
  await drawer.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(page.getByRole('alertdialog')).toHaveCount(0);
  await expect(page).toHaveURL(/\/users$/);
});

test('read-only directory operators can inspect the complete user drawer', async ({ page }) => {
  await administration(page, ['users.read']);
  await page.goto('/administration/users');
  await page.getByRole('button', { name: 'User details: example.person', exact: true }).click();
  const drawer = page.getByRole('dialog', { name: 'User details', exact: true });
  await expect(drawer.getByRole('heading', { name: 'Effective permissions' })).toBeVisible();
  await expect(drawer.getByRole('checkbox', { name: 'Administrator', exact: true })).toBeDisabled();
  await expect(drawer.getByRole('button', { name: 'Save access', exact: true })).toBeDisabled();
});

test('inviting a user from the directory opens a right-side drawer', async ({ page }) => {
  await administration(page);
  await page.goto('/administration/users');
  await page.getByRole('button', { name: 'Invite', exact: true }).click();

  const drawer = page.getByRole('dialog', { name: 'Invite' });
  await expect(drawer).toBeVisible();
  await expect(drawer).toHaveAttribute('data-vaul-drawer-direction', 'right');
  await expect(drawer.getByLabel('Name', { exact: true })).toBeVisible();
  await expect(drawer.getByLabel('Email', { exact: true })).toBeVisible();
});

test('account security tab preserves drafts when leaving is cancelled', async ({ page }) => {
  await administration(page);
  await page.goto('/administration/users');
  await page.getByRole('tab', { name: 'Account security', exact: true }).click();
  await expect(page).toHaveURL(/section=security/);
  await page.getByRole('switch').click();
  await page.getByRole('tab', { name: 'Users', exact: true }).click();
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('switch')).toBeChecked();
  await expect(page).toHaveURL(/section=security/);
});

test('account security is hidden without settings permission and the settings route is removed', async ({
  page,
}) => {
  await administration(page, ['users.read']);
  await page.goto('/administration/users?section=security');
  await expect(page.getByRole('tab', { name: 'Account security', exact: true })).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Users', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Page not found', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/settings$/);
});

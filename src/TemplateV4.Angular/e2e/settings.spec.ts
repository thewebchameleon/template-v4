import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('administrator changes registration with the current settings version', async ({ page }) => {
  const settings = {
    mfaPolicy: 'Administrators',
    registrationEnabled: false,
    version: 'settings-version-1',
  };
  const updates: Record<string, unknown>[] = [];
  await page.route('**/api/v1/auth/csrf', (route) =>
    route.fulfill({ json: { token: 'test-csrf' } }),
  );
  await page.route('**/api/v1/auth/refresh', (route) =>
    route.fulfill({
      json: {
        userId: 'administrator',
        accessToken: 'test-access',
        culture: 'en-ZA',
        permissions: ['users.read', 'users.manage', 'roles.manage', 'settings.manage'],
        setupRequired: false,
      },
    }),
  );
  await page.route('**/api/v1/features', (route) => route.fulfill({ json: { files: false } }));
  await page.route('**/api/v1/auth/notifications/summary', (route) =>
    route.fulfill({ json: { unread: 0 } }),
  );
  await page.route('**/api/v1/auth/operations', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/v1/auth/settings/security', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON();
      updates.push(body);
      settings.registrationEnabled = body.registrationEnabled;
      settings.version = 'settings-version-2';
    }
    await route.fulfill({ json: settings });
  });
  await page.goto('/administration/users/account-security');
  const registration = page.getByRole('switch');
  await expect(registration).not.toBeChecked();
  await expect(page.getByRole('button', { name: 'Save changes', exact: true })).toBeDisabled();
  await registration.click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(
    page.getByRole('region', { name: /Notifications/ }).getByRole('status'),
  ).toContainText('Security settings saved');
  expect(updates).toEqual([
    {
      mfaPolicy: 'Administrators',
      registrationEnabled: true,
      version: 'settings-version-1',
    },
  ]);
  await expect(page.getByLabel('Password', { exact: true })).toHaveCount(0);
  await expect(page.getByLabel('Authenticator or recovery code')).toHaveCount(0);
  await page.reload();
  await expect(registration).toBeChecked();
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    accessibility.violations.map((item) => ({
      id: item.id,
      targets: item.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
});

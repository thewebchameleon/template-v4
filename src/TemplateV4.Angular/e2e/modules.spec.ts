import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function modulesApp(page: Page, administrator = true, available = true) {
  let saved = { id: 'files', enabled: true, available, version: 'initial' };
  let failSave = false;
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/auth/administration/modules') {
      if (!administrator) return route.fulfill({ status: 403, json: {} });
      if (route.request().method() === 'POST') {
        if (failSave)
          return route.fulfill({
            status: 409,
            json: { title: 'Module settings changed. Reload the saved settings and try again.' },
          });
        saved = { ...saved, enabled: route.request().postDataJSON().enabled, version: 'saved' };
        return route.fulfill({ json: saved });
      }
      return route.fulfill({ json: [saved] });
    }
    const responses: Record<string, unknown> = {
      '/api/v1/auth/appearance': { primaryColor: '#2563EB' },
      '/api/v1/auth/refresh': {
        accessToken: 'test-access',
        userId: 'administrator',
        culture: 'en-ZA',
        permissions: ['settings.manage'],
        isAdministrator: administrator,
        mfaConfigured: true,
        setupRequired: false,
      },
      '/api/v1/auth/csrf': { token: 'test-csrf' },
      '/api/v1/auth/notifications/summary': { unread: 0 },
      '/api/v1/bootstrap/status': { available: false },
      '/api/v1/modules': { files: saved.enabled && available },
      '/api/v1/features': { files: saved.enabled && available },
    };
    return route.fulfill({ json: responses[path] ?? {} });
  });
  return {
    enabled: () => saved.enabled,
    fail: () => {
      failSave = true;
    },
  };
}

test('modules save application-wide Files state, refresh navigation and guard disabled routes', async ({
  page,
}) => {
  const app = await modulesApp(page);
  await page.goto('/administration/modules');
  const control = page.getByRole('switch', { name: 'Enable Files' });
  await expect(control).toBeChecked();
  await control.focus();
  await page.keyboard.press('Space');
  await expect(control).not.toBeChecked();
  expect(app.enabled()).toBe(true);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Currently disabled', { exact: true })).toBeVisible();
  await expect(page.locator('a[href="/files"]')).toHaveCount(0);
  await expect(page.locator('a[href="/administration/storage"]')).toHaveCount(0);
  await page.reload();
  await expect(control).not.toBeChecked();
  for (const path of ['/files', '/administration/storage', '/administration/users/owner/files']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/me$/);
  }
  await page.goto('/administration/modules');
  await control.click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Currently enabled', { exact: true })).toBeVisible();
  await expect(page.locator('a[href="/administration/storage"]').first()).toBeVisible();
});

test('modules retain a failed draft and confirm before discarding it', async ({ page }) => {
  const app = await modulesApp(page);
  await page.goto('/administration/modules');
  const control = page.getByRole('switch', { name: 'Enable Files' });
  await control.click();
  app.fail();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(
    page.getByText('Module settings changed. Reload the saved settings and try again.'),
  ).toBeVisible();
  await expect(control).not.toBeChecked();
  expect(app.enabled()).toBe(true);
  await page.getByRole('button', { name: 'Reload saved settings' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(control).not.toBeChecked();
  await page.getByRole('button', { name: 'Reload saved settings' }).click();
  await dialog.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(control).toBeChecked();
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
});

test('modules deny delegated settings operators and explain unavailable deployments', async ({
  page,
}) => {
  await modulesApp(page, false);
  await page.goto('/administration/modules');
  await expect(page).toHaveURL(/\/forbidden$/);
  await expect(page.locator('a[href="/administration/modules"]')).toHaveCount(0);
  await page.unrouteAll();
  await modulesApp(page, true, false);
  await page.goto('/administration/modules');
  await expect(page.getByRole('switch', { name: 'Enable Files' })).toBeDisabled();
  await expect(
    page.getByText('This module is unavailable in this deployment.', { exact: false }),
  ).toBeVisible();
});

test('modules are accessible in both themes and reflow at enlarged text on mobile', async ({
  page,
}) => {
  await modulesApp(page);
  await page.goto('/administration/modules');
  const control = page.getByRole('switch', { name: 'Enable Files' });
  await expect(control).toBeVisible();
  for (const dark of [false, true]) {
    await page.evaluate((value) => document.documentElement.classList.toggle('dark', value), dark);
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await expect(control).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await control.focus();
  await page.keyboard.press('Space');
  await expect(control).not.toBeChecked();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});

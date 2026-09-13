import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function modulesApp(page: Page, administrator = true, available = true) {
  let saved = { id: 'my-files', enabled: true, available, version: 'initial' };
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
      '/api/v1/modules': { 'my-files': saved.enabled && available },
      '/api/v1/features': { 'my-files': saved.enabled && available },
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

const myFilesModuleControl = (page: Page) =>
  page.getByRole('switch', { name: /^My Files Personal file libraries/ });

test('modules save application-wide Files state, refresh navigation and guard disabled routes', async ({
  page,
}) => {
  const app = await modulesApp(page);
  await page.goto('/administration/modules');
  const control = myFilesModuleControl(page);
  const features = page.getByRole('heading', { name: 'Features', exact: true });
  const storageSettings = page
    .locator('#my-files-module-content')
    .getByRole('link', { name: 'File storage', exact: true });
  await expect(control).toBeChecked();
  await expect(features).toBeVisible();
  await expect(storageSettings).toHaveAttribute('href', '/administration/storage');
  await control.click();
  await expect(control).not.toBeChecked();
  await expect(features).toBeHidden();
  await expect(storageSettings).toBeHidden();
  await expect.poll(app.enabled).toBe(false);
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reload saved settings' })).toHaveCount(0);
  await expect(page.locator('a[href="/my-files"]')).toHaveCount(0);
  await expect(
    page
      .getByRole('navigation', { name: 'Administration', exact: true })
      .getByRole('link', { name: 'File storage', exact: true }),
  ).toHaveCount(0);
  await page.reload();
  await expect(control).not.toBeChecked();
  for (const path of [
    '/my-files',
    '/administration/storage',
    '/administration/users/owner/files',
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/me$/);
  }
  await page.goto('/administration/modules');
  await control.click();
  await expect.poll(app.enabled).toBe(true);
  await expect(features).toBeVisible();
  await expect(storageSettings).toBeVisible();
  const modulesNavigation = page
    .getByRole('navigation', { name: 'Administration', exact: true })
    .getByRole('group', { name: 'Modules', exact: true });
  await expect(modulesNavigation.getByRole('link', { name: 'File storage' })).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Destinations' })
    .getByRole('link', { name: 'My Files', exact: true })
    .click();
  await expect(page).toHaveURL(/\/my-files\?group=my-files$/);
});

test('modules restore the saved state when an immediate update fails', async ({ page }) => {
  const app = await modulesApp(page);
  await page.goto('/administration/modules');
  const control = myFilesModuleControl(page);
  app.fail();
  await control.click();
  await expect(
    page.getByText('Module settings changed. Reload the saved settings and try again.'),
  ).toBeVisible();
  await expect(control).toBeChecked();
  expect(app.enabled()).toBe(true);
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
  await expect(myFilesModuleControl(page)).toBeDisabled();
  await expect(
    page.getByText('This module is unavailable in this deployment.', { exact: false }),
  ).toBeVisible();
});

test('modules are accessible in both themes and reflow at enlarged text on mobile', async ({
  page,
}) => {
  await modulesApp(page);
  await page.goto('/administration/modules');
  const control = myFilesModuleControl(page);
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

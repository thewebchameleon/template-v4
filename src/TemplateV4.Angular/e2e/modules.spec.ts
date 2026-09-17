import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function modulesApp(page: Page, administrator = true, available = true) {
  let saved = {
    id: 'file-storage',
    enabled: true,
    available,
    initialized: available,
    version: 'initial',
    enableBlockers: [] as string[],
    disableBlockers: [] as string[],
  };
  let failSave = false;
  let settings = {
    demoMode: false,
    slowUploadMode: false,
    version: 'file-settings',
    demoExpiryMinutes: 60,
  };
  let settingsPosts = 0;
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/auth/administration/modules/activation') {
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
    if (path === '/api/v1/auth/administration/modules/file-storage/settings') {
      if (route.request().method() === 'POST') {
        settingsPosts++;
        const body = route.request().postDataJSON();
        if (body.demoMode && !settings.demoMode && body.password !== 'test-admin-proof')
          return route.fulfill({ status: 403, json: { title: 'Password verification failed.' } });
        settings = {
          ...settings,
          demoMode: body.demoMode,
          slowUploadMode: body.slowUploadMode,
          version: 'updated-settings',
        };
      }
      return route.fulfill({ json: settings });
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
      '/api/v1/capabilities': { 'file-storage': saved.enabled && available },
    };
    return route.fulfill({ json: responses[path] ?? {} });
  });
  return {
    enabled: () => saved.enabled,
    settings: () => settings,
    settingsPosts: () => settingsPosts,
    fail: () => {
      failSave = true;
    },
  };
}

const fileStorageModuleControl = (page: Page) =>
  page.getByRole('switch', { name: 'File Storage', exact: true });

test('modules save application-wide Files state, refresh navigation and guard disabled routes', async ({
  page,
}) => {
  const app = await modulesApp(page);
  await page.goto('/administration/modules');
  const control = fileStorageModuleControl(page);
  const settingsButton = page
    .locator('#module-file-storage')
    .getByRole('link', { name: 'Settings', exact: true });
  await expect(control).toBeChecked();
  await expect(settingsButton).toHaveAttribute('href', '/administration/file-storage');
  await control.click();
  await expect(control).not.toBeChecked();
  await expect(settingsButton).toBeHidden();
  await expect.poll(app.enabled).toBe(false);
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Reload saved settings' })).toHaveCount(0);
  await expect(page.locator('a[href="/file-storage"]')).toHaveCount(0);
  await expect(
    page
      .getByRole('navigation', { name: 'Administration', exact: true })
      .getByRole('link', { name: 'File Storage', exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(control).not.toBeChecked();
  for (const path of ['/file-storage', '/user-management/users/owner/files']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/module-unavailable\?/);
  }
  await page.goto('/administration/file-storage');
  await expect(page).toHaveURL(/\/administration\/file-storage$/);
  await page.goto('/administration/modules');
  await control.click();
  await expect.poll(app.enabled).toBe(true);
  await expect(settingsButton).toBeVisible();
  const modulesNavigation = page
    .getByRole('navigation', { name: 'Administration', exact: true })
    .getByRole('group', { name: 'Module settings', exact: true });
  await expect(
    modulesNavigation.getByRole('link', { name: 'File Storage', exact: true }),
  ).toBeVisible();
  await page
    .getByRole('navigation', { name: 'Destinations' })
    .getByRole('link', { name: 'File Storage', exact: true })
    .click();
  await expect(page).toHaveURL(/\/file-storage\?group=file-storage$/);
});

test('modules restore the saved state when an immediate update fails', async ({ page }) => {
  const app = await modulesApp(page);
  await page.goto('/administration/modules');
  const control = fileStorageModuleControl(page);
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
  await expect(fileStorageModuleControl(page)).toBeDisabled();
  await expect(page.getByText('Module setup is incomplete.', { exact: false })).toBeVisible();
});

test('modules are accessible in both themes and reflow at enlarged text on mobile', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await modulesApp(page);
  await page.goto('/administration/modules');
  const control = fileStorageModuleControl(page);
  await expect(control).toBeVisible();
  for (const dark of [false, true]) {
    await page.evaluate((value) => document.documentElement.classList.toggle('dark', value), dark);
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((animation) => animation.effect?.getComputedTiming().iterations !== Infinity)
          .map((animation) => animation.finished.catch(() => {})),
      ),
    );
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

test('demo enabling requires warning confirmation and password; cancellation is inert', async ({
  page,
}) => {
  const app = await modulesApp(page);
  await page.goto('/administration/file-storage');
  const demo = page.getByRole('switch', { name: 'Demo mode', exact: true });
  await demo.click();
  const dialog = page.getByRole('dialog', { name: 'Enable demo mode' });
  await expect(dialog).toContainText('permanently deleted');
  await expect(dialog).toContainText('60');
  await expect(
    dialog.getByRole('button', { name: 'Enable demo mode', exact: true }),
  ).toBeDisabled();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(demo).not.toBeChecked();
  expect(app.settingsPosts()).toBe(0);
  await demo.click();
  await dialog.getByLabel('Password', { exact: true }).fill('incorrect');
  await dialog.getByRole('button', { name: 'Enable demo mode', exact: true }).click();
  await expect(dialog).toContainText('Demo mode was not enabled.');
  await expect(dialog.getByLabel('Password', { exact: true })).toHaveValue('');
  expect(app.settings().demoMode).toBe(false);
  await dialog.getByLabel('Password', { exact: true }).fill('test-admin-proof');
  await dialog.getByRole('button', { name: 'Enable demo mode', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(demo).toBeChecked();
  await page.goto('/administration/modules');
  await fileStorageModuleControl(page).click();
  await page.goto('/administration/file-storage');
  await expect(
    page.getByText('Demo expiry is active for everyone', { exact: false }),
  ).toBeVisible();
  await expect(demo).toBeEnabled();
  await demo.click();
  await expect(demo).not.toBeChecked();
  await expect.poll(() => app.settings().demoMode).toBe(false);
});

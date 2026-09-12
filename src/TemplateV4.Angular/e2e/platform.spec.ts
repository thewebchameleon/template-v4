import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function platform(page: Page, failFiles = false) {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const empty = { items: [], total: 0, pageNumber: 1, pageSize: 25 };
    const responses: Record<string, unknown> = {
      '/api/v1/features': { files: true, maintenance: false },
      '/api/v1/auth/notifications/summary': { unread: 0 },
      '/api/v1/auth/csrf': { token: 'test-csrf' },
      '/api/v1/auth/refresh': {
        userId: 'test-admin',
        accessToken: 'test-access',
        culture: 'en-ZA',
        permissions: ['users.read', 'users.manage', 'roles.manage', 'settings.manage'],
        setupRequired: false,
      },
      '/api/v1/auth/notifications': { page: empty, unread: 0, optionalEmailEnabled: false },
      '/api/v1/auth/audit': empty,
      '/api/v1/auth/invitations': empty,
      '/api/v1/auth/operations': { ...empty, kind: 'message' },
      '/api/v1/auth/operations/overview': {
        pendingMessages: 0,
        failedMessages: 0,
        activeJobs: 0,
        failedJobs: 0,
        oldestMessageSeconds: 0,
        lastMaintenanceAt: null,
        version: 'test-release',
        checkedAt: '2026-09-06T10:00:00Z',
        backlogWarningSeconds: 300,
      },
      '/api/v1/auth/files': {
        page: empty,
        usedBytes: 0,
        quotaBytes: 1073741824,
        maxUploadBytes: 20971520,
        allowedExtensions: ['.txt', '.pdf'],
      },
      '/api/v1/auth/privacy': {
        request: null,
        deletedFileRetentionDays: 30,
        notificationRetentionDays: 90,
        reviewPolicy: 'AdministratorReview',
      },
      '/api/v1/auth/privacy/requests': empty,
    };
    if (failFiles && path === '/api/v1/auth/files')
      return route.fulfill({ status: 503, json: { title: 'Please try again' } });
    if (path in responses) return route.fulfill({ json: responses[path] });
    return route.fulfill({ status: 404, json: { title: 'Unexpected test request' } });
  });
}

for (const width of [390, 1440]) {
  test(`platform pages are accessible and fit the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await platform(page);
    for (const [path, title] of [
      ['administration/audit-history', 'Audit History'],
      ['invitations', 'Invitations'],
      ['administration/system-health', 'System Health'],
      ['notifications', 'Notifications'],
      ['files', 'Files'],
      ['privacy', 'Privacy & data'],
      ['administration/users/privacy-requests', 'User Management'],
    ]) {
      await page.goto('/' + path);
      await expect(page.getByRole('heading', { level: 1, name: title, exact: true })).toBeVisible();
      await expect(page.locator('app-page-state').first()).not.toContainText('Loading…');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      ).toBe(true);
      const accessibility = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        accessibility.violations.map((item) => ({
          id: item.id,
          targets: item.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
      await page.screenshot({ path: `test-results/platform-${path}-${width}.png`, fullPage: true });
    }
  });
}

test('a selected upload is protected and filters survive reload', async ({ page }) => {
  await platform(page);
  await page.goto('/files?search=report&sort=name');
  await expect(page.getByLabel('Search', { exact: true })).toHaveValue('report');
  await page
    .getByLabel('Choose a file', { exact: true })
    .setInputFiles({ name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('Draft') });
  await page.getByRole('link', { name: 'Privacy & data', exact: true }).first().click();
  await expect(page.getByRole('alertdialog')).toContainText('Leave without saving?');
  await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page).toHaveURL(/files\?search=report&sort=name/);
  await page.getByLabel('Choose a file', { exact: true }).setInputFiles([]);
  await page.reload();
  await expect(page.getByLabel('Search', { exact: true })).toHaveValue('report');
});

test('file failures retain search and offer recovery', async ({ page }) => {
  await platform(page, true);
  await page.goto('/files?search=retained');
  await expect(page.getByLabel('Search', { exact: true })).toHaveValue('retained');
  await expect(page.getByRole('button', { name: 'Retry', exact: true })).toBeVisible();
});

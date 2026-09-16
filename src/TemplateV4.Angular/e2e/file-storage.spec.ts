import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { FileItem } from '../src/app/api/models';
const folder: FileItem = {
  id: 'folder-a',
  name: 'Projects',
  isFolder: true,
  parentId: null,
  size: 0,
  contentType: 'application/octet-stream',
  createdAt: '2026-09-13T09:00:00Z',
  permission: 'owner',
  category: 'other',
  itemCount: 2,
  fileCount: 1,
};
const document: FileItem = {
  id: 'file-a',
  name: 'Report.pdf',
  isFolder: false,
  parentId: folder.id,
  size: 1024,
  contentType: 'application/octet-stream',
  createdAt: '2026-09-13T09:00:00Z',
  updatedAt: '2026-09-13T10:00:00Z',
  permission: 'owner',
  category: 'documents',
  description: 'Quarterly report',
  tags: 'work',
  important: true,
  starred: false,
};
const nestedFolder: FileItem = {
  ...folder,
  id: 'folder-b',
  name: 'Archive',
  parentId: folder.id,
  itemCount: 0,
  fileCount: 0,
};
const unknown: FileItem = {
  ...document,
  id: 'file-b',
  name: 'Data.unknown',
  parentId: null,
  category: 'other',
  important: false,
};
async function library(page: Page, moves: { id: string; parentId: string | null }[] = []) {
  let shares = [
    {
      id: 'share-a',
      recipient: 'alex@example.com',
      permission: 'viewer',
      expiresAt: null,
    },
  ];
  await page.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const move = path.match(/^\/api\/v1\/auth\/file-storage\/([^/]+)\/move$/);
    if (move && route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as { parentId: string | null };
      moves.push({ id: move[1], parentId: body.parentId });
      return route.fulfill({ status: 204 });
    }
    if (path === '/api/v1/auth/file-storage') {
      const scoped = url.searchParams.get('parentId') === folder.id;
      const items = scoped ? [document, nestedFolder] : [folder, unknown];
      return route.fulfill({
        json: {
          page: { items, total: items.length, pageNumber: 1, pageSize: 10 },
          fileCount: 1,
          folder: scoped ? folder : null,
          folders: [folder, nestedFolder],
          recent: scoped
            ? [document]
            : Array.from({ length: 6 }, (_, i) => ({
                ...unknown,
                id: 'recent-' + i,
                name: `Recent ${i}.unknown`,
              })),
          usedBytes: 3072,
          quotaBytes: 1048576,
          maxUploadBytes: 20971520,
          ownerName: 'Test user',
          quotaOverrideBytes: null,
          usage: [
            { category: 'documents', bytes: 1024, count: 1 },
            { category: 'other', bytes: 1024, count: 1 },
            { category: 'trash', bytes: 1024, count: 1 },
          ],
        },
      });
    }
    if (path === `/api/v1/auth/file-storage/${document.id}/shares`) {
      if (route.request().method() === 'POST') {
        const request = route.request().postDataJSON() as { email: string; permission: string };
        const share = {
          id: 'share-b',
          recipient: request.email,
          permission: request.permission,
          expiresAt: null,
        };
        shares = [...shares, share];
        return route.fulfill({ json: share });
      }
      return route.fulfill({ json: shares });
    }
    if (path.endsWith('/shares/share-a/revoke')) {
      shares = shares.filter((share) => share.id !== 'share-a');
      return route.fulfill({ status: 204 });
    }
    if (path === `/api/v1/auth/file-storage/${document.id}/metadata`)
      return route.fulfill({ status: 204 });
    if (path === `/api/v1/auth/file-storage/${document.id}/download`)
      return route.fulfill({ body: 'file contents', contentType: 'application/pdf' });
    const responses: Record<string, unknown> = {
      '/api/v1/auth/appearance': { primaryColor: '#2563EB' },
      '/api/v1/auth/refresh': {
        accessToken: 'test-access',
        userId: 'test-user',
        culture: 'en-ZA',
        permissions: ['organisation.files.manage'],
        setupRequired: false,
      },
      '/api/v1/capabilities': { 'file-storage': true },
      '/api/v1/auth/csrf': { token: 'test-csrf' },
      '/api/v1/auth/notifications/summary': { unread: 0 },
      '/api/v1/bootstrap/status': { available: false },
    };
    return route.fulfill({ json: responses[path] ?? {} });
  });
}

test('Files keeps the parent item first and accepts list and grid drops', async ({ page }) => {
  const moves: { id: string; parentId: string | null }[] = [];
  await library(page, moves);
  await page.goto('/file-storage?folder=folder-a');

  const rows = page.locator('app-data-table tbody tr');
  await expect(
    rows.first().getByRole('button', { name: 'Parent folder', exact: true }),
  ).toBeVisible();
  await rows.filter({ hasText: 'Report.pdf' }).dragTo(rows.filter({ hasText: 'Archive' }));
  await expect.poll(() => moves).toEqual([{ id: document.id, parentId: nestedFolder.id }]);

  await page.getByRole('button', { name: 'Grid', exact: true }).click();
  const cards = page.locator('.file-storage-grid > .file-storage-grid-card');
  await expect(
    cards.first().getByRole('button', { name: 'Parent folder', exact: true }),
  ).toBeVisible();
  await cards.filter({ hasText: 'Archive' }).dragTo(cards.first());
  await expect
    .poll(() => moves)
    .toEqual([
      { id: document.id, parentId: nestedFolder.id },
      { id: nestedFolder.id, parentId: null },
    ]);
});

test('Files keeps compact card spacing and list-aligned grid sort headings', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await library(page);
  await page.goto('/file-storage?folder=folder-a');

  const cardContent = page.locator('[data-slot="card-content"]').filter({
    has: page.locator('.file-storage-controls'),
  });
  const listPadding = await cardContent.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft];
  });
  const listStart = await page
    .locator('app-data-table thead button')
    .first()
    .evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().left;
    });

  await page.getByRole('button', { name: 'Grid', exact: true }).click();
  const grid = page.locator('.file-storage-grid');
  await expect(grid).toBeVisible();

  expect(
    await cardContent.evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft];
    }),
  ).toEqual(listPadding);

  const gridStart = await page
    .locator('.file-storage-grid-sort button')
    .first()
    .evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getBoundingClientRect().left;
    });
  expect(Math.abs(gridStart - listStart)).toBeLessThanOrEqual(1);
});

for (const width of [390, 1440])
  for (const dark of [false, true]) {
    test(`Files navigation, quota and recent cards at ${width}px ${dark ? 'dark' : 'light'}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.emulateMedia({ colorScheme: dark ? 'dark' : 'light' });
      await library(page);
      await page.goto('/files?sort=name');
      await expect(page).toHaveURL(/\/file-storage\?sort=name$/);
      await expect(
        page.getByRole('heading', { level: 1, name: 'File Storage', exact: true }),
      ).toBeVisible();
      await expect(page.locator('app-data-table [data-category="other"]')).toHaveCount(1);
      const recent = page.getByRole('region', { name: 'Recent', exact: true });
      await expect(recent.locator('.file-storage-recent-card')).toHaveCount(6);
      expect(await recent.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
      ).toBe(true);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(results.violations).toEqual([]);
      await page.screenshot({
        path: `test-results/file-storage-${width}-${dark ? 'dark' : 'light'}.png`,
        fullPage: true,
      });
      await page.goto('/file-storage?folder=folder-a');
      await expect(recent).toHaveCount(0);
      await page
        .locator('app-data-table')
        .getByRole('button', { name: 'File details: Report.pdf', exact: true })
        .click();
      const drawer = page.getByRole('dialog', { name: 'File details', exact: true });
      await expect(drawer.getByLabel('Description', { exact: true })).toHaveValue(
        'Quarterly report',
      );
      await expect(drawer.getByRole('checkbox', { name: 'Important', exact: true })).toBeChecked();
      await expect(drawer.getByText('alex@example.com', { exact: true })).toBeVisible();
      await drawer.getByRole('button', { name: 'Close', exact: true }).click();
    });
  }

test('file details save inline and sharing opens an add-only dialog', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await library(page);
  await page.goto('/file-storage?folder=folder-a');
  await page
    .locator('app-data-table')
    .getByRole('button', { name: 'File details: Report.pdf', exact: true })
    .click();

  const drawer = page.getByRole('dialog', { name: 'File details', exact: true });
  const download = drawer.getByRole('button', { name: 'Download', exact: true });
  const share = drawer.getByRole('button', { name: 'Share', exact: true });
  await expect(download).toBeVisible();
  await expect(share.locator('ng-icon[name="lucideUserPlus"]')).toBeVisible();
  expect((await share.boundingBox())!.y).toBeGreaterThan((await download.boundingBox())!.y);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-slot="drawer-content"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);

  const downloadRequest = page.waitForRequest((request) =>
    request.url().endsWith(`/file-storage/${document.id}/download`),
  );
  await download.click();
  await downloadRequest;

  await share.click();
  const dialog = page.getByRole('dialog', { name: 'Share', exact: true });
  await expect(dialog.getByLabel('Recipient email', { exact: true })).toBeVisible();
  await expect(dialog.getByText('alex@example.com')).toHaveCount(0);
  expect(
    (
      await new AxeBuilder({ page })
        .include('[data-slot="dialog-content"]')
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
        .analyze()
    ).violations,
  ).toEqual([]);
  await dialog.getByLabel('Recipient email', { exact: true }).fill('sam@example.com');
  await dialog.getByRole('button', { name: 'Add person', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(drawer.getByText('sam@example.com', { exact: true })).toBeVisible();

  await drawer.getByLabel('Description', { exact: true }).fill('Updated report');
  const metadataRequest = page.waitForRequest((request) =>
    request.url().endsWith(`/file-storage/${document.id}/metadata`),
  );
  await drawer.getByRole('button', { name: 'Save changes', exact: true }).click();
  expect((await metadataRequest).postDataJSON()).toMatchObject({ description: 'Updated report' });

  const revokeRequest = page.waitForRequest((request) =>
    request.url().endsWith(`/file-storage/${document.id}/shares/share-a/revoke`),
  );
  await drawer
    .getByText('alex@example.com', { exact: true })
    .locator('..')
    .getByRole('button', { name: 'Revoke', exact: true })
    .click();
  await revokeRequest;
  await expect(drawer.getByText('alex@example.com', { exact: true })).toHaveCount(0);
});

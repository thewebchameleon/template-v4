import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const entry = {
  id: 42,
  actorId: 'operator',
  actorName: 'Original operator',
  subjectId: 'person',
  subjectName: 'Example person',
  action: 'user.access_changed',
  at: '2026-09-12T10:15:32Z',
};

async function audit(page: Page, failFirst = false, legacy = false) {
  let requests = 0;
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const responses: Record<string, unknown> = {
      '/api/v1/auth/csrf': { token: 'test' },
      '/api/v1/auth/refresh': {
        userId: 'operator',
        accessToken: 'test',
        permissions: ['settings.manage'],
        culture: 'en-ZA',
        setupRequired: false,
      },
      '/api/v1/features': { files: false },
      '/api/v1/modules': { 'audit-history': true },
      '/api/v1/auth/notifications/summary': { unread: 0 },
      '/api/v1/auth/audit': { items: [entry], total: 1, pageNumber: 1, pageSize: 10 },
      '/api/v1/auth/audit/42': {
        entry,
        schemaVersion: legacy ? null : 1,
        actorType: legacy ? null : 'user',
        subjectType: legacy ? null : 'user',
        outcome: legacy ? null : 'success',
        source: legacy ? null : 'api',
        traceParent: null,
        failureCode: null,
        reason: null,
        changes: legacy ? [] : [{ field: 'roles', before: 'Reader', after: 'Support' }],
        relatedEntities: [],
        metadata: {},
      },
    };
    if (path === '/api/v1/auth/audit/42' && ++requests === 1 && failFirst)
      return route.fulfill({ status: 503, json: { title: 'Please try again' } });
    if (path in responses) return route.fulfill({ json: responses[path] });
    return route.fulfill({ status: 404, json: { title: 'Unexpected test request' } });
  });
  return () => requests;
}

for (const [theme, width] of [
  ['light', 1440],
  ['dark', 390],
] as const) {
  test(`audit drawer supports keyboard, focus and accessible reflow in ${theme}`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 950 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    const requests = await audit(page);
    await page.goto('/administration/audit-history?action=user.access_changed');
    const button = page.getByRole('button', { name: /^Audit details:/ });
    await expect(button).toBeVisible();
    expect(requests()).toBe(0);
    await button.focus();
    await page.keyboard.press('Enter');
    const drawer = page.getByRole('dialog', { name: 'Audit details' });
    await expect(drawer.getByRole('heading', { name: 'Audit details', exact: true })).toBeVisible();
    await expect(drawer.getByRole('cell', { name: 'Reader', exact: true })).toBeVisible();
    await expect(drawer.getByRole('cell', { name: 'Support', exact: true })).toBeVisible();
    await expect(drawer.getByText('Original operator', { exact: true })).toBeVisible();
    await expect(drawer.getByText('Succeeded', { exact: true })).toBeVisible();
    expect(
      (await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations,
    ).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBeTruthy();
    await page.screenshot({ path: testInfo.outputPath('drawer.png'), fullPage: true });
    await page.keyboard.press('Escape');
    await expect(
      drawer.getByRole('heading', { name: 'Audit details', exact: true }),
    ).not.toBeVisible();
    await expect(button).toBeFocused();
    await expect(page).toHaveURL(/action=user.access_changed/);
    await page.getByRole('cell', { name: 'User access changed', exact: true }).click();
    await expect(drawer.getByRole('heading', { name: 'Audit details', exact: true })).toBeVisible();
    await drawer.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(
      drawer.getByRole('heading', { name: 'Audit details', exact: true }),
    ).not.toBeVisible();
  });
}

test('audit detail failures can retry and legacy events explain missing capture', async ({
  page,
}) => {
  await audit(page, true, true);
  await page.goto('/administration/audit-history');
  await page.getByRole('button', { name: /^Audit details:/ }).click();
  const drawer = page.getByRole('dialog', { name: 'Audit details' });
  await drawer.getByRole('button', { name: /try again|retry/i }).click();
  await expect(drawer.getByText(/This older event has no captured detail/)).toBeVisible();
  await expect(drawer.getByText('No field changes were captured for this event.')).toBeVisible();
});

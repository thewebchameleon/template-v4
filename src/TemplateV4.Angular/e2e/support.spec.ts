import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const id = '8920291f-a231-4124-9998-757b765cc915';
const category = '9a0e9b19-33fb-49e0-8bd0-77eb7eca5c20';
async function supportApp(page: Page, agent = false, enabled = true) {
  let failReply = false;
  let ticket = {
    id,
    subject: 'Cannot sign in',
    requesterId: 'requester',
    requester: 'Alex',
    categoryId: category,
    category: 'General',
    status: 'Open',
    priority: 'Normal',
    assigneeId: null,
    assignee: null,
    createdAt: '2026-09-12T12:00:00Z',
    updatedAt: '2026-09-12T12:00:00Z',
    version: 'initial',
  };
  const messages: {
    id: string;
    authorId: string;
    author: string;
    body: string;
    internal: boolean;
    kind: string;
    at: string;
  }[] = [];
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/auth/support/' && route.request().method() === 'POST') {
      ticket = { ...ticket, subject: route.request().postDataJSON().subject };
      return route.fulfill({ json: id });
    }
    if (path === '/api/v1/auth/support/reply') {
      if (failReply)
        return route.fulfill({
          status: 409,
          json: { title: 'The ticket changed. Refresh and try again.' },
        });
      const body = route.request().postDataJSON();
      messages.unshift({
        id: 'reply',
        authorId: 'requester',
        author: 'Alex',
        body: body.body,
        internal: body.internal,
        kind: 'reply',
        at: '2026-09-12T12:01:00Z',
      });
      return route.fulfill({ json: {} });
    }
    if (path === `/api/v1/auth/support/${id}`)
      return route.fulfill({
        json: {
          ticket,
          description: 'Please help me access my account.',
          agent,
          attachments: [],
          messages: { items: messages, total: messages.length, pageNumber: 1, pageSize: 25 },
        },
      });
    const responses: Record<string, unknown> = {
      '/api/v1/auth/appearance': { primaryColor: '#2563EB' },
      '/api/v1/auth/refresh': {
        accessToken: 'test-access',
        userId: 'requester',
        culture: 'en-ZA',
        permissions: agent ? ['support.agent'] : [],
        isAdministrator: false,
        mfaConfigured: true,
        setupRequired: false,
      },
      '/api/v1/auth/csrf': { token: 'test-csrf' },
      '/api/v1/auth/notifications/summary': { unread: 0 },
      '/api/v1/bootstrap/status': { available: false },
      '/api/v1/modules': { support: enabled },
      '/api/v1/features': {},
      '/api/v1/auth/support/options': {
        categories: [{ id: category, name: 'General', active: true, version: 'category' }],
        agents: [],
        agent,
        administrator: false,
      },
      '/api/v1/auth/support/': { items: [ticket], total: 1, pageNumber: 1, pageSize: 10 },
    };
    return route.fulfill({ json: responses[path] ?? {} });
  });
  return {
    fail: (value: boolean) => {
      failReply = value;
    },
  };
}

test('requester creates a ticket and retains a reply after a conflict', async ({ page }) => {
  const app = await supportApp(page);
  await page.goto('/support/new');
  await page.getByLabel('Subject', { exact: true }).fill('Account help');
  await page.getByLabel('Category', { exact: true }).click();
  await page.getByRole('option', { name: 'General', exact: true }).click();
  await page.getByLabel('Description', { exact: true }).fill('Please help me access my account.');
  await page.getByRole('button', { name: 'Submit ticket', exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/support/${id}$`));
  await expect(page.getByRole('heading', { name: 'Account help', exact: true })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Internal note', exact: false })).toHaveCount(0);
  await page.getByLabel('Message', { exact: true }).fill('Additional information');
  app.fail(true);
  await page.getByRole('button', { name: 'Send reply', exact: true }).click();
  await expect(
    page.getByText('The ticket changed. Refresh and try again.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('Additional information');
  app.fail(false);
  await page.getByRole('button', { name: 'Send reply', exact: true }).click();
  await expect(page.getByLabel('Message', { exact: true })).toHaveValue('');
  await expect(page.getByText('Additional information', { exact: true })).toBeVisible();
});

test('support is guarded when disabled', async ({ page }) => {
  await supportApp(page, false, false);
  await page.goto('/support');
  await expect(page).toHaveURL(/\/me$/);
  await expect(page.locator('a[href="/support"]')).toHaveCount(0);
});

test('agent internal note controls work by keyboard and pages have no serious accessibility violations', async ({
  page,
}) => {
  await supportApp(page, true);
  await page.goto(`/support/${id}`);
  const internal = page.getByRole('checkbox', { name: 'Internal note', exact: false });
  await internal.focus();
  await page.keyboard.press('Space');
  await expect(internal).toBeChecked();
  await expect(page.getByRole('button', { name: 'Save internal note', exact: true })).toBeVisible();
  for (const theme of ['light', 'dark'] as const) {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await page.evaluate(
      (dark) => document.documentElement.classList.toggle('dark', dark),
      theme === 'dark',
    );
    await page.setViewportSize({ width: 390, height: 844 });
    const result = await new AxeBuilder({ page }).analyze();
    expect(
      result.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical'),
    ).toEqual([]);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});

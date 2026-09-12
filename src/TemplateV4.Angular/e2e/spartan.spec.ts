import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function mockApp(
  page: Page,
  permissions = ['users.read', 'users.manage', 'roles.manage', 'settings.manage'],
  mfaConfigured = true,
  modules = { 'audit-history': true, operations: true },
  setupRequired = false,
) {
  const access = {
    accessToken: 'test-access',
    userId: 'current-user',
    culture: 'en-ZA',
    permissions,
    mfaConfigured,
    setupRequired,
  };
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/auth/culture') return route.fulfill({ status: 204 });
    const responses: Record<string, unknown> = {
      '/api/v1/modules': modules,
      '/api/v1/auth/notifications/summary': { unread: 0 },
      '/api/v1/auth/csrf': { token: 'test-csrf' },
      '/api/v1/auth/refresh': access,
      '/api/v1/bootstrap/status': { available: false },
      '/api/v1/auth/registration': { enabled: false },
      '/api/v1/auth/registration/options': { enabled: false },
      '/api/v1/auth/profile': {
        id: 'current-user',
        displayName: 'Template Administrator',
        email: 'admin@example.test',
        culture: 'en-ZA',
        mfaEnabled: false,
        mfaRequired: false,
        mfaMethods: [],
        preferredMfaMethod: 'Email',
        emailMfaEnabled: false,
        passkeys: [],
        recoveryCodes: 0,
        roles: ['Administrator'],
      },
      '/api/v1/auth/sessions': [
        {
          id: 'session-1',
          device: 'Browser test device',
          createdAt: '2026-09-05T10:00:00Z',
          current: true,
          expiresAt: '2026-10-05T10:00:00Z',
        },
      ],
      '/api/v1/auth/settings/security': {
        mfaPolicy: 'Administrators',
        registrationEnabled: false,
        version: 'v1',
      },
      '/api/v1/auth/operations': [],
      '/api/v1/features': {},
      '/api/v1/users': {
        items: [
          {
            id: 'reader-user',
            displayName: 'Reader Example',
            email: 'reader@example.test',
            roles: ['Reader'],
            status: 'Active',
            disabled: false,
            version: 'v1',
          },
        ],
        total: 1,
        pageNumber: 1,
        pageSize: 25,
      },
    };
    if (path === '/api/v1/auth/logout') return route.fulfill({ status: 204 });
    if (Object.hasOwn(responses, path)) return route.fulfill({ json: responses[path] });
    return route.fulfill({ status: 404, json: { title: 'Unexpected test API request' } });
  });
}
async function accessible(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    result.violations.map((v) => ({ id: v.id, targets: v.nodes.map((n) => n.target) })),
  ).toEqual([]);
}

test('account submenu opens settings with the keyboard and keeps sign out in the header', async ({
  page,
}) => {
  await mockApp(page);
  await page.goto('/dashboard');
  const trigger = page
    .locator('[data-slot="sidebar-destination-rail"]')
    .getByRole('button', { name: 'Manage your account', exact: true });
  await expect(
    page.locator('[data-slot=sidebar-destination-rail] a[href="/security"]'),
  ).toHaveCount(0);
  await trigger.focus();
  await page.keyboard.press('Enter');
  const menu = page
    .locator('#sidebar-label-panel')
    .getByRole('navigation', { name: 'Account', exact: true });
  await expect(menu.locator('a, button')).toHaveText([
    'Profile',
    'Account security',
    'Sessions',
    'Notifications',
    'Privacy & data',
    'Theme & Accessibility',
  ]);
  for (const [label, path] of [
    ['Profile', '/me'],
    ['Account security', '/security'],
    ['Sessions', '/security/sessions'],
    ['Notifications', '/notifications'],
    ['Privacy & data', '/privacy'],
  ]) {
    await expect(menu.getByRole('link', { name: label, exact: true })).toHaveAttribute(
      'href',
      path,
    );
  }
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await accessible(page);
  await menu.getByRole('button', { name: 'Theme & Accessibility', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(menu).toBeVisible();
  const drawer = page.getByRole('dialog', {
    name: 'Theme & Accessibility Settings',
    exact: true,
  });
  await expect(drawer).toBeVisible();
  await accessible(page);
  await page.keyboard.press('Escape');
  await expect(drawer).toBeHidden();
  const signOut = page
    .locator('.app-header')
    .getByRole('button', { name: 'Sign out', exact: true });
  await expect(signOut).toHaveClass(/\btext-destructive\b/);
  await signOut.click();
  await expect(page).toHaveURL(/\/login$/);
});

test('forgot password captures the recovery email in a dialog', async ({ page }) => {
  let recoveryEmail: string | undefined;
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/bootstrap/status') return route.fulfill({ json: { available: false } });
    if (path === '/api/v1/auth/registration') return route.fulfill({ json: { enabled: false } });
    if (path === '/api/v1/auth/csrf') return route.fulfill({ json: { token: 'test-csrf' } });
    if (path === '/api/v1/auth/forgot-password') {
      recoveryEmail = route.request().postDataJSON().email;
      return route.fulfill({ status: 202 });
    }
    return route.fulfill({ status: 404, json: { title: 'Unexpected test API request' } });
  });

  await page.goto('/login');
  await expect(page.getByLabel('Recovery email', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Forgot password?', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Reset your password' });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel('Recovery email', { exact: true }).fill('recover@example.test');
  await accessible(page);
  await dialog.getByRole('button', { name: 'Send reset link', exact: true }).click();

  await expect(dialog).toBeHidden();
  await expect(
    page.getByText('Check your email for the next step.', { exact: true }).first(),
  ).toBeVisible();
  expect(recoveryEmail).toBe('recover@example.test');
});

test('desktop sidebar exposes permission links, collapses, and signs out from the header', async ({
  page,
}) => {
  await mockApp(page);
  await page.goto('/profile');
  await expect(
    page.locator('#sidebar-label-panel').getByRole('link', { name: 'Users', exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('#sidebar-label-panel').getByRole('link', { name: 'Admin settings', exact: true }),
  ).toBeVisible();
  const sidebar = page.locator('hlm-sidebar');
  await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  await page.getByRole('button', { name: 'Toggle navigation', exact: true }).click();
  await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  await page.getByRole('button', { name: 'Toggle navigation', exact: true }).click();
  await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  await expect(
    page.locator('#sidebar-label-panel').getByRole('link', { name: 'Profile', exact: true }),
  ).toBeVisible();
  await page
    .locator('#sidebar-label-panel')
    .getByRole('link', { name: 'Sessions', exact: true })
    .click();
  await expect(page).toHaveURL(/\/security\/sessions$/);
  await page.locator('.app-header').getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'Welcome back', exact: true })).toBeVisible();
});

test('desktop rail stays fixed while the label panel resizes, persists and collapses', async ({
  page,
}) => {
  await mockApp(page);
  await page.goto('/profile');

  const sidebar = page.locator('hlm-sidebar');
  const destinations = page.locator('[data-slot="sidebar-destination-rail"]');
  const separator = page.getByRole('separator', { name: 'Resize navigation' });
  const panel = page.locator('#sidebar-label-panel');
  const rootSize = await page
    .locator('html')
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  const railWidth = () => destinations.evaluate((el) => el.getBoundingClientRect().width);
  const panelWidth = () =>
    panel.evaluate(
      (el) =>
        el.getBoundingClientRect().width /
        parseFloat(getComputedStyle(document.documentElement).fontSize),
    );
  await expect.poll(railWidth).toBeCloseTo(4 * rootSize, 1);
  await expect.poll(panelWidth).toBeCloseTo(12, 1);
  await expect(separator).toHaveAttribute('aria-valuemin', '0');
  await expect(separator).toHaveAttribute('aria-valuemax', '20');

  await separator.press('ArrowRight');
  await expect.poll(panelWidth).toBeCloseTo(12.5, 1);
  await separator.press('End');
  await expect.poll(panelWidth).toBeCloseTo(20, 1);
  await expect.poll(railWidth).toBeCloseTo(4 * rootSize, 1);
  await separator.press('Home');
  await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  await expect.poll(panelWidth).toBe(0);
  await expect(panel).toHaveAttribute('inert', '');
  await expect(
    destinations.getByRole('link', { name: 'Administration', exact: true }),
  ).toBeVisible();

  await destinations.getByRole('link', { name: 'Administration', exact: true }).click();
  await expect(page).toHaveURL(/\/users$/);
  await expect(sidebar).toHaveAttribute('data-state', 'expanded');
  await destinations.getByRole('link', { name: 'Administration', exact: true }).click();
  await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  await separator.dblclick();
  await expect.poll(panelWidth).toBeCloseTo(12, 1);

  const bounds = (await separator.boundingBox())!;
  const x = bounds.x + bounds.width / 2;
  await page.mouse.move(x, 180);
  await expect(separator.locator('.sidebar-resize-affordance')).toHaveCSS('opacity', '1');
  const firstGuide = (await separator.locator('.sidebar-resize-guide').boundingBox())!;
  await page.mouse.move(x, 280);
  const secondGuide = (await separator.locator('.sidebar-resize-guide').boundingBox())!;
  expect(secondGuide.y - firstGuide.y).toBeCloseTo(100, 0);
  await expect(separator.locator('.sidebar-resize-tooltip')).toHaveText('Drag to resize');
  await page.mouse.down();
  await page.mouse.move(x + 4 * rootSize, 320);
  await expect(separator).toHaveAttribute('data-resizing', 'true');
  await page.mouse.up();
  await expect.poll(panelWidth).toBeCloseTo(16, 1);
  await expect.poll(railWidth).toBeCloseTo(4 * rootSize, 1);
  await page.reload();
  await expect.poll(panelWidth).toBeCloseTo(16, 1);

  const persisted = (await separator.boundingBox())!;
  await page.mouse.move(persisted.x + persisted.width / 2, 280);
  await page.mouse.down();
  await page.mouse.move(persisted.x + 50, 300);
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect.poll(panelWidth).toBeCloseTo(16, 1);
  await accessible(page);

  const restored = (await separator.boundingBox())!;
  await page.mouse.move(restored.x + restored.width / 2, 280);
  await page.mouse.down();
  await page.mouse.move(2 * rootSize, 280);
  await page.mouse.up();
  await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  await page.reload();
  await expect(sidebar).toHaveAttribute('data-state', 'collapsed');
  await expect.poll(railWidth).toBeCloseTo(4 * rootSize, 1);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(separator).toBeHidden();
  await expect(destinations).toHaveCount(0);
});

test('settings reset restores every display preference and the sidebar default', async ({
  page,
}) => {
  await mockApp(page);
  await page.goto('/profile');

  const rail = page.getByRole('separator', { name: 'Resize navigation' });
  await rail.press('End');
  await page.getByRole('button', { name: 'Open theme' }).click();
  const drawer = page.getByRole('dialog', { name: 'Theme & Accessibility Settings' });
  await drawer.getByRole('button', { name: 'Dark', exact: true }).click();
  await drawer.getByRole('combobox', { name: 'Language', exact: true }).click();
  await page.getByRole('option', { name: 'Afrikaans', exact: true }).click();
  await drawer.getByRole('button', { name: 'Ekstra groot', exact: true }).click();
  const rootSize = await page
    .locator('html')
    .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  await expect
    .poll(() =>
      page
        .locator('[data-slot="sidebar-destination-rail"]')
        .evaluate((el) => el.getBoundingClientRect().width),
    )
    .toBeCloseTo(4 * rootSize, 1);
  await expect
    .poll(() =>
      page.locator('#sidebar-label-panel').evaluate((el) => el.getBoundingClientRect().width),
    )
    .toBeCloseTo(20 * rootSize, 1);
  await drawer.getByRole('button', { name: 'Hoog', exact: true }).click();
  await drawer.getByRole('button', { name: 'Verminder', exact: true }).click();
  await drawer.getByRole('button', { name: 'Kompak', exact: true }).click();
  await drawer.getByRole('button', { name: 'Stel alle instellings terug', exact: true }).click();

  await expect(
    drawer.getByRole('button', { name: 'Reset all settings', exact: true }),
  ).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-ZA');
  await expect(page.locator('html')).toHaveAttribute('data-theme-preference', 'system');
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'default');
  await expect(page.locator('html')).toHaveAttribute('data-contrast', 'standard');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'system');
  await expect(page.locator('html')).toHaveAttribute('data-density', 'comfortable');
  await expect(page.locator('hlm-sidebar')).toHaveAttribute('data-state', 'expanded');
  await expect
    .poll(() =>
      page.evaluate(() => ({
        width: getComputedStyle(document.querySelector('[hlmSidebarWrapper]')!).getPropertyValue(
          '--sidebar-width',
        ),
        storedWidth: localStorage.getItem('templatev4-sidebar-panel-width'),
        storedOpen: localStorage.getItem('templatev4-sidebar-panel-open'),
        storedUi: localStorage.getItem('templatev4-ui-preferences'),
      })),
    )
    .toEqual({ width: '16rem', storedWidth: null, storedOpen: null, storedUi: null });
});

test('navigation shows sessions when MFA is not required', async ({ page }) => {
  await mockApp(page, [], false);
  await page.goto('/profile');

  await expect(page.getByRole('link', { name: 'Your sessions', exact: true })).toBeVisible();
  await expect(
    page.locator('#sidebar-label-panel').getByRole('link', { name: 'Sessions', exact: true }),
  ).toBeVisible();
});

test('breadcrumbs name the current page and return through browser history', async ({ page }) => {
  await mockApp(page);
  await page.goto('/profile');

  const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(breadcrumb.getByText('Account security', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back to Account security' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Your sessions', exact: true }).click();
  await expect(breadcrumb.getByText('Your sessions', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back to Account security' }).click();

  await expect(page).toHaveURL(/\/security$/);
  await expect(breadcrumb.getByText('Account security', { exact: true })).toBeVisible();
});

test('reader sidebar hides administration and mobile navigation closes after selection and Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApp(page, []);
  await page.goto('/profile');
  const trigger = page.getByRole('button', { name: 'Toggle navigation', exact: true });
  await trigger.click();
  const navigation = page
    .getByRole('dialog', { name: 'Toggle navigation' })
    .locator('hlm-sheet-content');
  await expect(navigation).toBeVisible();
  await expect(page.getByRole('link', { name: 'Users', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Admin settings', exact: true })).toHaveCount(0);
  await accessible(page);
  await navigation.getByRole('link', { name: 'Account', exact: true }).click();
  await expect(page).toHaveURL(/\/me$/);
  await expect(navigation).toBeHidden();
  await trigger.click();
  await expect(navigation).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(navigation).toBeHidden();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
});

test('disabled modules hide destinations and reject direct navigation', async ({ page }) => {
  await mockApp(page, undefined, true, { 'audit-history': false, operations: false });
  await page.goto('/administration/users');
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('a[href="/administration/audit-history"]')).toHaveCount(0);
  await expect(page.locator('a[href="/administration/system-health"]')).toHaveCount(0);
  for (const path of ['/administration/audit-history', '/administration/system-health']) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/me$/);
    await expect(page.locator('main h1')).toBeVisible();
  }
  await page.keyboard.press('Tab');
  await accessible(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await accessible(page);
});

for (const path of ['dashboard', 'profile', 'users', 'sessions', 'settings']) {
  test(`${path} uses accessible Spartan components on desktop and mobile`, async ({ page }) => {
    await mockApp(page);
    await page.goto(`/${path}`);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('hlm-spinner')).toHaveCount(0);
    await accessible(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true);
    await accessible(page);
  });
}

for (const permissions of [
  [],
  ['users.read'],
  ['roles.manage'],
  ['settings.manage'],
  ['jobs.trigger'],
]) {
  test(`dashboard is the signed-in landing page for ${permissions.join(',') || 'readers'}`, async ({
    page,
  }) => {
    await mockApp(page, permissions);
    await page.goto('/');
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
    await expect(page.getByText('Placeholder content', { exact: true })).toBeVisible();
  });
}

test('dashboard rail collapses the panel across clicks, reloads and browser history', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await mockApp(page);
  await page.goto('/dashboard');
  const rail = page.getByRole('navigation', { name: 'Destinations', exact: true });
  const dashboard = rail.getByRole('link', { name: 'Dashboard', exact: true });
  const account = rail.getByRole('link', { name: 'Account', exact: true });
  const panel = page.locator('#sidebar-label-panel');
  await expect(rail.getByRole('link').first()).toHaveAttribute('href', '/dashboard');
  await expect(dashboard).toHaveAttribute('aria-current', 'page');
  await expect(dashboard).not.toHaveAttribute('aria-expanded');
  await expect(panel).toHaveAttribute('inert', '');
  await dashboard.focus();
  await page.keyboard.press('Enter');
  await expect(panel).toHaveAttribute('inert', '');
  await page.keyboard.press('Control+b');
  await expect(panel).toHaveAttribute('inert', '');
  await expect(page.getByRole('separator', { name: 'Resize navigation' })).toHaveCount(0);
  await account.click();
  await expect(panel).not.toHaveAttribute('inert');
  await page.goBack();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(panel).toHaveAttribute('inert', '');
  await page.reload();
  await expect(panel).toHaveAttribute('inert', '');
  await page.goForward();
  await expect(page).toHaveURL(/\/me$/);
  await expect(panel).not.toHaveAttribute('inert');
  await dashboard.click();
  await expect(panel).toHaveAttribute('inert', '');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await accessible(page);
});

test('dashboard is available through the mobile navigation sheet', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApp(page, []);
  await page.goto('/me');
  const trigger = page.getByRole('button', { name: 'Toggle navigation', exact: true });
  await trigger.click();
  const sheet = page.getByRole('dialog', { name: 'Toggle navigation' });
  await sheet.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(sheet).toBeHidden();
  await trigger.click();
  await expect(sheet).toBeVisible();
  await sheet.getByRole('link', { name: 'Account', exact: true }).click();
  await expect(page).toHaveURL(/\/me$/);
  await expect(sheet).toBeHidden();
});

test('dashboard retains required security setup and authentication guards', async ({ page }) => {
  await mockApp(page, [], false, undefined, true);
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/security$/);
  await expect(
    page.getByRole('navigation', { name: 'Destinations' }).getByRole('link', { name: 'Dashboard' }),
  ).toHaveCount(0);
  await page.route('**/api/v1/auth/refresh', (route) => route.fulfill({ status: 401 }));
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?returnUrl=%2Fdashboard$/);
});

test('administration groups destinations and retains active state on nested routes', async ({
  page,
}) => {
  await mockApp(page);
  await page.goto('/dashboard');
  const rail = page.locator('[data-slot="sidebar-destination-rail"]');
  const administration = rail.getByRole('button', { name: 'Administration', exact: true });
  const account = rail.getByRole('button', { name: 'Account', exact: true });
  const panel = page.locator('#sidebar-label-panel');
  await administration.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(administration).toHaveAttribute('aria-expanded', 'true');
  const menu = panel.getByRole('navigation', { name: 'Administration', exact: true });
  await expect(menu.getByRole('link')).toHaveText([
    'User Management',
    'Audit History',
    'System Health',
  ]);
  await administration.click();
  await expect(panel).not.toHaveAttribute('inert');
  await account.click();
  await expect(panel.getByRole('navigation', { name: 'Account', exact: true })).toBeVisible();
  await administration.click();
  await expect(menu).toBeVisible();
  await expect(panel).not.toHaveAttribute('inert');
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(rail.getByRole('link', { name: 'System Health', exact: true })).toHaveCount(0);
  await menu.getByRole('link', { name: 'System Health', exact: true }).click();
  await expect(page).toHaveURL(/\/administration\/system-health$/);
  await expect(administration).toHaveAttribute('data-active', 'true');
  await page.goBack();
  await expect(page).toHaveURL(/\/administration\/users$/);
  await expect(administration).toHaveAttribute('data-active', 'true');
  await page.goto('/users?search=person');
  await expect(page).toHaveURL(/\/administration\/users\?search=person$/);
});

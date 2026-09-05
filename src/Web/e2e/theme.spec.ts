import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function choose(page: Page, label: string, option: string) {
  await page.getByRole('combobox', { name: label }).click();
  await page.getByRole('option', { name: option, exact: true }).click();
  await expect(page.getByRole('option').first()).toBeHidden();
}

test.beforeEach(async ({ context }) => {
  await context.route('**/api/v1/auth/registration', (route) =>
    route.fulfill({ json: { enabled: false } }),
  );
  await context.route('**/api/v1/bootstrap/status', (route) =>
    route.fulfill({ json: { available: false } }),
  );
});

test('appearance follows the device, persists overrides, and synchronizes tabs', async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/login');
  const appearance = page.getByRole('combobox', { name: 'Appearance' });
  await expect(appearance).toContainText('System theme');
  await expect(page.locator('html')).toHaveClass(/dark/);
  await choose(page, 'Appearance', 'Light theme');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.reload();
  await expect(appearance).toContainText('Light theme');
  await expect(page.locator('html')).not.toHaveClass(/dark/);

  const other = await context.newPage();
  await other.goto('/login');
  await choose(page, 'Appearance', 'Dark theme');
  await expect(other.getByRole('combobox', { name: 'Appearance' })).toContainText('Dark theme');
  await expect(other.locator('html')).toHaveClass(/dark/);
  await choose(page, 'Appearance', 'System theme');
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('stored dark theme applies before Angular even when storage becomes unavailable', async ({
  page,
}) => {
  await page.goto('/login');
  await choose(page, 'Appearance', 'Dark theme');
  await page.route(/\/main-[^/]+\.js$/, (route) => route.abort());
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('app-root')).toBeEmpty();
  await page.unroute(/\/main-[^/]+\.js$/);
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage blocked', 'SecurityError');
      },
    });
  });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();
  await choose(page, 'Appearance', 'Dark theme');
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('appearance is localized, keyboard accessible, and fits mobile in both themes', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/login');
  for (const mode of ['light', 'dark']) {
    await choose(page, 'Appearance', mode === 'light' ? 'Light theme' : 'Dark theme');
    await page.evaluate(() =>
      Promise.all(document.getAnimations().map((animation) => animation.finished)),
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const result = await new AxeBuilder({ page }).include('.auth-preferences').analyze();
    expect(result.violations).toEqual([]);
  }
  const appearance = page.getByRole('combobox', { name: 'Appearance' });
  await appearance.focus();
  await expect(appearance).toBeFocused();
  await appearance.press('Enter');
  await expect(page.getByRole('option', { name: 'Light theme' })).toBeVisible();
  await appearance.press('Escape');
  await expect(page.getByRole('option').first()).toBeHidden();
  await choose(page, 'Appearance', 'Light theme');
  await expect(appearance).toContainText('Light theme');
  await choose(page, 'Language', 'Afrikaans');
  await expect(page.getByRole('combobox', { name: 'Voorkoms' })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Voorkoms' })).toContainText('Ligte tema');
});

import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { PlatformAppearance } from '../src/app/api/models/platform-appearance';

async function configurationApp(page: Page, administrator = true) {
  let saved: PlatformAppearance = {
    primaryColor: '#2563EB',
    version: 'initial',
    customColors: [],
    selectedCustomColorId: null,
  };
  let saves = 0;
  let conflict = false;
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/v1/auth/configuration/appearance') {
      if (!administrator) return route.fulfill({ status: 403, json: {} });
      if (route.request().method() === 'POST') {
        if (conflict) {
          conflict = false;
          return route.fulfill({
            status: 409,
            json: {
              title: 'Configuration changed. Reload the saved settings and try again.',
              code: 'appearance.conflict',
            },
          });
        }
        saves++;
        saved = { ...route.request().postDataJSON(), version: `saved-${saves}` };
      }
      return route.fulfill({ json: saved });
    }
    const responses: Record<string, unknown> = {
      '/api/v1/auth/appearance': { primaryColor: saved.primaryColor },
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
      '/api/v1/modules': {},
      '/api/v1/features': {},
    };
    return route.fulfill({ json: responses[path] ?? {} });
  });
  return {
    saves: () => saves,
    saved: () => saved,
    conflictNext: () => {
      conflict = true;
    },
  };
}

const primary = (page: Page) =>
  page
    .locator('html')
    .evaluate((root) => getComputedStyle(root).getPropertyValue('--brand-primary-600'));

test('custom palette supports picker, preview, rename, conflict, removal and saving', async ({
  page,
}) => {
  const app = await configurationApp(page);
  await page.goto('/administration/configuration');
  await expect(page.getByRole('heading', { name: 'Configuration', exact: true })).toBeVisible();
  const initial = await primary(page);
  await page.getByRole('button', { name: 'Add custom color', exact: true }).click();
  const picker = page.getByRole('dialog', { name: 'Add custom color', exact: true });
  await expect(picker).toBeVisible();
  await expect(picker.getByRole('button', { name: 'Cancel', exact: true })).toHaveCount(0);
  await expect(picker.locator('hlm-drawer-content')).toHaveAttribute(
    'data-vaul-drawer-direction',
    'right',
  );
  await picker.getByLabel('Color name', { exact: true }).fill('Ocean');
  await picker.getByLabel('Custom hex color').fill('#GGGGGG');
  await expect(picker.getByRole('button', { name: 'Use color' })).toBeDisabled();
  await picker.getByLabel('Custom hex color').fill('#0891B2');
  const hue = picker.getByRole('slider', { name: 'Hue', exact: true });
  const before = await hue.getAttribute('aria-valuenow');
  await hue.focus();
  await page.keyboard.press('ArrowRight');
  await expect(hue).not.toHaveAttribute('aria-valuenow', before!);
  const plane = picker.locator('.color-plane');
  await plane.click({ position: { x: 80, y: 40 } });
  await expect(picker).toBeVisible();
  await picker.getByLabel('Custom hex color').fill('#0891B2');
  expect(await primary(page)).not.toBe(initial);
  await picker.getByRole('button', { name: 'Use color' }).click();
  await expect(picker).toHaveCount(0);
  const custom = page.getByRole('group', { name: 'Custom colors', exact: true });
  await expect(custom.getByRole('button', { name: 'Ocean', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(app.saves()).toBe(0);
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Appearance saved and applied.', { exact: true })).toBeVisible();
  expect(app.saved().customColors[0].name).toBe('Ocean');
  await expect(custom.getByRole('button', { name: 'Ocean', exact: true })).toBeVisible();
  expect(await primary(page)).not.toBe(initial);

  const editOcean = custom.getByRole('button', { name: 'Edit / rename: Ocean', exact: true });
  await expect(editOcean.locator('ng-icon')).toHaveCount(1);
  await editOcean.click();
  const edit = page.getByRole('dialog', { name: 'Edit / rename', exact: true });
  await edit.getByLabel('Color name', { exact: true }).fill('Discarded');
  await page.keyboard.press('Escape');
  await expect(custom.getByRole('button', { name: 'Ocean', exact: true })).toBeVisible();
  await expect(
    custom.getByRole('button', { name: 'Edit / rename: Ocean', exact: true }),
  ).toBeFocused();
  await custom.getByRole('button', { name: 'Edit / rename: Ocean', exact: true }).click();
  await edit.getByLabel('Color name', { exact: true }).fill('Lagoon');
  await edit.getByRole('button', { name: 'Use color' }).click();
  app.conflictNext();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(
    page.getByText('Configuration changed. Reload the saved settings and try again.'),
  ).toBeVisible();
  await expect(custom.getByRole('button', { name: 'Lagoon', exact: true })).toBeVisible();
  expect(app.saved().customColors[0].name).toBe('Ocean');
  const removeLagoon = custom.getByRole('button', { name: 'Remove: Lagoon', exact: true });
  await expect(removeLagoon.locator('ng-icon')).toHaveCount(1);
  await removeLagoon.click();
  const removeDialog = page.getByRole('alertdialog', { name: 'Remove custom color?' });
  await expect(removeDialog).toContainText('Lagoon');
  await removeDialog.getByRole('button', { name: 'Remove', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Blue', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByRole('button', { name: 'Add custom color', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(
    page.getByText('Appearance saved and applied.', { exact: true }).last(),
  ).toBeVisible();
  expect(app.saved().primaryColor).toBe('#2563EB');
  expect(app.saved().customColors).toEqual([]);
});

test('undo changes restores saved settings after confirmation', async ({ page }) => {
  const app = await configurationApp(page);
  await page.goto('/administration/configuration');
  await expect(page.getByRole('button', { name: 'Undo changes', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Violet', exact: true }).click();
  await page.getByRole('button', { name: 'Undo changes', exact: true }).click();
  const undoDialog = page.getByRole('alertdialog', { name: 'Undo changes?' });
  await expect(undoDialog).toBeVisible();
  await expect(undoDialog.getByRole('button', { name: 'Undo changes', exact: true })).toBeVisible();
  await undoDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Violet', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.getByRole('button', { name: 'Undo changes', exact: true }).click();
  await undoDialog.getByRole('button', { name: 'Undo changes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Blue', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(app.saves()).toBe(0);
  await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Undo changes', exact: true })).toHaveCount(0);
});

test('configuration denies delegated settings operators', async ({ page }) => {
  await configurationApp(page, false);
  await page.goto('/administration/configuration');
  await expect(page).toHaveURL(/\/forbidden$/);
  await expect(page.locator('a[href="/administration/configuration"]')).toHaveCount(0);
});

test('picker is accessible in both themes and reflows on mobile', async ({ page }) => {
  await configurationApp(page);
  await page.goto('/administration/configuration');
  const lightPreview = page.locator('[data-theme-preview="light"]');
  const darkPreview = page.locator('[data-theme-preview="dark"]');
  for (const hostDark of [false, true]) {
    await page.evaluate(
      (enabled) => document.documentElement.classList.toggle('dark', enabled),
      hostDark,
    );
    await expect(lightPreview.locator('[data-slot="card-content"]')).toHaveCSS(
      'background-color',
      'rgb(255, 255, 255)',
    );
    await expect(lightPreview).toHaveCSS('color-scheme', 'light');
    await expect(darkPreview.locator('[data-slot="card-content"]')).toHaveCSS(
      'background-color',
      'rgb(24, 24, 27)',
    );
    await expect(darkPreview).toHaveCSS('color-scheme', 'dark');
  }
  await page.getByRole('button', { name: 'Add custom color', exact: true }).click();
  await expect(page.getByLabel('Color name', { exact: true })).toBeFocused();
  for (const dark of [false, true]) {
    await page.evaluate(
      (enabled) => document.documentElement.classList.toggle('dark', enabled),
      dark,
    );
    const result = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  await page.setViewportSize({ width: 320, height: 760 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  const bounds = await page
    .getByRole('dialog', { name: 'Add custom color', exact: true })
    .boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Add custom color', exact: true })).toBeFocused();
});

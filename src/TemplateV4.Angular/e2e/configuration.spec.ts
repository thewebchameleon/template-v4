import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type { PlatformAppearance } from '../src/app/api/models/platform-appearance';
import { GRADIENT_CATALOG } from '../src/app/core/gradient-catalog';

async function configurationApp(page: Page, administrator = true) {
  let saved: PlatformAppearance = {
    primaryColor: '#2563EB',
    version: 'initial',
    customColors: [],
    selectedCustomColorId: null,
    loginBackground: 'blue-sky',
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
      '/api/v1/auth/appearance': {
        primaryColor: saved.primaryColor,
        loginBackground: saved.loginBackground,
      },
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
      '/api/v1/capabilities': {},
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

test('all builder types expose their presets and render their own effects', async ({ page }) => {
  test.setTimeout(300000);
  const app = await configurationApp(page);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/administration/configuration');
  const picker = page.locator('app-login-background-picker');
  const preview = picker.getByTestId('login-preview');
  const canvas = preview.locator('canvas');
  const images = new Set<string>();
  for (const type of GRADIENT_CATALOG.types) {
    await picker.getByTestId('choose-gradient-type').click();
    await expect(page.getByTestId('gradient-types').getByRole('radio')).toHaveCount(30);
    await page
      .getByTestId('gradient-types')
      .getByRole('radio', { name: type.name, exact: true })
      .click();
    const presets = GRADIENT_CATALOG.presets.filter((preset) => preset.type === type.id);
    for (const preset of [presets[0], presets[presets.length - 1]]) {
      await picker.getByTestId('choose-gradient-preset').click();
      await expect(page.getByTestId('gradient-presets').getByRole('radio')).toHaveCount(
        presets.length,
      );
      await page.getByTestId('gradient-presets').locator(`input[value="${preset.id}"]`).click();
      await preview.scrollIntoViewIfNeeded();
      await expect(preview.locator('app-login-background')).toHaveAttribute(
        'data-preset',
        preset.id,
      );
      await expect(canvas).toHaveAttribute('data-renderer', 'canvas');
      const distinctPixels = await canvas.evaluate((element: HTMLCanvasElement) => {
        const pixels = element
          .getContext('2d')!
          .getImageData(0, 0, element.width, element.height).data;
        const colors = new Set<string>();
        for (let i = 0; i < pixels.length; i += 400)
          colors.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
        return colors.size;
      });
      // Hard-edged presets such as Tricolour intentionally contain only three colors.
      expect(distinctPixels, `${type.name}: ${preset.name}`).toBeGreaterThan(1);
      images.add((await canvas.screenshot()).toString('base64'));
    }
    const before = await canvas.screenshot();
    await page.getByRole('button', { name: 'Violet', exact: true }).click();
    await preview.scrollIntoViewIfNeeded();
    await expect
      .poll(async () => (await canvas.screenshot()).equals(before), { message: type.name })
      .toBe(false);
    await page.getByRole('button', { name: 'Blue', exact: true }).click();
  }
  expect(images.size).toBeGreaterThan(40);
  expect(errors).toEqual([]);
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect.poll(() => app.saved().loginBackground).toMatch(/^ios:/);
  await page.reload();
  await expect(picker.getByTestId('choose-gradient-type')).toHaveAccessibleName(
    'Gradient type: iOS',
  );
});

test('login backgrounds preview, retain drafts on conflict, undo and persist on reload', async ({
  page,
}) => {
  const app = await configurationApp(page);
  await page.goto('/administration/configuration');
  const picker = page.locator('app-login-background-picker');
  const preview = picker.getByTestId('login-preview').locator('app-login-background');
  await picker.getByTestId('choose-gradient-type').click();
  const types = page.getByTestId('gradient-types');
  await types.getByRole('radio', { name: 'Sky', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(picker.getByTestId('choose-gradient-type')).toHaveAccessibleName(
    'Gradient type: Aurora',
  );
  await picker.getByTestId('choose-gradient-type').click();
  await types.getByRole('radio', { name: 'Aurora', exact: true }).focus();
  await page.keyboard.press('ArrowLeft');
  await expect(picker.getByTestId('choose-gradient-type')).toHaveAccessibleName(
    'Gradient type: Sky',
  );
  await picker.getByTestId('choose-gradient-preset').click();
  await expect(page.getByTestId('gradient-presets').getByRole('radio')).toHaveCount(12);
  await page
    .getByTestId('gradient-presets')
    .getByRole('radio', { name: 'Blue sky', exact: true })
    .focus();
  await page.keyboard.press('ArrowRight');
  await expect(picker.getByTestId('choose-gradient-preset')).toHaveAccessibleName(
    'Color preset: Madder dusk',
  );
  await expect(preview).toHaveAttribute('data-preset', 'madder-dusk');
  await expect(preview.locator('canvas')).toHaveAttribute('data-renderer', 'canvas');
  expect(app.saves()).toBe(0);
  app.conflictNext();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save changes', exact: true })).toBeEnabled();
  await expect(preview).toHaveAttribute('data-preset', 'madder-dusk');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect.poll(() => app.saved().loginBackground).toBe('madder-dusk');
  await page.reload();
  await expect(picker.getByTestId('choose-gradient-preset')).toHaveAccessibleName(
    'Color preset: Madder dusk',
  );
  await picker.getByTestId('choose-gradient-preset').click();
  await page.getByTestId('gradient-presets').getByRole('radio', { name: 'Golden hour' }).click();
  await page.getByRole('button', { name: 'Undo changes', exact: true }).click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Undo changes', exact: true })
    .click();
  await expect(preview).toHaveAttribute('data-preset', 'madder-dusk');
});

test('all background shaders render, motion can pause, and picker is accessible and responsive', async ({
  page,
}) => {
  await configurationApp(page);
  await page.goto('/administration/configuration');
  const picker = page.locator('app-login-background-picker');
  const preview = picker.getByTestId('login-preview');
  await preview.scrollIntoViewIfNeeded();
  await expect(preview.getByRole('heading', { name: 'Form controls' })).toBeVisible();
  await expect(preview.getByLabel('Display name')).toBeVisible();
  await expect(preview.getByRole('combobox', { name: 'Role' })).toContainText('Administrator');
  await expect(preview.getByRole('checkbox', { name: 'Email updates' })).toBeChecked();
  await expect(preview.getByRole('switch', { name: 'Feature enabled' })).toBeChecked();
  await expect(preview.getByRole('button', { name: 'Primary', exact: true })).toBeVisible();
  const canvas = preview.locator('canvas');
  await expect(canvas).toHaveAttribute('data-animating', 'true');
  const first = await canvas.screenshot();
  await expect.poll(async () => (await canvas.screenshot()).equals(first)).toBe(false);
  await preview.getByRole('button', { name: 'Pause background' }).click();
  await expect(canvas).toHaveAttribute('data-animating', 'false');
  await preview.getByRole('button', { name: 'Resume background' }).click();
  await expect(canvas).toHaveAttribute('data-animating', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(canvas).toHaveAttribute('data-animating', 'false');
  const paused = await canvas.screenshot();
  expect((await canvas.screenshot()).equals(paused)).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => (document.documentElement.dataset['motion'] = 'reduced'));
  await expect(canvas).toHaveAttribute('data-animating', 'false');
  const images: Buffer[] = [];
  for (const preset of GRADIENT_CATALOG.presets.filter((preset) => preset.type === 'SKY')) {
    await picker.getByTestId('choose-gradient-preset').click();
    await page.getByTestId('gradient-presets').locator(`input[value="${preset.id}"]`).click();
    await preview.scrollIntoViewIfNeeded();
    await expect(canvas).toHaveAttribute('data-renderer', 'canvas');
    images.push(await canvas.screenshot());
  }
  expect(new Set(images.map((buffer) => buffer.toString('base64'))).size).toBe(12);
  for (const dark of [false, true]) {
    await page.evaluate((value) => document.documentElement.classList.toggle('dark', value), dark);
    const result = await new AxeBuilder({ page })
      .include('app-login-background-picker')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
  }
  await page.setViewportSize({ width: 320, height: 760 });
  await page.screenshot({
    path: test.info().outputPath('configuration-mobile.png'),
    fullPage: true,
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  for (const control of ['choose-gradient-type', 'choose-gradient-preset']) {
    await picker.getByTestId(control).click();
    const result = await new AxeBuilder({ page })
      .include('hlm-drawer-content')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(result.violations).toEqual([]);
    const bounds = await page.locator('hlm-drawer-content:visible').boundingBox();
    await page.screenshot({ path: test.info().outputPath(`${control}-mobile.png`) });
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    await page.keyboard.press('Escape');
    await expect(picker.getByTestId(control)).toBeFocused();
  }
});

test('public background applies to login, signup and recovery with a safe fallback', async ({
  page,
}) => {
  await configurationApp(page);
  await page.route('**/api/v1/auth/refresh', (route) => route.fulfill({ status: 401, json: {} }));
  await page.route('**/api/v1/auth/registration', (route) =>
    route.fulfill({ json: { enabled: true } }),
  );
  await page.route('**/api/v1/auth/appearance', (route) =>
    route.fulfill({ json: { primaryColor: '#2563EB', loginBackground: 'mint-sky' } }),
  );
  for (const path of ['/login', '/signup', '/account?action=reset-password']) {
    await page.goto(path);
    const artwork = page.locator('.auth-artwork app-login-background');
    await expect(artwork).toHaveAttribute('data-preset', 'mint-sky');
    await expect(artwork.locator('canvas')).toHaveAttribute('data-renderer', 'canvas');
  }
  await page.route('**/api/v1/auth/appearance', (route) =>
    route.fulfill({ json: { primaryColor: '#2563EB', loginBackground: 'unrecognized' } }),
  );
  await page.goto('/login');
  await expect(page.locator('.auth-artwork app-login-background')).toHaveAttribute(
    'data-preset',
    'blue-sky',
  );
  await page.setViewportSize({ width: 375, height: 800 });
  await expect(page.locator('.auth-artwork')).toBeHidden();
  await expect(page.locator('.auth-artwork canvas')).toHaveAttribute('data-animating', 'false');
});

test('custom palette supports picker, preview, rename, conflict, removal and saving', async ({
  page,
}) => {
  const app = await configurationApp(page);
  await page.goto('/administration/configuration');
  await expect(page.getByRole('heading', { name: 'Branding', exact: true })).toBeVisible();
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
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
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
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
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
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
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
  await expect(page.getByRole('button', { name: 'Save changes', exact: true })).toBeDisabled();
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

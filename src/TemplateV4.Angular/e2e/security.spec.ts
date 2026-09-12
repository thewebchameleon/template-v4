import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHmac } from 'node:crypto';

function totp(key: string) {
  let bits = 0,
    buffer = 0;
  const bytes: number[] = [];
  for (const ch of key) {
    buffer = (buffer << 5) | 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 255);
    }
  }
  const counter = Buffer.alloc(8);
  counter.writeBigInt64BE(BigInt(Math.floor(Date.now() / 30000)));
  const hash = createHmac('sha1', Buffer.from(bytes)).update(counter).digest();
  const offset = hash[hash.length - 1] & 15;
  return ((hash.readUInt32BE(offset) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
}

test('required setup, passkey enrollment, policy settings and passkey sign-in', async ({
  page,
  context,
}) => {
  const password = process.env['BOOTSTRAP_PASSWORD'];
  const email = process.env['BOOTSTRAP_EMAIL'];
  if (!password || !email)
    throw new Error('Provide test-only BOOTSTRAP_EMAIL and BOOTSTRAP_PASSWORD');
  const cdp = await context.newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  const accessible = async () => {
    const result = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(
      result.violations.map((x) => ({
        id: x.id,
        impact: x.impact,
        nodes: x.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  };
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
  await accessible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.getByLabel('Username', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Account security' })).toBeVisible();
  await expect(page.getByText('Your account requires MFA.', { exact: false })).toBeVisible();
  await expect(page.getByRole('region', { name: /Notifications/ })).not.toContainText(
    'Complete factor setup',
  );
  await page.getByLabel('Passkey name').fill('Browser test key');
  await page.getByRole('button', { name: 'Add passkey', exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Add passkey', exact: true }).last().click();
  await expect(page.getByText('Browser test key', { exact: true })).toBeVisible();
  await expect(page.getByText('Your account requires MFA.', { exact: false })).toHaveCount(0);
  await page.locator('.app-header').getByRole('button', { name: 'Sign out', exact: true }).click();
  await page.getByLabel('Username', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Passkey', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Users', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Invite user', exact: true }).click();
  await page.getByLabel('Full name', { exact: true }).fill('Browser invite');
  await page.getByLabel('Email', { exact: true }).fill('invited-browser@example.test');
  await page.getByRole('checkbox', { name: 'Administrator', exact: true }).check();
  await page.getByRole('button', { name: 'Invite user', exact: true }).click();
  await expect(page.getByText('Browser invite', { exact: true })).toBeVisible();
  const row = page.getByRole('row').filter({ hasText: 'Browser invite' });
  await expect(row).toContainText('Pending');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await accessible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.getByRole('link', { name: 'Admin settings', exact: true }).click();
  await accessible();
  await expect(
    page.getByRole('tab', { name: 'Optional for everyone', exact: true }),
  ).toHaveAttribute('aria-selected', 'true');
  const administratorsMfa = page.getByRole('switch', {
    name: 'Required for administrators',
    exact: true,
  });
  await expect(administratorsMfa).toBeChecked();
  await administratorsMfa.uncheck();
  await expect(administratorsMfa).not.toBeChecked();
  await page.getByRole('tab', { name: 'Required for everyone', exact: true }).click();
  await expect(administratorsMfa).toBeChecked();
  await expect(administratorsMfa).toBeDisabled();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Security settings saved');
  await page.locator('.app-header').getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await page.getByRole('button', { name: 'Sign in with a passkey', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Users', exact: true })).toBeVisible();
  await page.goto('/security');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  const accessibility = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(
    accessibility.violations.map((x) => ({
      id: x.id,
      impact: x.impact,
      description: x.description,
    })),
  ).toEqual([]);
  await page.getByRole('button', { name: 'Set up authenticator', exact: true }).click();
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Set up authenticator', exact: true }).last().click();
  const setupKey = await page.locator('code').first().innerText();
  await page.getByLabel('Authenticator or recovery code', { exact: true }).fill(totp(setupKey));
  await page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect(page.getByText('Save your recovery codes', { exact: true })).toBeVisible();
  const recovery = await page.locator('li code').first().innerText();
  await page.getByRole('button', { name: 'I have saved these codes', exact: true }).click();
  await page.locator('.app-header').getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await page.getByLabel('Username', { exact: true }).fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await page.getByRole('button', { name: 'Authenticator app', exact: true }).click();
  await page.getByLabel('Use a recovery code', { exact: true }).check();
  await page.getByLabel('Authenticator or recovery code', { exact: true }).fill(recovery);
  await page.getByRole('button', { name: 'Verify', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Users', exact: true })).toBeVisible();
  await page.locator('.app-header').getByRole('button', { name: 'Sign out', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  await page.reload();
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/login(?:\?|$)/);
});

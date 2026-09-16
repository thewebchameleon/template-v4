import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { Runtime } from './runtime';
import { brandPalette, validPrimaryColor, DEFAULT_PRIMARY_COLOR } from './brand-palette';
import { DEFAULT_LOGIN_BACKGROUND, loginBackground } from './login-backgrounds';

@Injectable({ providedIn: 'root' })
export class PlatformAppearanceTheme {
  readonly primaryColor = signal(DEFAULT_PRIMARY_COLOR);
  readonly loginBackground = signal<string>(DEFAULT_LOGIN_BACKGROUND);
  readonly organisationName = signal('templatev4');
  readonly organisationLogoUrl = signal<string | null>(null);
  private readonly runtime = inject(Runtime);
  private readonly root = inject(DOCUMENT).documentElement;

  async load() {
    try {
      const response = await fetch(`${this.runtime.apiUrl}/api/v1/auth/appearance`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return;
      const value: unknown = await response.json();
      if (
        !value ||
        typeof value !== 'object' ||
        !('primaryColor' in value) ||
        typeof value.primaryColor !== 'string' ||
        !validPrimaryColor(value.primaryColor)
      )
        return;
      this.apply(value.primaryColor);
      this.loginBackground.set(
        loginBackground('loginBackground' in value ? value.loginBackground : undefined).id,
      );
      if ('organisationName' in value && typeof value.organisationName === 'string')
        this.organisationName.set(value.organisationName);
      this.organisationLogoUrl.set(
        'organisationLogoUrl' in value && typeof value.organisationLogoUrl === 'string'
          ? new URL(value.organisationLogoUrl, this.runtime.apiUrl || location.origin).toString()
          : null,
      );
    } catch {
      // Keep the bundled brand when offline or when configuration is unavailable.
    }
  }

  apply(primaryColor: string) {
    if (!validPrimaryColor(primaryColor)) return;
    this.primaryColor.set(primaryColor);
    for (const [shade, color] of Object.entries(brandPalette(primaryColor)))
      this.root.style.setProperty(`--brand-primary-${shade}`, color);
  }

  brand(name: string, logoUrl: string | null) {
    this.organisationName.set(name);
    this.organisationLogoUrl.set(
      logoUrl ? new URL(logoUrl, this.runtime.apiUrl || location.origin).toString() : null,
    );
  }
}

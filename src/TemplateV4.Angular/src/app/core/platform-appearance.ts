import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Runtime } from './runtime';
import { brandPalette, validPrimaryColor } from './brand-palette';

@Injectable({ providedIn: 'root' })
export class PlatformAppearanceTheme {
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
    } catch {
      // Keep the bundled brand when offline or when configuration is unavailable.
    }
  }

  apply(primaryColor: string) {
    if (!validPrimaryColor(primaryColor)) return;
    for (const [shade, color] of Object.entries(brandPalette(primaryColor)))
      this.root.style.setProperty(`--brand-primary-${shade}`, color);
  }
}

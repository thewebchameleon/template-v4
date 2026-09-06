import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

type ThemePreference = 'light' | 'dark' | 'system';
const storageKey = 'templatev4-theme';
const normalize = (value: string | null | undefined): ThemePreference =>
  value === 'light' || value === 'dark' ? value : 'system';

@Injectable({ providedIn: 'root' })
export class Theme {
  private readonly root = inject(DOCUMENT).documentElement;
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly selected = signal(normalize(this.root.dataset['themePreference']));
  readonly preference = this.selected.asReadonly();

  constructor() {
    const onSystemChange = () => this.apply();
    const onStorageChange = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      if (event.storageArea !== window.localStorage) return;
      this.selected.set(normalize(event.newValue));
      this.apply();
    };
    this.media.addEventListener('change', onSystemChange);
    window.addEventListener('storage', onStorageChange);
    inject(DestroyRef).onDestroy(() => {
      this.media.removeEventListener('change', onSystemChange);
      window.removeEventListener('storage', onStorageChange);
    });
    this.apply();
  }

  set(value: string | null | undefined) {
    this.selected.set(normalize(value));
    this.apply();
    try {
      localStorage.setItem(storageKey, this.preference());
    } catch {
      // Keep the selected theme for this page even when storage is blocked.
    }
  }

  private apply() {
    this.root.dataset['themePreference'] = this.preference();
    this.root.classList.toggle(
      'dark',
      this.preference() === 'dark' || (this.preference() === 'system' && this.media.matches),
    );
  }
}

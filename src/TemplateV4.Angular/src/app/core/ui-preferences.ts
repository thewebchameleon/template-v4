import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';

export type TextSizePreference = 'default' | 'large' | 'extra-large';
export type ContrastPreference = 'standard' | 'high';
export type MotionPreference = 'system' | 'reduced';
export type DensityPreference = 'comfortable' | 'compact';

interface UiPreferenceState {
  textSize: TextSizePreference;
  contrast: ContrastPreference;
  motion: MotionPreference;
  density: DensityPreference;
}

const storageKey = 'templatev4-ui-preferences';
const defaults: UiPreferenceState = {
  textSize: 'default',
  contrast: 'standard',
  motion: 'system',
  density: 'comfortable',
};

const normalize = (value: Partial<UiPreferenceState> | null | undefined): UiPreferenceState => ({
  textSize:
    value?.textSize === 'large' || value?.textSize === 'extra-large' ? value.textSize : 'default',
  contrast: value?.contrast === 'high' ? 'high' : 'standard',
  motion: value?.motion === 'reduced' ? 'reduced' : 'system',
  density: value?.density === 'compact' ? 'compact' : 'comfortable',
});

const parse = (value: string | null): UiPreferenceState => {
  if (!value) return defaults;
  try {
    return normalize(JSON.parse(value) as Partial<UiPreferenceState>);
  } catch {
    return defaults;
  }
};

@Injectable({ providedIn: 'root' })
export class UiPreferences {
  private readonly root = inject(DOCUMENT).documentElement;
  private readonly state = signal(
    normalize({
      textSize: this.root.dataset['textSize'] as TextSizePreference,
      contrast: this.root.dataset['contrast'] as ContrastPreference,
      motion: this.root.dataset['motion'] as MotionPreference,
      density: this.root.dataset['density'] as DensityPreference,
    }),
  );

  readonly textSize = () => this.state().textSize;
  readonly contrast = () => this.state().contrast;
  readonly motion = () => this.state().motion;
  readonly density = () => this.state().density;

  constructor() {
    const onStorageChange = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      if (event.storageArea !== window.localStorage) return;
      this.state.set(parse(event.newValue));
      this.apply();
    };
    window.addEventListener('storage', onStorageChange);
    inject(DestroyRef).onDestroy(() => window.removeEventListener('storage', onStorageChange));
    this.apply();
  }

  setTextSize(value: string | null | undefined) {
    if (value !== 'default' && value !== 'large' && value !== 'extra-large') return;
    this.update({ textSize: value });
  }

  setContrast(value: string | null | undefined) {
    if (value !== 'standard' && value !== 'high') return;
    this.update({ contrast: value });
  }

  setMotion(value: string | null | undefined) {
    if (value !== 'system' && value !== 'reduced') return;
    this.update({ motion: value });
  }

  setDensity(value: string | null | undefined) {
    if (value !== 'comfortable' && value !== 'compact') return;
    this.update({ density: value });
  }

  reset() {
    this.state.set(defaults);
    this.apply();
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Keep the defaults active for this page when storage is unavailable.
    }
  }

  private update(change: Partial<UiPreferenceState>) {
    this.state.update((current) => ({ ...current, ...change }));
    this.apply();
    try {
      localStorage.setItem(storageKey, JSON.stringify(this.state()));
    } catch {
      // Keep preferences active for this page when storage is unavailable.
    }
  }

  private apply() {
    const state = this.state();
    this.root.dataset['textSize'] = state.textSize;
    this.root.dataset['contrast'] = state.contrast;
    this.root.dataset['motion'] = state.motion;
    this.root.dataset['density'] = state.density;
  }
}

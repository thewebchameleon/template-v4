import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { getAnalyser, play, set, unlock } from '@foleyjs/core';

export type UiSound = 'success' | 'error' | 'ping' | 'on' | 'off' | 'complete';
const storageKey = 'templatev4-sound-muted';

@Injectable({ providedIn: 'root' })
export class UiSounds {
  private readonly document = inject(DOCUMENT);
  private readonly selected = signal(this.readMuted());
  readonly muted = this.selected.asReadonly();

  constructor() {
    set({ theme: 'soft', volume: 0.35, muted: this.muted(), hover: false });
    // Programmatic cues only: unlock on a real gesture without binding global UI sounds.
    const activate = (event: Event) => {
      if (!event.isTrusted || this.muted()) return;
      try {
        unlock();
      } catch {
        // Audio is optional; unsupported browsers still complete the interaction.
      }
    };
    const synchronize = (event: StorageEvent) => {
      if (event.key !== storageKey && event.key !== null) return;
      try {
        if (event.storageArea !== window.localStorage) return;
        this.apply(event.newValue === 'true');
      } catch {
        // Keep this page's preference when storage is unavailable.
      }
    };
    this.document.addEventListener('pointerdown', activate, true);
    this.document.addEventListener('keydown', activate, true);
    window.addEventListener('storage', synchronize);
    inject(DestroyRef).onDestroy(() => {
      this.document.removeEventListener('pointerdown', activate, true);
      this.document.removeEventListener('keydown', activate, true);
      window.removeEventListener('storage', synchronize);
    });
  }

  play(cue: UiSound) {
    // Do not queue old feedback for the next gesture or announce background refreshes.
    if (this.muted() || this.document.visibilityState !== 'visible') return;
    try {
      if (getAnalyser()?.context.state === 'running') play(cue);
    } catch {
      // A failed sound must never turn a successful operation into an error.
    }
  }

  setMuted(muted: boolean) {
    this.apply(muted);
    try {
      localStorage.setItem(storageKey, String(muted));
    } catch {
      // Keep the preference active for this page when storage is blocked.
    }
  }

  reset() {
    this.apply(false);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Keep the default active for this page when storage is blocked.
    }
  }

  private apply(muted: boolean) {
    this.selected.set(muted);
    set({ muted });
  }

  private readMuted() {
    try {
      return localStorage.getItem(storageKey) === 'true';
    } catch {
      return false;
    }
  }
}

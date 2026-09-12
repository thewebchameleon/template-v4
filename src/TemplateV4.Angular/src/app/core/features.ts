import { dictionary } from './translations';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Runtime } from './runtime';
@Injectable({ providedIn: 'root' })
export class Features {
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  readonly evaluated = signal<Record<string, boolean>>({});
  readonly modules = signal<Record<string, boolean>>({});
  private generation = 0;
  private pending?: Promise<void>;
  load(): Promise<void> {
    if (this.pending) return this.pending;
    const generation = this.generation;
    const pending = this.fetch(generation)
      .catch(() => {
        if (generation === this.generation) {
          this.evaluated.set({});
          this.modules.set({});
        }
      })
      // A sign-in reset can supersede a route guard's in-flight fetch. Wait for
      // the current actor's modules before the guard decides whether to redirect.
      .then(() => (generation === this.generation ? undefined : this.load()))
      .finally(() => {
        if (this.pending === pending) this.pending = undefined;
      });
    return (this.pending = pending);
  }
  reset() {
    this.generation++;
    this.pending = undefined;
    this.evaluated.set({});
    this.modules.set({});
  }
  private async fetch(generation: number) {
    const [features, modules] = await Promise.all([
      firstValueFrom(
        this.http.get<Record<string, boolean>>(`${this.runtime.apiUrl}/api/v1/features`),
      ),
      firstValueFrom(
        this.http.get<Record<string, boolean>>(`${this.runtime.apiUrl}/api/v1/modules`),
      ),
    ]);
    if (generation !== this.generation) return;
    this.evaluated.set(features);
    this.modules.set(modules);
  }
  moduleEnabled(name: string) {
    return this.modules()[name] === true;
  }
  enabled(name: string) {
    return this.evaluated()[name] === true;
  }
}

export const filesGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const features = inject(Features);
  const router = inject(Router);
  if (!auth.access() && !(await auth.refresh())) return router.createUrlTree(['/login']);
  await features.load();
  return features.enabled('files') || router.createUrlTree(['/me']);
};

export const moduleGuard =
  (name: string): CanActivateFn =>
  async () => {
    const auth = inject(Auth);
    const features = inject(Features);
    const router = inject(Router);
    if (!auth.access() && !(await auth.refresh())) return router.createUrlTree(['/login']);
    await features.load();
    if (name === 'support') {
      const translations = await import('./support-translations');
      Object.assign(dictionary, translations.supportDictionary);
    }
    return features.moduleEnabled(name) || router.createUrlTree(['/me']);
  };

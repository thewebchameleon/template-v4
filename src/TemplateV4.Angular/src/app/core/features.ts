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
  readonly capabilities = signal<Partial<Record<string, boolean>>>({});
  private generation = 0;
  private pending?: Promise<void>;
  load(): Promise<void> {
    if (this.pending) return this.pending;
    const generation = this.generation;
    const pending = this.fetch(generation)
      .catch(() => {
        if (generation === this.generation) {
          this.capabilities.set({});
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
    this.capabilities.set({});
  }
  private async fetch(generation: number) {
    const capabilities = await firstValueFrom(
      this.http.get<Partial<Record<string, boolean>>>(`${this.runtime.apiUrl}/api/v1/capabilities`),
    );
    if (generation !== this.generation) return;
    this.capabilities.set(capabilities);
  }
  enabled(name: string) {
    return this.capabilities()[name] === true;
  }
}

export const capabilityGuard =
  (name: string): CanActivateFn =>
  async () => {
    const auth = inject(Auth);
    const features = inject(Features);
    const router = inject(Router);
    if (!auth.access() && !(await auth.refresh())) return router.createUrlTree(['/login']);
    await features.load();
    return features.enabled(name) || router.createUrlTree(['/me']);
  };

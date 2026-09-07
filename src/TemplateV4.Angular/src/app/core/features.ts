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
  private pending?: Promise<void>;
  load() {
    return (this.pending ??= this.fetch()
      .catch(() => {
        /* Request errors are already reported centrally. */
      })
      .finally(() => {
        this.pending = undefined;
      }));
  }
  private async fetch() {
    this.evaluated.set(
      await firstValueFrom(
        this.http.get<Record<string, boolean>>(`${this.runtime.apiUrl}/api/v1/features`),
      ),
    );
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

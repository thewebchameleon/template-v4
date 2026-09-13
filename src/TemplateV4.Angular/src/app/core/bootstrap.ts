import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Runtime } from './runtime';
import { Errors } from './interceptors';
import { Auth } from './auth';

export interface BootstrapRequest {
  token: string;
  username: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class Bootstrap {
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private csrf = '';

  private status?: { at: number; value: Promise<{ available: boolean }> };
  available(): Promise<{ available: boolean }> {
    if (this.status && Date.now() - this.status.at < 10000) return this.status.value;
    const value = this.fetchAvailable().catch((error) => {
      this.status = undefined;
      throw error;
    });
    this.status = { at: Date.now(), value };
    return value;
  }
  private fetchAvailable(): Promise<{ available: boolean }> {
    return firstValueFrom(
      this.http.get<{ available: boolean }>(`${this.runtime.apiUrl}/api/v1/bootstrap/status`),
    );
  }

  create(request: BootstrapRequest): Promise<void> {
    this.status = undefined;
    return this.createWithAntiforgery(request).finally(() => {
      this.status = undefined;
    });
  }

  private async createWithAntiforgery(request: BootstrapRequest): Promise<void> {
    if (!this.csrf) {
      this.csrf = (
        await firstValueFrom(
          this.http.get<{ token: string }>(`${this.runtime.apiUrl}/api/v1/auth/csrf`, {
            withCredentials: true,
          }),
        )
      ).token;
    }
    await firstValueFrom(
      this.http.post<void>(`${this.runtime.apiUrl}/api/v1/bootstrap`, request, {
        withCredentials: true,
        headers: { 'X-CSRF-TOKEN': this.csrf },
      }),
    );
    this.csrf = '';
  }
}

export const bootstrapLandingGuard: CanActivateFn = async () => {
  const bootstrap = inject(Bootstrap);
  const errors = inject(Errors);
  const auth = inject(Auth);
  const router = inject(Router);
  try {
    if ((await bootstrap.available()).available) return router.createUrlTree(['/bootstrap']);
    if (!auth.access() && !(await auth.refresh())) return router.createUrlTree(['/login']);
    return router.createUrlTree([auth.landing()]);
  } catch {
    errors.problem.set(null);
    return router.createUrlTree(['/login']);
  }
};

export const bootstrapLoginGuard: CanActivateFn = async () => {
  const bootstrap = inject(Bootstrap);
  const errors = inject(Errors);
  const auth = inject(Auth);
  const router = inject(Router);
  try {
    if (auth.access() || (await auth.refresh())) return router.createUrlTree([auth.landing()]);
    return (await bootstrap.available()).available ? router.createUrlTree(['/bootstrap']) : true;
  } catch {
    errors.problem.set(null);
    return true;
  }
};

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Runtime } from './runtime';
import { Errors } from './interceptors';

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

  available(): Promise<{ available: boolean }> {
    return firstValueFrom(
      this.http.get<{ available: boolean }>(`${this.runtime.apiUrl}/api/v1/bootstrap/status`),
    );
  }

  create(request: BootstrapRequest): Promise<void> {
    return this.createWithAntiforgery(request);
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
  const router = inject(Router);
  try {
    return router.createUrlTree([
      (await bootstrap.available()).available ? '/bootstrap' : '/profile',
    ]);
  } catch {
    errors.problem.set(null);
    return router.createUrlTree(['/login']);
  }
};

export const bootstrapLoginGuard: CanActivateFn = async () => {
  const bootstrap = inject(Bootstrap);
  const errors = inject(Errors);
  const router = inject(Router);
  try {
    return (await bootstrap.available()).available ? router.createUrlTree(['/bootstrap']) : true;
  } catch {
    errors.problem.set(null);
    return true;
  }
};

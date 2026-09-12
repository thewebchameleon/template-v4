import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Runtime } from './runtime';
import { I18n } from './i18n';
import { AccessResponse as Access } from '../api/models/access-response';
type ChallengeAccess = Access & {
  mfaMethods?: string[];
  preferredMfaMethod?: string | null;
  emailCodeSent?: boolean;
  emailResendAt?: string | null;
};
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly runtime = inject(Runtime);
  private readonly i18n = inject(I18n);
  readonly access = signal<Access | null>(null);
  readonly challenge = signal<string | null>(null);
  readonly mfaMethods = signal<string[]>([]);
  readonly preferredMfaMethod = signal('Email');
  readonly emailCodeSent = signal(false);
  readonly emailResendAt = signal<string | null>(null);
  private readonly channel =
    typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel('templatev4-auth');
  private generation = 0;
  constructor() {
    this.channel?.addEventListener('message', () => {
      this.generation++;
      this.access.set(null);
      void this.router.navigateByUrl('/login');
    });
  }
  private async serial<T>(work: () => Promise<T>): Promise<T> {
    return navigator.locks ? navigator.locks.request('templatev4-auth', work) : work();
  }
  private csrf = '';
  private pending: Promise<boolean> | null = null;
  landing() {
    return this.access()?.setupRequired ? '/security' : '/dashboard';
  }
  has(permission: string) {
    return this.access()?.permissions.includes(permission) ?? false;
  }
  private async csrfToken() {
    if (!this.csrf)
      this.csrf = (
        await firstValueFrom(
          this.http.get<{ token: string }>(`${this.runtime.apiUrl}/api/v1/auth/csrf`, {
            withCredentials: true,
          }),
        )
      ).token;
    return this.csrf;
  }
  async action<T>(path: string, body: unknown = {}): Promise<T> {
    const token = await this.csrfToken();
    return firstValueFrom(
      this.http.post<T>(`${this.runtime.apiUrl}/api/v1/auth/${path}`, body, {
        withCredentials: true,
        headers: { 'X-CSRF-TOKEN': token },
      }),
    );
  }
  async browserHeaders() {
    return { 'X-CSRF-TOKEN': await this.csrfToken() };
  }
  async login(username: string, password: string) {
    return this.serial(async () => {
      const value = await this.action<ChallengeAccess>('login', {
        username,
        password,
        device: 'Browser',
      });
      this.challenge.set(value.challengeId ?? null);
      this.mfaMethods.set(value.mfaMethods ?? []);
      this.preferredMfaMethod.set(value.preferredMfaMethod ?? 'Email');
      this.emailCodeSent.set(value.emailCodeSent ?? false);
      this.emailResendAt.set(value.emailResendAt ?? null);
      if (!value.challengeId) this.accept(value);
    });
  }
  async completeMfa(method: string, code: string, recoveryCode: boolean) {
    await this.serial(async () => {
      try {
        this.accept(
          await this.action<Access>('mfa/login', {
            challengeId: this.challenge(),
            code,
            recoveryCode,
            method,
          }),
        );
      } finally {
        if (this.access()) this.resetChallenge();
      }
    });
  }
  async sendEmailCode() {
    const value = await this.action<{ expiresAt: string; resendAt: string }>('mfa/email', {
      challengeId: this.challenge(),
    });
    this.emailCodeSent.set(true);
    this.emailResendAt.set(value.resendAt);
  }
  async passkeyLogin(work: () => Promise<Access>) {
    await this.serial(async () => {
      this.accept(await work());
      this.resetChallenge();
    });
  }
  private accept(value: Access) {
    this.access.set(value);
    this.csrf = '';
    this.i18n.set(value.culture);
  }
  refresh(): Promise<boolean> {
    if (this.pending) return this.pending;
    const generation = this.generation;
    const execute = async () => {
      try {
        this.csrf = '';
        const value = await this.action<Access>('refresh');
        if (generation !== this.generation) return false;
        this.accept(value);
        return true;
      } catch (error) {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401) throw error;
        this.access.set(null);
        this.csrf = '';
        return false;
      }
    };
    this.pending = this.serial(execute).finally(() => (this.pending = null));
    return this.pending;
  }
  async logout() {
    this.generation++;
    await this.serial(async () => {
      await this.action('logout');
      this.access.set(null);
      this.csrf = '';
      this.resetChallenge();
      this.channel?.postMessage('logout');
    });
  }
  async revoke(id: string) {
    const token = await this.csrfToken();
    await firstValueFrom(
      this.http.delete(`${this.runtime.apiUrl}/api/v1/auth/sessions/${id}`, {
        withCredentials: true,
        headers: { 'X-CSRF-TOKEN': token },
      }),
    );
  }
  resetChallenge() {
    this.challenge.set(null);
    this.mfaMethods.set([]);
    this.preferredMfaMethod.set('Email');
    this.emailCodeSent.set(false);
    this.emailResendAt.set(null);
  }
}
export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  if (!auth.access() && !(await auth.refresh()))
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  if (auth.access()?.setupRequired && state.url.split('?')[0] !== '/security')
    return router.createUrlTree(['/security']);
  return true;
};

export const adminGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  if (!auth.access()) await auth.refresh();
  return auth.has('users.manage') ? true : router.createUrlTree(['/security']);
};
export const administratorRoleGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return auth.access()?.isAdministrator && !auth.access()?.setupRequired
    ? true
    : router.createUrlTree(['/forbidden']);
};
export const permissionGuard: CanActivateFn = async (route) => {
  const auth = inject(Auth);
  const router = inject(Router);
  if (!auth.access() && !(await auth.refresh())) return router.createUrlTree(['/login']);
  return (
    (route.data['permissions'] as string[] | undefined)?.some((p) => auth.has(p)) ||
    auth.has(route.data['permission']) ||
    router.createUrlTree(['/forbidden'])
  );
};

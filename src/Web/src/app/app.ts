import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { Auth } from './core/auth';
import { I18n, Translate } from './core/i18n';
import { Runtime } from './core/runtime';
import { Errors } from './core/interceptors';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    RouterLink,
    HlmButtonImports,
    HlmNativeSelectImports,
    HlmAlertImports,
    Translate,
  ],
  template: ` <div class="min-h-screen bg-background text-foreground">
    <a href="#main" class="sr-only focus:not-sr-only">{{ 'skipContent' | t }}</a>
    <header class="border-b border-border">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <a routerLink="/profile" class="font-semibold tracking-tight"
          >templatev4 <span class="text-muted-foreground">/ {{ 'people' | t }}</span></a
        >
        <div class="flex flex-wrap items-center gap-3">
          <label class="sr-only" for="language">{{ 'culture' | t }}</label
          ><select
            id="language"
            hlmNativeSelect
            [value]="i18n.culture()"
            (change)="language($event)"
          >
            @for (culture of runtime.supportedCultures; track culture) {
              <option [value]="culture">{{ culture === 'af-ZA' ? 'Afrikaans' : 'English' }}</option>
            }
          </select>
          @if (auth.access()) {
            <a hlmBtn variant="ghost" routerLink="/profile">{{ 'profile' | t }}</a>
            @if (auth.has('users.manage')) {
              <a hlmBtn variant="ghost" routerLink="/users">{{ 'users' | t }}</a>
            }
            @if (auth.has('settings.manage')) {
              <a hlmBtn variant="ghost" routerLink="/settings">{{ 'adminSettings' | t }}</a>
            }
            <a hlmBtn variant="ghost" routerLink="/sessions">{{ 'sessions' | t }}</a
            ><button hlmBtn variant="outline" (click)="logout()">{{ 'signOut' | t }}</button>
          }
        </div>
      </div>
    </header>
    <main id="main" tabindex="-1" class="mx-auto max-w-7xl px-6 py-10">
      @if (errors.problem(); as error) {
        <div hlmAlert variant="destructive" role="alert" class="mb-6">
          <h2 hlmAlertTitle>{{ 'error' | t }}</h2>
          <p hlmAlertDescription>
            {{ error.title }} <small>{{ error.code }} · {{ error.traceId }}</small>
          </p>
          <button
            hlmBtn
            variant="ghost"
            aria-label="Dismiss error"
            (click)="errors.problem.set(null)"
          >
            ×
          </button>
        </div>
      }
      <router-outlet />
    </main>
  </div>`,
})
export class App {
  readonly auth = inject(Auth);
  readonly runtime = inject(Runtime);
  readonly i18n = inject(I18n);
  readonly errors = inject(Errors);
  private readonly router = inject(Router);
  async logout() {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
  async language(event: Event) {
    const culture = (event.target as HTMLSelectElement).value;
    if (this.auth.access()) await this.auth.action('culture', { culture });
    this.i18n.set(culture);
  }
}

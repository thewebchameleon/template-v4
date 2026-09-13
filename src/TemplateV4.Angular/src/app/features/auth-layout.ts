import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideGalleryVerticalEnd } from '@ng-icons/lucide';
import { Translate } from '../core/i18n';
import { Preferences } from '../core/preferences';
import { PlatformAppearanceTheme } from '../core/platform-appearance';
import { LoginBackgroundArtwork } from '../shared/login-background';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterLink, NgIcon, Translate, Preferences, LoginBackgroundArtwork],
  providers: [provideIcons({ lucideGalleryVerticalEnd })],
  template: `
    <div class="auth-layout">
      <div class="auth-main">
        <a routerLink="/" class="auth-brand">
          <span class="auth-brand-mark"><ng-icon name="lucideGalleryVerticalEnd" /></span>
          {{ 'appBrand' | t }}
        </a>
        <div class="auth-content">
          <div class="auth-form"><ng-content /></div>
        </div>
        <footer class="auth-preferences"><app-preferences /></footer>
      </div>
      <div class="auth-artwork">
        <app-login-background [value]="appearance.loginBackground()" />
      </div>
    </div>
  `,
})
export class AuthLayout {
  readonly appearance = inject(PlatformAppearanceTheme);
}

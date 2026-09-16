import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideGalleryVerticalEnd } from '@ng-icons/lucide';
import { Preferences } from '../../../core/preferences';
import { PlatformAppearanceTheme } from '../../../core/platform-appearance';
import { LoginBackgroundArtwork } from '../../../shared/login-background';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterLink, NgIcon, Preferences, LoginBackgroundArtwork],
  providers: [provideIcons({ lucideGalleryVerticalEnd })],
  template: `
    <div class="auth-layout">
      <div class="auth-main">
        <a routerLink="/" class="auth-brand">
          <span class="auth-brand-mark">
            @if (appearance.organisationLogoUrl(); as logo) {
              <img [src]="logo" alt="" />
            } @else {
              <ng-icon name="lucideGalleryVerticalEnd" />
            }
          </span>
          {{ appearance.organisationName() }}
        </a>
        <div class="auth-content">
          <div class="auth-form auth-stagger"><ng-content /></div>
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

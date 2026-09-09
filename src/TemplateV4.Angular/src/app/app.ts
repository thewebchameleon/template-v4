import { Component, computed, effect, inject, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCommand,
  lucideUserRound,
  lucideUsersRound,
  lucideSettings,
  lucideSettings2,
  lucideMonitor,
  lucideLogOut,
  lucideChevronsUpDown,
  lucideBell,
  lucideFolderOpen,
  lucideHistory,
  lucideMail,
  lucideActivity,
  lucideShieldCheck,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { Auth } from './core/auth';
import { I18n, Translate } from './core/i18n';
import { Theme } from './core/theme';
import { Preferences } from './core/preferences';
import { AppBreadcrumbs, Breadcrumbs } from './shared/breadcrumbs';
import { Confirmation } from './shared/confirmation';
import { Features } from './core/features';
import { UnreadNotifications } from './core/unread-notifications';
import { NotificationDrawer } from './features/notification-drawer';
@Component({
  selector: 'app-root',
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmButtonImports,
    HlmToasterImports,
    HlmSidebarImports,
    HlmAvatarImports,
    HlmDropdownMenuImports,
    HlmSeparatorImports,
    AppBreadcrumbs,
    HlmDrawerImports,
    Preferences,
    Translate,
    Confirmation,
    NotificationDrawer,
  ],
  providers: [
    provideIcons({
      lucideCommand,
      lucideUserRound,
      lucideUsersRound,
      lucideSettings,
      lucideSettings2,
      lucideMonitor,
      lucideLogOut,
      lucideChevronsUpDown,
      lucideBell,
      lucideFolderOpen,
      lucideHistory,
      lucideMail,
      lucideActivity,
      lucideShieldCheck,
    }),
  ],
  template: `
    <a href="#main" class="skip-link">{{ 'skipContent' | t }}</a>
    @if (auth.access()) {
      <div
        hlmSidebarWrapper
        sidebarWidth="var(--app-sidebar-width)"
        sidebarWidthIcon="var(--app-sidebar-icon-width)"
      >
        <hlm-sidebar
          [mobileTitle]="'toggleNavigation' | t"
          variant="inset"
          sidebarWidthMobile="var(--app-sidebar-mobile-width)"
        >
          <div hlmSidebarHeader>
            <ul hlmSidebarMenu>
              <li hlmSidebarMenuItem>
                <a
                  hlmSidebarMenuButton
                  size="lg"
                  [routerLink]="auth.landing()"
                  closeMobileSidebarOnClick
                >
                  <span class="brand-mark"><ng-icon name="lucideCommand" /></span>
                  <span class="brand-copy"
                    ><span>{{ 'appBrand' | t }}</span
                    ><small>{{ 'workspace' | t }}</small></span
                  >
                </a>
              </li>
            </ul>
          </div>
          <div hlmSidebarContent>
            <nav hlmSidebarGroup [attr.aria-label]="'accountNavigation' | t">
              <div hlmSidebarGroupLabel>{{ 'accountNavigation' | t }}</div>
              <ul hlmSidebarMenu>
                @for (item of accountLinks(); track item.path) {
                  <li hlmSidebarMenuItem>
                    <a
                      hlmSidebarMenuButton
                      [routerLink]="item.path"
                      routerLinkActive
                      #active="routerLinkActive"
                      [isActive]="active.isActive"
                      ariaCurrentWhenActive="page"
                      closeMobileSidebarOnClick
                    >
                      <ng-icon [name]="item.icon" /><span>{{ item.label | t }}</span>
                    </a>
                  </li>
                }
              </ul>
            </nav>
            @if (
              auth.has('users.read') ||
              auth.has('roles.manage') ||
              auth.has('settings.manage') ||
              auth.has('jobs.trigger')
            ) {
              <nav hlmSidebarGroup [attr.aria-label]="'administration' | t">
                <div hlmSidebarGroupLabel>{{ 'administration' | t }}</div>
                <ul hlmSidebarMenu>
                  @for (item of adminLinks; track item.path) {
                    @if (
                      auth.has(item.permission) ||
                      (item.path === '/users' && auth.has('roles.manage')) ||
                      (item.path === '/operations' && auth.has('jobs.trigger'))
                    ) {
                      <li hlmSidebarMenuItem>
                        <a
                          hlmSidebarMenuButton
                          [routerLink]="item.path"
                          routerLinkActive
                          #active="routerLinkActive"
                          [isActive]="active.isActive"
                          ariaCurrentWhenActive="page"
                          closeMobileSidebarOnClick
                          ><ng-icon [name]="item.icon" /><span>{{ item.label | t }}</span></a
                        >
                      </li>
                    }
                  }
                </ul>
              </nav>
            }
          </div>
          <div hlmSidebarFooter>
            <ul hlmSidebarMenu>
              <li hlmSidebarMenuItem>
                <button
                  hlmSidebarMenuButton
                  size="lg"
                  [hlmDropdownMenuTrigger]="accountMenu"
                  [side]="sidebar.isMobile() ? 'top' : 'right'"
                  align="end"
                >
                  <hlm-avatar
                    ><span hlmAvatarFallback><ng-icon name="lucideUserRound" /></span
                  ></hlm-avatar>
                  <span class="brand-copy"
                    ><span>{{ 'accountNavigation' | t }}</span
                    ><small>{{ 'accountSettings' | t }}</small></span
                  >
                  <ng-icon name="lucideChevronsUpDown" class="ml-auto" />
                </button>
              </li>
            </ul>
          </div>
        </hlm-sidebar>
        <main hlmSidebarInset id="main" tabindex="-1" class="min-w-0">
          <header class="app-header">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              <button
                hlmSidebarTrigger
                [srOnlyText]="'toggleNavigation' | t"
                [attr.aria-label]="'toggleNavigation' | t"
              ></button>
              <hlm-separator
                orientation="vertical"
                class="header-separator data-vertical:self-center"
              />
              <app-breadcrumbs />
            </div>
            @if (!auth.access()?.setupRequired) {
              <app-notification-drawer />
            }
            <hlm-drawer direction="right">
              <button
                hlmBtn
                hlmDrawerTrigger
                size="icon"
                variant="ghost"
                [attr.aria-label]="'openSettings' | t"
              >
                <ng-icon name="lucideSettings" />
              </button>
              <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
                <hlm-drawer-header>
                  <h2 hlmDrawerTitle>{{ 'settings' | t }}</h2>
                  <p hlmDrawerDescription>{{ 'settingsDescription' | t }}</p>
                </hlm-drawer-header>
                <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
                  <app-preferences [expanded]="true" />
                </div>
                <hlm-drawer-footer>
                  <button hlmBtn variant="outline" hlmDrawerClose>{{ 'close' | t }}</button>
                </hlm-drawer-footer>
              </hlm-drawer-content>
            </hlm-drawer>
          </header>
          <div class="app-content"><ng-container *ngTemplateOutlet="page" /></div>
        </main>
      </div>
    } @else {
      <main id="main" tabindex="-1"><ng-container *ngTemplateOutlet="page" /></main>
    }
    <hlm-toaster [theme]="theme.preference()" position="top-center" richColors />
    <app-confirmation />
    <ng-template #page>
      <router-outlet />
    </ng-template>
    <ng-template #accountMenu>
      <hlm-dropdown-menu>
        <hlm-dropdown-menu-group>
          <a hlmDropdownMenuItem routerLink="/me" (click)="sidebar.setOpenMobile(false)"
            ><ng-icon name="lucideUserRound" />{{ 'account' | t }}</a
          >
          @if (!auth.access()?.setupRequired) {
            <a
              hlmDropdownMenuItem
              routerLink="/security/sessions"
              (click)="sidebar.setOpenMobile(false)"
              ><ng-icon name="lucideMonitor" />{{ 'sessions' | t }}</a
            >
          }
        </hlm-dropdown-menu-group>
        <hlm-dropdown-menu-separator />
        <button hlmDropdownMenuItem (click)="logout()">
          <ng-icon name="lucideLogOut" />{{ 'signOut' | t }}
        </button>
      </hlm-dropdown-menu>
    </ng-template>
  `,
})
export class App {
  readonly features = inject(Features);
  readonly unread = inject(UnreadNotifications);
  readonly auth = inject(Auth);
  readonly theme = inject(Theme);
  readonly sidebar = inject(HlmSidebarService);
  private readonly router = inject(Router);
  private readonly breadcrumbs = inject(Breadcrumbs);
  private readonly i18n = inject(I18n);
  private readonly allAccountLinks = [
    { path: '/me', label: 'account', icon: 'lucideUserRound', requiresMfa: true },
    { path: '/security', label: 'security', icon: 'lucideShieldCheck' },
    { path: '/notifications', label: 'notificationCentre', icon: 'lucideBell', requiresMfa: true },
    { path: '/files', label: 'files', icon: 'lucideFolderOpen', requiresMfa: true },
    { path: '/privacy', label: 'privacyAndData', icon: 'lucideShieldCheck', requiresMfa: true },
  ];
  readonly accountLinks = computed(() =>
    this.allAccountLinks.filter(
      (item) =>
        (!item.requiresMfa || !this.auth.access()?.setupRequired) &&
        (item.path !== '/files' || this.features.enabled('files')),
    ),
  );
  readonly adminLinks = [
    { path: '/users', label: 'users', icon: 'lucideUsersRound', permission: 'users.read' },
    { path: '/audit', label: 'auditHistory', icon: 'lucideHistory', permission: 'settings.manage' },
    {
      path: '/operations',
      label: 'operations',
      icon: 'lucideActivity',
      permission: 'settings.manage',
    },
    {
      path: '/privacy-requests',
      label: 'privacyRequests',
      icon: 'lucideShieldCheck',
      permission: 'settings.manage',
    },
    {
      path: '/settings',
      label: 'adminSettings',
      icon: 'lucideSettings2',
      permission: 'settings.manage',
    },
  ];
  private previousPath = '';
  constructor() {
    const actor = computed(() =>
      this.auth.access()?.setupRequired ? null : this.auth.access()?.userId,
    );
    effect(() => {
      if (actor()) untracked(() => void this.features.load());
    });
    effect(() => {
      const current = this.breadcrumbs.items().at(-1);
      document.title = current
        ? `${this.i18n.text(current.label)} | ${this.i18n.text('appBrand')}`
        : this.i18n.text('appBrand');
    });
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        if (path !== this.previousPath) setTimeout(() => document.getElementById('main')?.focus());
        this.previousPath = path;
      }
    });
  }
  async logout() {
    await this.auth.logout();
    this.sidebar.setOpenMobile(false);
    await this.router.navigateByUrl('/login');
  }
}

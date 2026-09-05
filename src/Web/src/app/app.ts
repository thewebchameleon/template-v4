import { Component, computed, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCommand,
  lucideUserRound,
  lucideUsersRound,
  lucideSettings2,
  lucideMonitor,
  lucideLogOut,
  lucideChevronsUpDown,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmBreadcrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { Auth } from './core/auth';
import { Translate } from './core/i18n';
import { Theme } from './core/theme';
import { Preferences } from './core/preferences';
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
    HlmBreadcrumbImports,
    HlmSeparatorImports,
    Preferences,
    Translate,
  ],
  providers: [
    provideIcons({
      lucideCommand,
      lucideUserRound,
      lucideUsersRound,
      lucideSettings2,
      lucideMonitor,
      lucideLogOut,
      lucideChevronsUpDown,
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
                <a hlmSidebarMenuButton size="lg" routerLink="/profile" closeMobileSidebarOnClick>
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
                @for (item of accountLinks; track item.path) {
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
            @if (auth.has('users.manage') || auth.has('settings.manage')) {
              <nav hlmSidebarGroup [attr.aria-label]="'administration' | t">
                <div hlmSidebarGroupLabel>{{ 'administration' | t }}</div>
                <ul hlmSidebarMenu>
                  @for (item of adminLinks; track item.path) {
                    @if (auth.has(item.permission)) {
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
            <div class="flex min-w-0 items-center gap-2">
              <button
                hlmSidebarTrigger
                [srOnlyText]="'toggleNavigation' | t"
                [attr.aria-label]="'toggleNavigation' | t"
              ></button>
              <hlm-separator orientation="vertical" class="header-separator" />
              <nav hlmBreadcrumb [attr.aria-label]="'breadcrumb' | t">
                <ol hlmBreadcrumbList>
                  <li hlmBreadcrumbItem>
                    <span hlmBreadcrumbPage>{{ pageTitle() | t }}</span>
                  </li>
                </ol>
              </nav>
            </div>
            <app-preferences />
          </header>
          <div class="app-content"><ng-container *ngTemplateOutlet="page" /></div>
        </main>
      </div>
    } @else {
      <main id="main" tabindex="-1"><ng-container *ngTemplateOutlet="page" /></main>
    }
    <hlm-toaster [theme]="theme.preference()" position="top-right" richColors closeButton />
    <ng-template #page>
      <router-outlet />
    </ng-template>
    <ng-template #accountMenu>
      <hlm-dropdown-menu>
        <hlm-dropdown-menu-group>
          <a hlmDropdownMenuItem routerLink="/profile" (click)="sidebar.setOpenMobile(false)"
            ><ng-icon name="lucideUserRound" />{{ 'profile' | t }}</a
          >
          <a hlmDropdownMenuItem routerLink="/sessions" (click)="sidebar.setOpenMobile(false)"
            ><ng-icon name="lucideMonitor" />{{ 'sessions' | t }}</a
          >
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
  readonly auth = inject(Auth);
  readonly theme = inject(Theme);
  readonly sidebar = inject(HlmSidebarService);
  private readonly router = inject(Router);
  readonly accountLinks = [
    { path: '/profile', label: 'profile', icon: 'lucideUserRound' },
    { path: '/sessions', label: 'sessions', icon: 'lucideMonitor' },
  ];
  readonly adminLinks = [
    { path: '/users', label: 'users', icon: 'lucideUsersRound', permission: 'users.manage' },
    {
      path: '/settings',
      label: 'adminSettings',
      icon: 'lucideSettings2',
      permission: 'settings.manage',
    },
  ];
  private readonly navigation = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
  );
  readonly pageTitle = computed(() => {
    this.navigation();
    return (
      [...this.accountLinks, ...this.adminLinks].find((item) =>
        this.router.url.startsWith(item.path),
      )?.label ?? 'account'
    );
  });
  async logout() {
    await this.auth.logout();
    this.sidebar.setOpenMobile(false);
    await this.router.navigateByUrl('/login');
  }
}

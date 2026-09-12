import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCommand,
  lucideLayoutDashboard,
  lucideUserRound,
  lucideUsersRound,
  lucideSettings,
  lucideSettings2,
  lucidePaintbrush,
  lucideMonitor,
  lucideLogOut,
  lucideBell,
  lucideFolderOpen,
  lucideHistory,
  lucideLifeBuoy,
  lucideActivity,
  lucideShieldCheck,
  lucideMoveHorizontal,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { AccountAvatar } from './shared/account-avatar';
import { HlmSeparatorImports } from '@spartan-ng/helm/separator';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { AdministrationNavigation } from './core/administration';
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
    AccountAvatar,
    HlmSeparatorImports,
    AppBreadcrumbs,
    HlmDrawerImports,
    HlmTooltip,
    Preferences,
    Translate,
    Confirmation,
    NotificationDrawer,
  ],
  providers: [
    provideIcons({
      lucideCommand,
      lucideLayoutDashboard,
      lucideUserRound,
      lucideUsersRound,
      lucideSettings,
      lucideSettings2,
      lucidePaintbrush,
      lucideMonitor,
      lucideLogOut,
      lucideBell,
      lucideFolderOpen,
      lucideHistory,
      lucideLifeBuoy,
      lucideActivity,
      lucideShieldCheck,
      lucideMoveHorizontal,
    }),
  ],
  template: `
    <a href="#main" class="skip-link">{{ 'skipContent' | t }}</a>
    @if (auth.access()) {
      <div
        hlmSidebarWrapper
        sidebarWidth="var(--app-sidebar-total-width)"
        sidebarWidthIcon="var(--app-sidebar-rail-width)"
      >
        <hlm-sidebar
          [mobileTitle]="'toggleNavigation' | t"
          variant="inset"
          collapsible="panel"
          sidebarWidthMobile="var(--app-sidebar-mobile-width)"
        >
          @if (!sidebar.isMobile()) {
            <div class="sidebar-destination-rail" data-slot="sidebar-destination-rail">
              <a
                hlmBtn
                variant="ghost"
                size="icon"
                [routerLink]="auth.landing()"
                [attr.aria-label]="'appBrand' | t"
                [hlmTooltip]="'appBrand' | t"
                position="right"
              >
                <span class="brand-mark"><ng-icon name="lucideCommand" size="1.5rem" /></span>
              </a>
              <nav class="sidebar-rail-links" [attr.aria-label]="'destinationNavigation' | t">
                <div class="sidebar-rail-items" [style.--rail-active-index]="activeRailIndex()">
                  @if (activeRailIndex() >= 0) {
                    <span class="sidebar-rail-indicator" aria-hidden="true"></span>
                  }
                  @for (item of railLinks(); track item.path) {
                    @if (item.hasPanel) {
                      <button
                        hlmBtn
                        type="button"
                        variant="ghost"
                        size="icon"
                        [attr.data-active]="railPanelActive(item.path)"
                        [attr.aria-expanded]="railPanelActive(item.path) && sidebar.open()"
                        aria-controls="sidebar-label-panel"
                        [attr.aria-label]="item.label | t"
                        [hlmTooltip]="item.label | t"
                        position="right"
                        (click)="selectRailPanel(item.path)"
                      >
                        <ng-icon [name]="item.icon" size="1.5rem" />
                      </button>
                    } @else {
                      <a
                        hlmBtn
                        variant="ghost"
                        size="icon"
                        [routerLink]="item.path"
                        routerLinkActive
                        #railActive="routerLinkActive"
                        ariaCurrentWhenActive="page"
                        [attr.data-active]="railActive.isActive"
                        [attr.aria-label]="item.label | t"
                        [hlmTooltip]="item.label | t"
                        position="right"
                        (click)="selectRailDestination($event)"
                      >
                        <ng-icon [name]="item.icon" size="1.5rem" />
                      </a>
                    }
                  }
                </div>
              </nav>
              <button
                hlmBtn
                variant="ghost"
                size="icon"
                [attr.aria-label]="'accountSettings' | t"
                [hlmTooltip]="'accountSettings' | t"
                position="right"
                [attr.aria-expanded]="accountPanelActive() && sidebar.open()"
                aria-controls="sidebar-label-panel"
                [attr.data-active]="accountPanelActive()"
                (click)="selectAccountPanel()"
              >
                <app-account-avatar />
              </button>
            </div>
          }
          <div
            id="sidebar-label-panel"
            class="sidebar-label-panel"
            [attr.inert]="!sidebar.isMobile() && !sidebar.open() ? '' : null"
            [attr.aria-hidden]="!sidebar.isMobile() && !sidebar.open() ? 'true' : null"
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
              @if (sidebar.isMobile()) {
                <nav hlmSidebarGroup [attr.aria-label]="'destinationNavigation' | t">
                  <ul hlmSidebarMenu>
                    @for (item of railLinks(); track item.path) {
                      <li hlmSidebarMenuItem>
                        <a hlmSidebarMenuButton [routerLink]="item.path" closeMobileSidebarOnClick
                          ><ng-icon [name]="item.icon" /><span>{{ item.label | t }}</span></a
                        >
                      </li>
                    }
                  </ul>
                </nav>
              }
              @if (sidebar.isMobile() || accountPanelActive()) {
                <nav
                  hlmSidebarGroup
                  class="sidebar-submenu"
                  [attr.aria-label]="'accountNavigation' | t"
                >
                  <div hlmSidebarGroupLabel>{{ 'accountNavigation' | t }}</div>
                  <ul hlmSidebarMenu>
                    @for (item of accountMenuLinks(); track item.path) {
                      <li hlmSidebarMenuItem>
                        <a
                          hlmSidebarMenuButton
                          [routerLink]="item.path"
                          routerLinkActive
                          [routerLinkActiveOptions]="{
                            paths: item.path === '/security' ? 'exact' : 'subset',
                            queryParams: 'ignored',
                            matrixParams: 'ignored',
                            fragment: 'ignored',
                          }"
                          #active="routerLinkActive"
                          [isActive]="active.isActive"
                          ariaCurrentWhenActive="page"
                          closeMobileSidebarOnClick
                        >
                          <ng-icon [name]="item.icon" /><span>{{ item.label | t }}</span>
                        </a>
                      </li>
                    }
                    <li hlmSidebarMenuItem>
                      <button hlmSidebarMenuButton type="button" (click)="openThemeDrawer()">
                        <ng-icon name="lucideSettings2" aria-hidden="true" /><span>{{
                          'themeAccessibility' | t
                        }}</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              }
              @if (
                availableAdminLinks().length && (sidebar.isMobile() || administrationPanelActive())
              ) {
                <nav
                  hlmSidebarGroup
                  class="sidebar-submenu gap-4"
                  [attr.aria-label]="'administration' | t"
                >
                  @for (section of administrationSections(); track section.label) {
                    <div role="group" [attr.aria-labelledby]="'admin-section-' + section.label">
                      <div hlmSidebarGroupLabel [id]="'admin-section-' + section.label">
                        {{ section.label | t }}
                      </div>
                      <ul hlmSidebarMenu>
                        @for (item of section.links; track item.path) {
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
                      </ul>
                    </div>
                  }
                </nav>
              }
            </div>
          </div>
          @if (hasSecondaryNavigation()) {
            <button
              hlmSidebarRail
              aria-controls="sidebar-label-panel"
              [attr.aria-label]="'resizeNavigation' | t"
              aria-describedby="sidebar-resize-help"
            >
              <span class="sidebar-resize-affordance" aria-hidden="true">
                <span class="sidebar-resize-guide"></span>
                <ng-icon class="sidebar-resize-icon" name="lucideMoveHorizontal" size="2rem" />
                <span class="sidebar-resize-tooltip">{{ 'dragToResize' | t }}</span>
              </span>
              <span id="sidebar-resize-help" class="sr-only">{{ 'resizeNavigationHelp' | t }}</span>
            </button>
          }
        </hlm-sidebar>
        <main hlmSidebarInset id="main" tabindex="-1" class="min-w-0">
          <header class="app-header">
            <div class="flex min-w-0 flex-1 items-center gap-2">
              @if (sidebar.isMobile() || hasSecondaryNavigation()) {
                <button
                  hlmSidebarTrigger
                  [srOnlyText]="'toggleNavigation' | t"
                  [attr.aria-label]="'toggleNavigation' | t"
                ></button>
                <hlm-separator
                  orientation="vertical"
                  class="header-separator data-vertical:self-center"
                />
              }
              <app-breadcrumbs />
            </div>
            @if (!auth.access()?.setupRequired) {
              @defer (on immediate) {
                <app-notification-drawer />
              } @placeholder {
                <span class="size-10 shrink-0" aria-hidden="true"></span>
              }
            }
            <hlm-drawer
              direction="right"
              [state]="themeDrawerOpen() ? 'open' : 'closed'"
              (stateChanged)="themeDrawerOpen.set($event === 'open')"
            >
              <button
                hlmBtn
                hlmDrawerTrigger
                size="icon"
                variant="ghost"
                [attr.aria-label]="'openThemeDrawer' | t"
                [hlmTooltip]="'themeDrawer' | t"
                position="bottom"
              >
                <ng-icon name="lucidePaintbrush" />
              </button>
              <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
                <hlm-drawer-header>
                  <h2 hlmDrawerTitle>{{ 'themeDrawer' | t }}</h2>
                  <p hlmDrawerDescription>{{ 'themeDrawerDescription' | t }}</p>
                </hlm-drawer-header>
                <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
                  <app-preferences #preferences [expanded]="true" />
                </div>
                <hlm-drawer-footer>
                  <button
                    hlmBtn
                    type="button"
                    variant="warning"
                    [disabled]="preferences.resetting()"
                    (click)="preferences.reset()"
                  >
                    {{ 'resetSettings' | t }}
                  </button>
                </hlm-drawer-footer>
              </hlm-drawer-content>
            </hlm-drawer>
            <button
              hlmBtn
              type="button"
              variant="destructive"
              class="ml-auto shrink-0"
              (click)="logout()"
            >
              <ng-icon name="lucideLogOut" aria-hidden="true" />{{ 'signOut' | t }}
            </button>
          </header>
          <div class="app-content" [class.app-content-enter-alternate]="alternatePageEntrance()">
            <ng-container *ngTemplateOutlet="page" />
          </div>
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
  `,
})
export class App {
  readonly themeDrawerOpen = signal(false);
  readonly accountMenuLinks = computed(() =>
    [
      { path: '/me', label: 'accountMenuProfile', icon: 'lucideUserRound', requiresMfa: true },
      { path: '/security', label: 'security', icon: 'lucideShieldCheck' },
      {
        path: '/security/sessions',
        label: 'accountMenuSessions',
        icon: 'lucideMonitor',
        requiresMfa: true,
      },
      {
        path: '/notifications',
        label: 'notificationCentre',
        icon: 'lucideBell',
        requiresMfa: true,
      },
      { path: '/privacy', label: 'privacyAndData', icon: 'lucideShieldCheck', requiresMfa: true },
    ].filter((item) => !item.requiresMfa || !this.auth.access()?.setupRequired),
  );

  openThemeDrawer(): void {
    this.sidebar.setOpenMobile(false);
    // Let the mobile sheet restore focus before opening the drawer focus trap.
    setTimeout(() => this.themeDrawerOpen.set(true));
  }

  readonly features = inject(Features);
  readonly unread = inject(UnreadNotifications);
  readonly auth = inject(Auth);
  readonly theme = inject(Theme);
  readonly sidebar = inject(HlmSidebarService);
  private readonly router = inject(Router);
  private readonly navigationEnd = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
  );
  private readonly breadcrumbs = inject(Breadcrumbs);
  private readonly i18n = inject(I18n);
  private readonly dashboardLink = {
    path: '/dashboard',
    label: 'dashboard',
    icon: 'lucideLayoutDashboard',
    requiresMfa: true,
  };
  readonly selectedPanel = signal<string | null>(null);
  readonly accountPanelActive = computed(() => {
    this.navigationEnd();
    const selectedPanel = this.selectedPanel();
    return (
      selectedPanel === 'account' ||
      (selectedPanel === null &&
        this.accountMenuLinks().some((item) =>
          this.router.isActive(item.path, {
            paths: 'subset',
            queryParams: 'ignored',
            matrixParams: 'ignored',
            fragment: 'ignored',
          }),
        ))
    );
  });

  selectAccountPanel(): void {
    this.selectedPanel.set('account');
    this.sidebar.setPanelAvailable(true);
    this.sidebar.openPanel();
  }
  private readonly administration = inject(AdministrationNavigation);
  readonly availableAdminLinks = this.administration.links;
  readonly administrationSections = computed(() =>
    [
      {
        label: 'administration',
        links: this.availableAdminLinks().filter((item) => item.section === 'administration'),
      },
      {
        label: 'modules',
        links: this.availableAdminLinks().filter((item) => item.section === 'modules'),
      },
    ].filter((section) => section.links.length),
  );
  private previousPath = '';
  readonly alternatePageEntrance = signal(false);
  readonly administrationActive = computed(() => {
    this.navigationEnd();
    return this.router.isActive('/administration', {
      paths: 'subset',
      queryParams: 'ignored',
      matrixParams: 'ignored',
      fragment: 'ignored',
    });
  });
  readonly administrationPanelActive = computed(() => {
    const selectedPanel = this.selectedPanel();
    return (
      selectedPanel === '/administration' || (selectedPanel === null && this.administrationActive())
    );
  });
  readonly railLinks = computed(() => [
    ...(!this.auth.access()?.setupRequired ? [{ ...this.dashboardLink, hasPanel: false }] : []),
    ...(!this.auth.access()?.setupRequired && this.features.moduleEnabled('organizations')
      ? [
          {
            path: '/organizations',
            label: 'organizations',
            icon: 'lucideUsersRound',
            hasPanel: false,
          },
        ]
      : []),
    ...(!this.auth.access()?.setupRequired && this.features.moduleEnabled('support')
      ? [{ path: '/support', label: 'support', icon: 'lucideLifeBuoy', hasPanel: false }]
      : []),
    ...(!this.auth.access()?.setupRequired && this.features.enabled('files')
      ? [{ path: '/files', label: 'files', icon: 'lucideFolderOpen', hasPanel: false }]
      : []),
    ...(this.availableAdminLinks().length
      ? [
          {
            path: '/administration',
            label: 'administration',
            icon: 'lucideSettings',
            hasPanel: true,
          },
        ]
      : []),
  ]);
  readonly activeRailIndex = computed(() => {
    this.navigationEnd();
    if (this.accountPanelActive()) return -1;
    const selectedPanel = this.selectedPanel();
    if (selectedPanel) return this.railLinks().findIndex((item) => item.path === selectedPanel);
    return this.railLinks().findIndex((item) =>
      this.router.isActive(item.path, {
        paths: 'subset',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored',
      }),
    );
  });

  readonly hasSecondaryNavigation = computed(
    () => this.accountPanelActive() || this.administrationPanelActive(),
  );

  railPanelActive(path: string): boolean {
    this.navigationEnd();
    const selectedPanel = this.selectedPanel();
    return (
      selectedPanel === path ||
      (selectedPanel === null &&
        this.router.isActive(path, {
          paths: 'subset',
          queryParams: 'ignored',
          matrixParams: 'ignored',
          fragment: 'ignored',
        }))
    );
  }

  private routeDestination(path: string): string {
    if (
      this.accountMenuLinks().some((item) => path === item.path || path.startsWith(`${item.path}/`))
    )
      return 'account';
    return (
      this.railLinks().find((item) => path === item.path || path.startsWith(`${item.path}/`))
        ?.path ?? path
    );
  }

  selectRailPanel(path: string): void {
    this.selectedPanel.set(path);
    this.sidebar.setPanelAvailable(true);
    this.sidebar.openPanel();
  }

  selectRailDestination(event: MouseEvent): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    this.selectedPanel.set(null);
  }
  constructor() {
    effect(() => this.sidebar.setPanelAvailable(this.hasSecondaryNavigation()));
    const actor = computed(() =>
      this.auth.access()?.setupRequired ? null : this.auth.access()?.userId,
    );
    effect(() => {
      untracked(() => this.features.reset());
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
        if (actor()) void this.features.load();
        const path = event.urlAfterRedirects.split(/[?#]/)[0];
        if (path !== this.previousPath) {
          this.selectedPanel.set(null);
          if (this.previousPath === '/dashboard' && path !== '/dashboard') this.sidebar.openPanel();
          if (this.routeDestination(path) !== this.routeDestination(this.previousPath)) {
            this.alternatePageEntrance.update((alternate) => !alternate);
          }
          setTimeout(() => document.getElementById('main')?.focus());
        }
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

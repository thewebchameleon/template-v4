import { FOUNDATION_FEATURES } from './core/feature-extensions';
import { runtimeConfigurableModuleIds } from './core/capability-ids';
import {
  workspaceDestinations,
  organisationDestinations,
  activeDestinationIndex,
  destinationAvailable,
  Destination,
  supportDestinations,
  userManagementDestinations,
} from './core/destinations';
import { FileStorageTree } from './features/file-storage/files/file-storage-components';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NgTemplateOutlet } from '@angular/common';
import { NavigationEnd, RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCommand,
  lucideContactRound,
  lucideFileSpreadsheet,
  lucideCar,
  lucideLayoutDashboard,
  lucideUserRound,
  lucideUsersRound,
  lucideSettings,
  lucideSettings2,
  lucideNewspaper,
  lucidePalette,
  lucideMonitor,
  lucideLogOut,
  lucideBell,
  lucideFolderOpen,
  lucideHistory,
  lucideClock3,
  lucideLifeBuoy,
  lucideMail,
  lucideActivity,
  lucideShieldCheck,
  lucideMoveHorizontal,
  lucideAccessibility,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmToasterImports } from '@spartan-ng/helm/sonner';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
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
import { UnreadNotifications } from './features/notifications/unread-notifications';
import { NotificationDrawer } from './features/notifications/notification-drawer';
import { PlatformAppearanceTheme } from './core/platform-appearance';

type RailLink = Destination & {
  destination: string | null;
  destinationQueryParams: Record<string, string> | null;
  runtimeConfigurable?: boolean;
};
const runtimeConfigurableModules = new Set<string>(runtimeConfigurableModuleIds);
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
    HlmSeparatorImports,
    AppBreadcrumbs,
    HlmDrawerImports,
    HlmTooltip,
    Preferences,
    FileStorageTree,
    Translate,
    Confirmation,
    NotificationDrawer,
  ],
  providers: [
    provideIcons({
      lucideCommand,
      lucideContactRound,
      lucideFileSpreadsheet,
      lucideCar,
      lucideLayoutDashboard,
      lucideUserRound,
      lucideUsersRound,
      lucideSettings,
      lucideSettings2,
      lucideNewspaper,
      lucidePalette,
      lucideMonitor,
      lucideLogOut,
      lucideBell,
      lucideFolderOpen,
      lucideHistory,
      lucideClock3,
      lucideLifeBuoy,
      lucideMail,
      lucideActivity,
      lucideShieldCheck,
      lucideMoveHorizontal,
      lucideAccessibility,
    }),
  ],
  template: `
    <a href="#main" class="skip-link">{{ 'skipContent' | t }}</a>
    @if (auth.access() && !fullPageSetup()) {
      <div
        hlmSidebarWrapper
        sidebarWidth="var(--app-sidebar-total-width)"
        sidebarWidthIcon="var(--app-sidebar-rail-width)"
      >
        <hlm-sidebar
          role="complementary"
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
                class="sidebar-rail-brand"
                [routerLink]="auth.landing()"
                [attr.aria-label]="appearance.organisationName()"
                [hlmTooltip]="appearance.organisationName()"
                position="right"
              >
                <span class="brand-mark">
                  @if (appearance.organisationLogoUrl(); as logo) {
                    <img [src]="logo" alt="" />
                  } @else {
                    <ng-icon name="lucideCommand" size="1.5rem" />
                  }
                </span>
              </a>
              <nav class="sidebar-rail-links" [attr.aria-label]="'destinationNavigation' | t">
                <div
                  class="sidebar-rail-items"
                  [style.--rail-active-index]="activeRailIndex()"
                  [style.--rail-active-separator-offset]="
                    activeRailUsesModuleSeparator()
                      ? 'calc(var(--sidebar-rail-separator-height) + var(--app-sidebar-rail-gap))'
                      : '0px'
                  "
                >
                  @if (activeRailIndex() >= 0) {
                    <span class="sidebar-rail-indicator" aria-hidden="true"></span>
                  }
                  @for (item of railLinks(); track item.path; let index = $index) {
                    @if (index === railModuleStartIndex()) {
                      <hlm-separator class="sidebar-rail-module-separator" decorative="true" />
                    }
                    @if (item.hasPanel) {
                      <a
                        hlmBtn
                        variant="ghost"
                        size="icon"
                        [routerLink]="item.destination"
                        [queryParams]="item.destinationQueryParams"
                        [attr.data-active]="railPanelActive(item.path)"
                        [attr.aria-expanded]="railPanelActive(item.path) && sidebar.open()"
                        aria-controls="sidebar-label-panel"
                        [attr.aria-label]="item.label | t"
                        [hlmTooltip]="item.label | t"
                        position="right"
                        (click)="selectRailPanel($event, item.path)"
                      >
                        <ng-icon [name]="item.icon" size="1.5rem" />
                      </a>
                    } @else {
                      <a
                        hlmBtn
                        variant="ghost"
                        size="icon"
                        [routerLink]="item.destination"
                        [queryParams]="item.destinationQueryParams"
                        [attr.aria-current]="activeRailIndex() === index ? 'page' : null"
                        [attr.data-active]="activeRailIndex() === index"
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
              <a
                hlmBtn
                variant="ghost"
                size="icon"
                [routerLink]="administrationDestination()"
                [attr.aria-label]="'administration' | t"
                [hlmTooltip]="'administration' | t"
                position="right"
                [attr.aria-expanded]="administrationPanelActive() && sidebar.open()"
                aria-controls="sidebar-label-panel"
                [attr.data-active]="administrationPanelActive()"
                (click)="selectRailPanel($event, '/administration')"
              >
                <ng-icon name="lucideSettings" size="1.5rem" />
              </a>
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
                    <span class="brand-mark">
                      @if (appearance.organisationLogoUrl(); as logo) {
                        <img [src]="logo" alt="" />
                      } @else {
                        <ng-icon name="lucideCommand" />
                      }
                    </span>
                    <span class="brand-copy"
                      ><span>{{ appearance.organisationName() }}</span
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
                    @for (item of mobileRailLinks(); track item.path) {
                      <li hlmSidebarMenuItem>
                        <a
                          hlmSidebarMenuButton
                          [routerLink]="item.destination"
                          [queryParams]="item.destinationQueryParams"
                          closeMobileSidebarOnClick
                          ><ng-icon [name]="item.icon" /><span>{{ item.label | t }}</span></a
                        >
                      </li>
                    }
                  </ul>
                </nav>
              }
              @if (
                features.enabled('file-storage') && (sidebar.isMobile() || fileStoragePanelActive())
              ) {
                @defer (on immediate) {
                  <app-file-storage-tree />
                }
              }
              @for (panel of navigationPanels(); track panel.label) {
                @if (panel.links.length && (sidebar.isMobile() || panel.active)) {
                  <nav hlmSidebarGroup class="sidebar-submenu" [attr.aria-label]="panel.label | t">
                    <div hlmSidebarGroupLabel>{{ panel.label | t }}</div>
                    <ul hlmSidebarMenu>
                      @for (item of panel.links; track item.path; let itemIndex = $index) {
                        <li
                          hlmSidebarMenuItem
                          animate.enter="sidebar-item-enter"
                          [style.--sidebar-item-index]="itemIndex"
                        >
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
                  </nav>
                }
              }
              @if (sidebar.isMobile() || administrationPanelActive()) {
                <nav
                  hlmSidebarGroup
                  class="sidebar-submenu gap-4"
                  [attr.aria-label]="'administration' | t"
                >
                  <div role="group" aria-labelledby="admin-section-account">
                    <div hlmSidebarGroupLabel id="admin-section-account">
                      {{ 'accountNavigation' | t }}
                    </div>
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
                          <ng-icon
                            name="lucideAccessibility"
                            size="1.25rem"
                            aria-hidden="true"
                          /><span>{{ 'themeAccessibility' | t }}</span>
                        </button>
                      </li>
                    </ul>
                  </div>
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
        <main hlmSidebarInset id="main" tabindex="-1" class="min-w-0 outline-none">
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
                <ng-icon name="lucideAccessibility" size="1.25rem" />
              </button>
              <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
                <hlm-drawer-header>
                  <h2 hlmDrawerTitle>{{ 'themeDrawer' | t }}</h2>
                  <p hlmDrawerDescription>{{ 'themeDrawerDescription' | t }}</p>
                </hlm-drawer-header>
                @defer (when themeDrawerOpen()) {
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
                } @placeholder {
                  <div hlmDrawerBody role="status">{{ 'loading' | t }}</div>
                }
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
      <main id="main" tabindex="-1" class="outline-none">
        <ng-container *ngTemplateOutlet="page" />
      </main>
    }
    <hlm-toaster [theme]="theme.preference()" position="top-center" richColors />
    <app-confirmation />
    <ng-template #page>
      <router-outlet />
    </ng-template>
  `,
})
export class App {
  readonly extensions = inject(FOUNDATION_FEATURES);
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
        path: '/action-items',
        label: 'actionItems',
        icon: 'lucideBell',
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
  readonly appearance = inject(PlatformAppearanceTheme);
  readonly sidebar = inject(HlmSidebarService);
  private readonly router = inject(Router);
  private readonly navigationEnd = toSignal(
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
  );
  readonly fullPageSetup = computed(() => {
    this.navigationEnd();
    return ['/administration/website', '/login/setup'].includes(this.router.url.split(/[?#]/)[0]);
  });
  private readonly breadcrumbs = inject(Breadcrumbs);
  private readonly i18n = inject(I18n);
  private readonly dashboardLink = {
    path: '/dashboard',
    label: 'dashboard',
    icon: 'lucideLayoutDashboard',
    requiresMfa: true,
  };
  readonly selectedPanel = signal<string | null>(null);
  readonly accountRouteActive = computed(() => {
    this.navigationEnd();
    const path = this.router.url.split(/[?#]/)[0];
    return this.accountMenuLinks().some(
      (item) => path === item.path || path.startsWith(`${item.path}/`),
    );
  });
  private readonly administration = inject(AdministrationNavigation);
  readonly availableAdminLinks = this.administration.links;
  readonly supportLinks = computed(() =>
    Object.values(supportDestinations).filter((item) =>
      destinationAvailable(item, this.auth, this.features),
    ),
  );
  readonly supportModuleEnabled = computed(() => this.features.enabled('support'));
  readonly userManagementLinks = computed(() =>
    Object.values(userManagementDestinations).filter((item) =>
      destinationAvailable(item, this.auth, this.features),
    ),
  );
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
  readonly administrationDestination = computed(() => this.accountMenuLinks()[0].path);
  private previousPath = '';
  readonly alternatePageEntrance = signal(false);
  readonly administrationActive = computed(() => {
    this.navigationEnd();
    return (
      this.accountRouteActive() ||
      this.router.isActive('/administration', {
        paths: 'subset',
        queryParams: 'ignored',
        matrixParams: 'ignored',
        fragment: 'ignored',
      })
    );
  });
  readonly administrationPanelActive = computed(() => {
    const selectedPanel = this.selectedPanel();
    return (
      selectedPanel === '/administration' ||
      (selectedPanel === null && this.administrationActive() && !this.supportRouteActive())
    );
  });
  readonly supportRouteActive = computed(() => {
    this.navigationEnd();
    const path = this.router.url.split(/[?#]/)[0];
    return this.supportLinks().some(
      (item) => path === item.path || path.startsWith(`${item.path}/`),
    );
  });
  readonly supportPanelActive = computed(() => {
    const selectedPanel = this.selectedPanel();
    return selectedPanel === '/support' || (selectedPanel === null && this.supportRouteActive());
  });
  readonly userManagementPanelActive = computed(() => this.railPanelActive('/user-management'));
  readonly navigationPanels = computed(() => [
    { label: 'support', links: this.supportLinks(), active: this.supportPanelActive() },
    {
      label: 'userManagement',
      links: this.userManagementLinks(),
      active: this.userManagementPanelActive(),
    },
  ]);
  readonly organisationRailLinks = computed<RailLink[]>(() => {
    this.navigationEnd();
    return [
      ...organisationDestinations,
      ...this.extensions.flatMap((feature) =>
        (feature.organisationDestinations ?? []).map((item) => ({
          ...item,
          runtimeConfigurable: true,
        })),
      ),
    ].map((item) => ({
      ...item,
      path: `/organisation/${item.path}`,
      destination: `/organisation/${item.path}`,
      destinationQueryParams: null,
      activePath: `/organisation/${item.activePath ?? item.path}`,
      hasPanel: false,
    }));
  });
  readonly destinationRailLinks = computed<RailLink[]>(() =>
    [
      ...Object.values(workspaceDestinations).filter(
        (item) =>
          item.path !== workspaceDestinations.organisations.path &&
          item.path !== workspaceDestinations.support.path,
      ),
      ...this.organisationRailLinks(),
      ...this.extensions.flatMap((feature) =>
        (feature.destinations ?? [])
          .filter((item) => !item.section)
          .map((item) => ({ ...item, runtimeConfigurable: true })),
      ),
    ]
      .filter((item) => destinationAvailable(item, this.auth, this.features))
      .map((item) => {
        const railItem = item as Destination & Partial<RailLink>;
        return {
          ...item,
          destination: railItem.destination ?? item.path,
          destinationQueryParams:
            railItem.destinationQueryParams ??
            (item.capability === 'file-storage' ? { group: 'file-storage' } : null),
        };
      }),
  );
  readonly moduleRailLinks = computed(() => [
    ...this.destinationRailLinks().filter(
      (item) =>
        item.runtimeConfigurable ||
        (!!item.capability && runtimeConfigurableModules.has(item.capability)),
    ),
    ...(this.supportModuleEnabled()
      ? [
          {
            path: '/support',
            label: 'support',
            icon: 'lucideLifeBuoy',
            capability: 'support',
            hasPanel: this.supportLinks().length > 0,
            destination: this.supportLinks()[0]?.path ?? null,
            destinationQueryParams: null,
            runtimeConfigurable: true,
          },
        ]
      : []),
  ]);
  readonly primaryDestinationRailLinks = computed(() =>
    this.destinationRailLinks().filter(
      (item) =>
        !item.runtimeConfigurable &&
        (!item.capability || !runtimeConfigurableModules.has(item.capability)),
    ),
  );
  readonly railLinks = computed<RailLink[]>(() => [
    ...(!this.auth.access()?.setupRequired
      ? [
          {
            ...this.dashboardLink,
            hasPanel: false,
            destination: this.dashboardLink.path,
            destinationQueryParams: null,
          },
        ]
      : []),
    ...this.primaryDestinationRailLinks(),
    ...(this.userManagementLinks().length
      ? [
          {
            path: '/user-management',
            label: 'userManagement',
            icon: 'lucideUserRound',
            hasPanel: true,
            destination: this.userManagementLinks()[0]?.path ?? '/user-management',
            destinationQueryParams: null,
          },
        ]
      : []),
    ...this.moduleRailLinks(),
  ]);
  readonly mobileRailLinks = computed<RailLink[]>(() => [
    ...this.railLinks(),
    {
      path: '/administration',
      label: 'administration',
      icon: 'lucideSettings',
      hasPanel: true,
      destination: this.administrationDestination(),
      destinationQueryParams: null,
    },
  ]);
  readonly railModuleStartIndex = computed(() => {
    if (!this.moduleRailLinks().length || this.railLinks().length === this.moduleRailLinks().length)
      return -1;
    return this.railLinks().length - this.moduleRailLinks().length;
  });
  readonly activeRailIndex = computed(() => {
    this.navigationEnd();
    const selectedPanel = this.selectedPanel();
    if (selectedPanel) return this.railLinks().findIndex((item) => item.path === selectedPanel);
    if (this.supportRouteActive())
      return this.railLinks().findIndex((item) => item.path === '/support');
    return activeDestinationIndex(this.railLinks(), this.router.url.split(/[?#]/)[0]);
  });
  readonly activeRailUsesModuleSeparator = computed(
    () => this.railModuleStartIndex() >= 0 && this.activeRailIndex() >= this.railModuleStartIndex(),
  );

  readonly fileStoragePanelActive = computed(() => this.railPanelActive('/file-storage'));
  readonly hasSecondaryNavigation = computed(
    () =>
      this.supportPanelActive() ||
      this.userManagementPanelActive() ||
      this.administrationPanelActive() ||
      this.fileStoragePanelActive(),
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
      return '/administration';
    if (this.supportLinks().some((item) => path === item.path || path.startsWith(`${item.path}/`)))
      return '/support';
    const railDestination = this.railLinks()[activeDestinationIndex(this.railLinks(), path)];
    if (railDestination) return railDestination.path;
    return path;
  }

  selectRailPanel(event: MouseEvent, path: string): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
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
        ? `${this.i18n.text(current.label)} | ${this.appearance.organisationName()}`
        : this.appearance.organisationName();
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

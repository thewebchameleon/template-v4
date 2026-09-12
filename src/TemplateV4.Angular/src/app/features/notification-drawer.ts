import { Component, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { HlmDrawer, HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { NotificationItem, NotificationPage } from '../api/models';
import { Auth } from '../core/auth';
import { I18n } from '../core/i18n';
import { UnreadNotifications } from '../core/unread-notifications';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi, workspaceIcons } from '../shared/workspace';

@Component({
  selector: 'app-notification-drawer',
  imports: [WorkspaceUi, HlmDrawerImports, HlmTooltip],
  providers: [workspaceIcons],
  styles: `
    .notification-drawer-scroll {
      scrollbar-color: color-mix(in srgb, var(--muted-foreground) 45%, transparent) transparent;
      scrollbar-width: thin;
    }

    .notification-drawer-scroll::-webkit-scrollbar {
      width: 0.375rem;
    }

    .notification-drawer-scroll::-webkit-scrollbar-track {
      background: transparent;
    }

    .notification-drawer-scroll::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--muted-foreground) 45%, transparent);
      border-radius: 9999px;
    }

    .notification-drawer-scroll::-webkit-scrollbar-thumb:hover {
      background: color-mix(in srgb, var(--muted-foreground) 65%, transparent);
    }

    [data-notification-item] {
      transition:
        opacity 180ms cubic-bezier(0.4, 0, 1, 1),
        transform 180ms cubic-bezier(0.4, 0, 1, 1);
    }

    [data-notification-item].notification-dismiss {
      opacity: 0;
      transform: translateX(100%);
    }

    [data-notification-item].notification-collapse {
      height: 0 !important;
      padding-block: 0 !important;
      border-bottom-width: 0 !important;
      transition:
        height 180ms cubic-bezier(0, 0, 0.2, 1),
        padding-block 180ms cubic-bezier(0, 0, 0.2, 1),
        border-bottom-width 180ms cubic-bezier(0, 0, 0.2, 1);
    }
  `,
  template: `
    <hlm-drawer #drawer="hlmDrawer" direction="right">
      <button
        hlmBtn
        hlmDrawerTrigger
        size="icon"
        variant="ghost"
        class="relative"
        [attr.aria-label]="
          ('notificationCentre' | t) + ': ' + unread.count() + ' ' + ('unread' | t)
        "
        [hlmTooltip]="'notificationCentre' | t"
        position="bottom"
        (click)="load()"
      >
        <ng-icon name="lucideBell" />
        @if (unread.count()) {
          <span hlmBadge variant="notification" class="absolute -right-2 -top-2">
            {{ unread.count() > 99 ? '99+' : unread.count() }}
          </span>
        }
      </button>
      <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
        <hlm-drawer-header>
          <div class="flex items-center gap-2">
            <h2 hlmDrawerTitle>{{ 'notificationCentre' | t }}</h2>
            <span hlmBadge variant="secondary">
              {{ data.value()?.unread ?? unread.count() }} {{ 'unread' | t }}
            </span>
          </div>
          <p hlmDrawerDescription>{{ 'yourInboxHelp' | t }}</p>
        </hlm-drawer-header>

        <div
          hlmDrawerBody
          class="notification-drawer-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto group-data-[vaul-drawer-direction=right]/drawer-content:px-(--card-spacing) group-data-[vaul-drawer-direction=right]/drawer-content:pt-(--panel-inset)"
        >
          <app-page-state
            [state]="data.state()"
            [refreshing]="data.refreshing()"
            [refreshError]="data.refreshError()"
            (retry)="load()"
          >
            <ul aria-live="polite" class="-mx-(--card-spacing)">
              @for (item of data.value()?.page?.items ?? []; track item.id) {
                <li
                  class="workspace-notice px-(--panel-header-padding-inline)"
                  data-notification-item
                >
                  <div class="min-w-0 flex-1">
                    <a
                      class="inline-flex items-center gap-1 font-medium underline-offset-4 hover:underline focus-visible:underline"
                      [routerLink]="detailsRoute(item)"
                      (click)="open(item)"
                    >
                      <span>{{ item.kind | t }}</span>
                      <ng-icon name="lucideArrowUpRight" />
                    </a>
                    <p class="workspace-meta mt-1">{{ item.kind + 'Help' | t }}</p>
                    <div class="mt-2 flex items-start gap-3">
                      <p class="workspace-meta">{{ i18n.date(item.createdAt) }}</p>
                      <button
                        hlmBtn
                        type="button"
                        variant="link"
                        size="text"
                        class="shrink-0"
                        [disabled]="busy()"
                        (click)="read(item, $event)"
                      >
                        {{ 'markRead' | t }}
                      </button>
                    </div>
                  </div>
                </li>
              } @empty {
                <div hlmEmpty>
                  <div hlmEmptyHeader>
                    <div hlmEmptyMedia variant="icon"><ng-icon name="lucideInbox" /></div>
                    <h3 hlmEmptyTitle>{{ 'inboxEmpty' | t }}</h3>
                    <p hlmEmptyDescription>{{ 'inboxEmptyHelp' | t }}</p>
                  </div>
                </div>
              }
            </ul>
          </app-page-state>
        </div>

        <hlm-drawer-footer>
          <button hlmBtn [disabled]="busy() || !data.value()?.unread" (click)="readAll()">
            <ng-icon name="lucideCheck" />{{ 'markAllRead' | t }}
          </button>
          <button hlmBtn variant="outline" (click)="viewAll()">
            {{ 'viewAllNotifications' | t }}
          </button>
        </hlm-drawer-footer>
      </hlm-drawer-content>
    </hlm-drawer>
  `,
})
export class NotificationDrawer {
  readonly api = inject(WorkspaceApi);
  readonly auth = inject(Auth);
  readonly i18n = inject(I18n);
  readonly unread = inject(UnreadNotifications);
  readonly router = inject(Router);
  readonly data = new Resource<NotificationPage>();
  readonly busy = signal(false);
  private readonly drawer = viewChild.required(HlmDrawer);
  private loaded = false;

  constructor() {
    this.unread.changes.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.loaded && !this.busy()) void this.load();
    });
  }

  async load() {
    this.loaded = true;
    const loaded = await this.data.load((signal) =>
      this.api.get('notifications', { pageNumber: 1, unreadOnly: true }, signal),
    );
    if (loaded) this.unread.set(this.data.value()!.unread);
  }

  private applyRead(id?: string) {
    this.data.value.update((value) => {
      if (!value) return value;
      const changed = id
        ? value.page.items.filter((item) => item.id === id && !item.readAt).length
        : value.unread;
      const unread = Math.max(0, value.unread - changed);
      this.unread.set(unread);
      return {
        ...value,
        unread,
        page: {
          ...value.page,
          total: id ? Math.max(0, value.page.total - changed) : 0,
          items: id ? value.page.items.filter((item) => item.id !== id) : [],
        },
      };
    });
  }

  async read(item: NotificationItem, event: MouseEvent) {
    if (this.busy() || item.readAt) return;
    const element = (event.currentTarget as HTMLElement).closest<HTMLElement>('li');
    this.busy.set(true);
    try {
      await this.api.post('notifications/read?id=' + encodeURIComponent(item.id));
      await this.animateDismiss(element);
      this.applyRead(item.id);
    } catch {
      /* Request errors are already reported centrally. */
    } finally {
      this.busy.set(false);
    }
  }

  private async animateDismiss(element: HTMLElement | null) {
    if (
      !element ||
      document.documentElement.dataset['motion'] === 'reduced' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;

    const height = element.getBoundingClientRect().height;
    const exitFinished = this.waitForTransition(element, 'transform');
    element.classList.add('notification-dismiss');
    await exitFinished;

    element.style.height = `${height}px`;
    element.style.overflow = 'hidden';
    element.style.boxSizing = 'border-box';
    void element.offsetHeight;
    const collapseFinished = this.waitForTransition(element, 'height');
    element.classList.add('notification-collapse');
    await collapseFinished;
  }

  private waitForTransition(element: HTMLElement, propertyName: string) {
    return new Promise<void>((resolve) => {
      const finish = () => {
        window.clearTimeout(timeout);
        element.removeEventListener('transitionend', onTransitionEnd);
        resolve();
      };
      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.target === element && event.propertyName === propertyName) finish();
      };
      const timeout = window.setTimeout(finish, 280);
      element.addEventListener('transitionend', onTransitionEnd);
    });
  }

  async readAll() {
    if (this.busy() || !this.data.value()?.unread) return;
    this.busy.set(true);
    try {
      await this.api.post('notifications/read');
      this.applyRead();
    } catch {
      /* Request errors are already reported centrally. */
    } finally {
      this.busy.set(false);
    }
  }

  detailsRoute(item: NotificationItem) {
    if (
      ![
        '/profile',
        '/security',
        '/privacy',
        '/operations',
        '/administration/system-health',
        '/me',
      ].includes(item.link)
    )
      return null;
    return item.link === '/profile'
      ? '/security'
      : item.link === '/operations'
        ? '/administration/system-health'
        : item.link;
  }

  open(item: NotificationItem) {
    if (!this.detailsRoute(item)) return;
    const actor = this.auth.access()?.userId;
    if (!item.readAt) {
      void this.api
        .post('notifications/read?id=' + encodeURIComponent(item.id))
        .then(() => {
          if (actor === this.auth.access()?.userId) this.applyRead(item.id);
        })
        .catch(() => {
          /* Request errors are already reported centrally. */
        });
    }
    this.drawer().close();
  }

  async viewAll() {
    this.drawer().close();
    await this.router.navigateByUrl('/notifications');
  }
}

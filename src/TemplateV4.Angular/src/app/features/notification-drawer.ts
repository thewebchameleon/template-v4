import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HlmDrawer, HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { NotificationItem, NotificationPage } from '../api/models';
import { Auth } from '../core/auth';
import { I18n } from '../core/i18n';
import { UnreadNotifications } from '../core/unread-notifications';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi, workspaceIcons } from '../shared/workspace';

@Component({
  selector: 'app-notification-drawer',
  imports: [WorkspaceUi, HlmDrawerImports],
  providers: [workspaceIcons],
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

        <div class="min-h-0 flex-1 overflow-y-auto px-4">
          <app-page-state
            [state]="data.state()"
            [refreshing]="data.refreshing()"
            [refreshError]="data.refreshError()"
            (retry)="load()"
          >
            <ul aria-live="polite">
              @for (item of data.value()?.page?.items ?? []; track item.id) {
                <li class="workspace-notice" [class.unread]="!item.readAt">
                  <span class="workspace-icon" aria-hidden="true">
                    <ng-icon
                      [name]="
                        item.kind === 'notificationSecurity' ? 'lucideShieldCheck' : 'lucideBell'
                      "
                    />
                  </span>
                  <div class="min-w-0 flex-1">
                    <p class="font-medium">
                      {{ item.kind | t }}
                      @if (!item.readAt) {
                        <span class="workspace-unread-dot" [attr.aria-label]="'unread' | t"></span>
                      }
                    </p>
                    <p class="workspace-meta mt-1">{{ item.kind + 'Help' | t }}</p>
                    <p class="workspace-meta mt-2">{{ i18n.date(item.createdAt) }}</p>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <button
                        hlmBtn
                        variant="outline"
                        size="sm"
                        [disabled]="busy()"
                        (click)="open(item)"
                      >
                        {{ 'viewDetails' | t }}<ng-icon name="lucideArrowUpRight" />
                      </button>
                      @if (!item.readAt) {
                        <button
                          hlmBtn
                          variant="ghost"
                          size="sm"
                          [disabled]="busy()"
                          (click)="read(item)"
                        >
                          {{ 'markRead' | t }}
                        </button>
                      }
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
          <button hlmBtn variant="ghost" hlmDrawerClose>{{ 'close' | t }}</button>
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

  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get('notifications', { pageNumber: 1 }, signal),
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
          items: value.page.items.map((item) =>
            !id || item.id === id
              ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
              : item,
          ),
        },
      };
    });
  }

  async read(item: NotificationItem) {
    if (this.busy() || item.readAt) return;
    this.busy.set(true);
    try {
      await this.api.post('notifications/read?id=' + encodeURIComponent(item.id));
      this.applyRead(item.id);
    } catch {
      /* Request errors are already reported centrally. */
    } finally {
      this.busy.set(false);
    }
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

  async open(item: NotificationItem) {
    if (!['/profile', '/security', '/privacy', '/operations', '/me'].includes(item.link)) return;
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
    await this.router.navigateByUrl(item.link === '/profile' ? '/security' : item.link);
  }

  async viewAll() {
    this.drawer().close();
    await this.router.navigateByUrl('/notifications');
  }
}

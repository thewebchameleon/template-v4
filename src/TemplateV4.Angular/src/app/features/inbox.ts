import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { WorkspaceUi, workspaceIcons, Resource, ListQuery } from '../shared/workspace';
import { Auth } from '../core/auth';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { NotificationItem, NotificationPage } from '../api/models';
import { UnreadNotifications } from '../core/unread-notifications';
@Component({
  selector: 'app-inbox',
  imports: [WorkspaceUi],
  providers: [workspaceIcons],
  template: ` <app-page-header title="notificationCentre" description="notificationIntro"
      ><button
        hlmBtn
        variant="outline"
        [disabled]="busy() || !data.value()?.unread"
        (click)="readAll()"
      >
        <ng-icon name="lucideCheck" />{{ 'markAllRead' | t }}
      </button></app-page-header
    >
    <div class="grid gap-5">
      <section hlmCard>
        <div hlmCardHeader>
          <h2 hlmCardTitle>
            {{ 'yourInbox' | t }}
            <span hlmBadge variant="secondary"
              >{{ data.value()?.unread ?? 0 }} {{ 'unread' | t }}</span
            >
          </h2>
          <p hlmCardDescription>{{ 'yourInboxHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <hlm-toggle-group
            type="single"
            variant="outline"
            [nullable]="false"
            [value]="query.text('filter', 'all')"
            (valueChange)="filter($event)"
            [attr.aria-label]="'notificationFilter' | t"
            ><button hlmToggleGroupItem value="all">{{ 'all' | t }}</button
            ><button hlmToggleGroupItem value="unread">{{ 'unread' | t }}</button></hlm-toggle-group
          >
          <app-page-state
            [state]="data.state()"
            [refreshing]="data.refreshing()"
            [refreshError]="data.refreshError()"
            (retry)="load()"
            ><ul aria-live="polite">
              @for (item of data.value()?.page?.items ?? []; track item.id) {
                <li class="workspace-notice" [class.unread]="!item.readAt">
                  <span class="workspace-icon" aria-hidden="true"
                    ><ng-icon
                      [name]="
                        item.kind === 'notificationSecurity' ? 'lucideShieldCheck' : 'lucideBell'
                      "
                  /></span>
                  <div class="min-w-0 flex-1">
                    <p class="font-medium">
                      {{ item.kind | t }}
                      @if (!item.readAt) {
                        <span class="workspace-unread-dot" [attr.aria-label]="'unread' | t"></span>
                      }
                    </p>

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
            <app-list-pager
              [total]="data.value()?.page?.total ?? 0"
              [page]="query.page"
              (pageChange)="query.set({ page: $event })"
          /></app-page-state>
        </div>
      </section>
      <details hlmCard>
        <summary class="cursor-pointer px-6 py-4 font-medium">
          {{ 'notificationPreferences' | t }}
        </summary>
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'notificationPreferences' | t }}</h2>
          <p hlmCardDescription>{{ 'notificationPreferencesHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <div hlmField orientation="horizontal">
            <hlm-switch
              inputId="optional-email"
              [checked]="data.value()?.optionalEmailEnabled ?? false"
              [disabled]="busy() || data.state() !== 'ready'"
              (checkedChange)="preference($event)"
            /><label hlmFieldLabel for="optional-email">{{ 'optionalEmail' | t }}</label>
          </div>
          <p class="workspace-meta mt-3">{{ 'optionalEmailHelp' | t }}</p>
        </div>
        <div hlmCardFooter>
          <p class="workspace-meta">{{ 'securityEmailRequired' | t }}</p>
        </div>
      </details>
    </div>`,
})
export class InboxPage {
  readonly auth = inject(Auth);
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly unread = inject(UnreadNotifications);
  readonly router = inject(Router);
  readonly data = new Resource<NotificationPage>();
  readonly query = new ListQuery();
  readonly busy = signal(false);
  constructor() {
    this.query.connect(() => void this.load());
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        'notifications',
        {
          pageNumber: this.query.page,
          unreadOnly: this.query.text('filter') === 'unread',
        },
        signal,
      ),
    );
    if (loaded) this.unread.set(this.data.value()!.unread);
    if (loaded) this.query.clamp(this.data.value()?.page.total);
  }
  filter(value: unknown) {
    if (value === 'all' || value === 'unread') void this.query.set({ filter: value, page: 1 });
  }
  private applyRead(id?: string) {
    this.data.value.update((value) => {
      if (!value) return value;
      const changed = id
        ? value.page.items.filter((i) => i.id === id && !i.readAt).length
        : value.unread;
      let items = value.page.items.map((item) =>
        !id || item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item,
      );
      const filtered = this.query.text('filter') === 'unread';
      if (filtered) items = items.filter((i) => !i.readAt);
      const unread = Math.max(0, value.unread - changed);
      this.unread.set(unread);
      return {
        ...value,
        unread,
        page: {
          ...value.page,
          items,
          total: filtered ? Math.max(0, value.page.total - changed) : value.page.total,
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
      if (this.query.text('filter') === 'unread') await this.load();
    } catch {
      /* central feedback */
    } finally {
      this.busy.set(false);
    }
  }
  async readAll() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post('notifications/read');
      this.applyRead();
      this.query.clamp(this.data.value()?.page.total);
    } catch {
      /* central feedback */
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
    await this.router.navigateByUrl(item.link === '/profile' ? '/security' : item.link);
  }
  async preference(enabled: boolean) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post('notifications/preferences', { optionalEmailEnabled: enabled });
      this.data.value.update((value) =>
        value ? { ...value, optionalEmailEnabled: enabled } : value,
      );
      this.toast.success('preferencesSaved');
    } catch {
      /* central feedback */
    } finally {
      this.busy.set(false);
    }
  }
}

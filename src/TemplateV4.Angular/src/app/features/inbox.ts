import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  DEFAULT_PAGE_SIZE,
} from '../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';
import { Auth } from '../core/auth';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { NotificationItem, NotificationPage } from '../api/models';
import { UnreadNotifications } from '../core/unread-notifications';

const column = createColumnHelper<DataTableFeatures, NotificationItem>();

@Component({
  selector: 'app-notification-row',
  imports: [WorkspaceUi],
  providers: [workspaceIcons],
  template: `
    <div class="flex min-w-0 flex-wrap items-center gap-3 sm:flex-nowrap">
      <span class="workspace-icon size-9 rounded-md" aria-hidden="true">
        <ng-icon
          [name]="item().kind === 'notificationSecurity' ? 'lucideShieldCheck' : 'lucideBell'"
        />
      </span>
      <div class="min-w-0 flex-1">
        <p class="truncate font-medium">
          {{ item().kind | t }}
          @if (!item().readAt) {
            <span class="workspace-unread-dot" [attr.aria-label]="'unread' | t"></span>
          }
        </p>
        <p class="workspace-meta">{{ i18n.date(item().createdAt) }}</p>
      </div>
      <div class="ml-auto flex w-full shrink-0 justify-end gap-1 sm:w-auto">
        <button hlmBtn variant="ghost" size="sm" [disabled]="busy()" (click)="toggle()()">
          {{ (item().readAt ? 'markUnread' : 'markRead') | t }}
        </button>
        <button hlmBtn variant="outline" size="sm" [disabled]="busy()" (click)="open()()">
          {{ 'viewDetails' | t }}<ng-icon name="lucideArrowUpRight" />
        </button>
      </div>
    </div>
  `,
})
export class NotificationRow {
  readonly i18n = inject(I18n);
  readonly item = input.required<NotificationItem>();
  readonly busy = input(false);
  readonly open = input.required<() => void>();
  readonly toggle = input.required<() => void>();
}

@Component({
  selector: 'app-inbox',
  imports: [WorkspaceUi, DataTable],
  providers: [workspaceIcons],
  template: ` <section hlmCard>
    <div hlmCardHeader>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 hlmCardTitle>
            {{ 'yourInbox' | t }}
            <span hlmBadge variant="secondary"
              >{{ data.value()?.unread ?? 0 }} {{ 'unread' | t }}</span
            >
          </h2>
          <p hlmCardDescription>{{ 'yourInboxHelp' | t }}</p>
        </div>
        <button
          hlmBtn
          variant="outline"
          [disabled]="busy() || !data.value()?.unread"
          (click)="readAll()"
        >
          <ng-icon name="lucideCheck" />{{ 'markAllRead' | t }}
        </button>
      </div>
    </div>
    <div hlmCardContent>
      <hlm-tabs [tab]="query.text('filter', 'all')" (tabActivated)="filter($event)" class="mb-5">
        <hlm-tabs-list [attr.aria-label]="'notificationFilter' | t">
          <button hlmTabsTrigger="all">{{ 'all' | t }}</button>
          <button hlmTabsTrigger="unread">{{ 'unread' | t }}</button>
        </hlm-tabs-list>
      </hlm-tabs>
      <app-page-state
        [state]="data.state() === 'loading' ? 'ready' : data.state()"
        [refreshError]="data.refreshError()"
        (retry)="load()"
      >
        <app-data-table
          [columns]="columns()"
          [data]="data.value()?.page?.items ?? []"
          [loading]="loading()"
          [loadingText]="'loading' | t"
          [emptyText]="'inboxEmpty' | t"
          [ariaLabel]="'yourInbox' | t"
          [sortColumn]="query.text('sort', 'createdAt')"
          [sortDirection]="query.direction('desc')"
          (sortChange)="sort($event)"
          fillColumn="createdAt"
        />
        <app-list-pager
          [total]="data.value()?.page?.total ?? 0"
          [page]="query.page"
          [busy]="loading()"
          (pageChange)="query.set({ page: $event })"
        />
      </app-page-state>
    </div>
  </section>`,
})
export class InboxPage {
  readonly auth = inject(Auth);
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly unread = inject(UnreadNotifications);
  readonly router = inject(Router);
  readonly data = new Resource<NotificationPage>();
  readonly query = new ListQuery();
  readonly busy = signal(false);
  readonly columns = computed(() => {
    this.i18n.culture();
    const busy = this.busy();
    return column.columns([
      column.accessor('createdAt', {
        header: this.i18n.text('yourInbox'),
        cell: ({ row }) =>
          flexRenderComponent(NotificationRow, {
            inputs: {
              item: row.original,
              busy,
              open: () => void this.open(row.original),
              toggle: () => void this.toggleRead(row.original),
            },
          }),
      }),
    ]);
  });
  constructor() {
    this.query.connect(() => void this.load());
    this.unread.changes.pipe(takeUntilDestroyed()).subscribe(() => void this.load());
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        'notifications',
        {
          pageNumber: this.query.page,
          pageSize: DEFAULT_PAGE_SIZE,
          unreadOnly: this.query.text('filter') === 'unread',
          sort: this.query.text('sort', 'createdAt'),
          direction: this.query.direction('desc'),
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
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  loading() {
    return this.data.state() === 'loading' || this.data.refreshing();
  }
  private applyRead(id?: string, read = true) {
    this.data.value.update((value) => {
      if (!value) return value;
      const changed = id
        ? value.page.items.filter((i) => i.id === id && Boolean(i.readAt) !== read).length
        : read
          ? value.unread
          : 0;
      let items = value.page.items.map((item) =>
        !id || item.id === id
          ? { ...item, readAt: read ? (item.readAt ?? new Date().toISOString()) : null }
          : item,
      );
      const filtered = this.query.text('filter') === 'unread';
      if (filtered && read) items = items.filter((i) => !i.readAt);
      const unread = Math.max(0, value.unread + (read ? -changed : changed));
      this.unread.set(unread);
      return {
        ...value,
        unread,
        page: {
          ...value.page,
          items,
          total: filtered && read ? Math.max(0, value.page.total - changed) : value.page.total,
        },
      };
    });
  }
  async toggleRead(item: NotificationItem) {
    if (this.busy()) return;
    const read = !item.readAt;
    this.busy.set(true);
    try {
      await this.api.post('notifications/read?id=' + encodeURIComponent(item.id) + '&read=' + read);
      this.applyRead(item.id, read);
      if (read && this.query.text('filter') === 'unread') await this.load();
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
      this.applyRead(undefined, true);
      this.query.clamp(this.data.value()?.page.total);
    } catch {
      /* central feedback */
    } finally {
      this.busy.set(false);
    }
  }
  async open(item: NotificationItem) {
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
      return;
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
    await this.router.navigateByUrl(
      item.link === '/profile'
        ? '/security'
        : item.link === '/operations'
          ? '/administration/system-health'
          : item.link,
    );
  }
}

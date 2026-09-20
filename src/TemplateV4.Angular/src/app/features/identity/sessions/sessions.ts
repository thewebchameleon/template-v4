import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  DebouncedSearch,
  DEFAULT_PAGE_SIZE,
  ListQuery,
  PAGE_SIZE_OPTIONS,
  Resource,
  WorkspaceUi,
} from '../../../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../../shared/data-table';
import { RecordStatus, RowActions } from '../../../shared/workspace-cells';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Auth } from '../../../core/auth';
import { I18n } from '../../../core/i18n';
import { Confirmations } from '../../../shared/confirmation';
import { Notifications } from '../../notifications/notifications';

interface Session {
  id: string;
  device: string;
  ipAddress: string;
  lastActivityAt: string;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

interface SessionPage {
  items: Session[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

const column = createColumnHelper<DataTableFeatures, Session>();

@Component({
  selector: 'app-sessions',
  imports: [WorkspaceUi, DataTable],
  template: `
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'sessions' | t }}</h2>
        <p hlmCardDescription>{{ 'sessionsIntro' | t }}</p>
      </div>
      <div hlmCardContent>
        <div class="mb-4" hlmField>
          <label hlmFieldLabel class="sr-only" for="session-search">{{
            'searchSessions' | t
          }}</label>
          <input
            hlmInput
            id="session-search"
            class="sm:max-w-sm"
            [ngModel]="search.value()"
            (ngModelChange)="search.update($event)"
            maxlength="200"
            [placeholder]="'searchSessions' | t"
          />
        </div>
        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.state() === 'loading' || data.refreshing()"
            [loadingText]="'loading' | t"
            [emptyText]="'noSessions' | t"
            [ariaLabel]="'sessions' | t"
            [sortColumn]="query.text('sort', 'lastActivityAt')"
            [sortDirection]="query.direction('desc')"
            (sortChange)="sort($event)" /><app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [busy]="data.state() === 'loading' || data.refreshing()"
            [showSizePicker]="true"
            (sizeChange)="query.set({ pageSize: $event, page: 1 })"
            (pageChange)="query.set({ page: $event })"
        /></app-page-state>
      </div>
    </section>
  `,
})
export class SessionsPage {
  private readonly router = inject(Router);
  private readonly confirm = inject(Confirmations);
  private readonly auth = inject(Auth);
  private readonly api = inject(WorkspaceApi);
  private readonly notifications = inject(Notifications);

  readonly i18n = inject(I18n);
  readonly data = new Resource<SessionPage>();
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly busy = signal(false);
  readonly columns = computed(() => {
    this.i18n.culture();
    const busy = this.busy();
    return column.columns([
      column.accessor('device', { header: this.i18n.text('device') }),
      column.accessor('ipAddress', { header: this.i18n.text('ipAddress') }),
      column.accessor('lastActivityAt', {
        header: this.i18n.text('lastActivity'),
        cell: ({ getValue }) => this.i18n.date(getValue()),
      }),
      column.accessor('createdAt', {
        header: this.i18n.text('createdAt'),
        cell: ({ getValue }) => this.i18n.date(getValue()),
      }),
      column.accessor('expiresAt', {
        header: this.i18n.text('expiresAt'),
        cell: ({ getValue }) => this.i18n.date(getValue()),
      }),
      column.accessor('current', {
        header: this.i18n.text('status'),
        cell: ({ getValue }) =>
          flexRenderComponent(RecordStatus, {
            inputs: { value: getValue() ? 'currentSession' : 'active' },
          }),
      }),
      column.display({
        id: 'actions',
        enableSorting: false,
        header: this.i18n.text('actions'),
        cell: ({ row }) =>
          flexRenderComponent(RowActions, {
            inputs: {
              actions: [
                {
                  label: row.original.current ? 'signOutThisDevice' : 'signOutDevice',
                  disabled: busy,
                  destructive: true,
                  run: () => void this.revoke(row.original),
                },
              ],
            },
          }),
      }),
    ]);
  });

  constructor() {
    this.search.sync(this.query.text('search'));
    this.query.connect(() => {
      const value = this.query.text('search');
      if (this.search.value() !== value) this.search.sync(value);
      void this.load();
    }, ['search', 'page', 'pageSize', 'sort', 'direction']);
  }

  pageSize() {
    const size = Number(this.query.text('pageSize', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
  }

  async load() {
    const loaded = await this.data.load((abortSignal) =>
      this.api.get<SessionPage>(
        'sessions',
        {
          search: this.query.text('search'),
          pageNumber: this.query.page,
          pageSize: this.pageSize(),
          sort: this.query.text('sort', 'lastActivityAt'),
          direction: this.query.direction('desc'),
        },
        abortSignal,
      ),
    );
    if (loaded) this.query.clamp(this.data.value()?.total, this.pageSize());
  }

  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }

  async revoke(session: Session) {
    if (this.busy()) return;
    if (session.current && !(await this.confirm.ask('signOutThisDevice', 'signOutDeviceHelp')))
      return;
    this.busy.set(true);
    try {
      await this.auth.revoke(session.id);
      this.notifications.success('sessionRevoked');
      if (session.current) {
        this.auth.access.set(null);
        await this.router.navigateByUrl('/login');
      } else await this.load();
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
}

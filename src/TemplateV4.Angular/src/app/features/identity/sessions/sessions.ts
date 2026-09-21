import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { NgScrollbar } from 'ngx-scrollbar';
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

interface SessionAuditItem {
  id: number;
  action: string;
  subjectName: string | null;
  outcome: string;
  at: string;
}

interface SessionAuditPage {
  items: SessionAuditItem[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

const column = createColumnHelper<DataTableFeatures, Session>();
const auditColumn = createColumnHelper<DataTableFeatures, SessionAuditItem>();

@Component({
  selector: 'app-sessions',
  imports: [WorkspaceUi, DataTable, HlmDrawerImports, HlmScrollAreaImports, NgScrollbar],
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
            [rowActionLabel]="detailsLabel"
            (rowAction)="select($event)"
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
    <hlm-drawer
      direction="right"
      [state]="selected() ? 'open' : 'closed'"
      [closeLabel]="'close' | t"
      (stateChanged)="$event === 'closed' && selected.set(null)"
    >
      <hlm-drawer-content
        *hlmDrawerPortal
        class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-4xl"
      >
        <hlm-drawer-header>
          <h2 hlmDrawerTitle>{{ 'sessionDetails' | t }}</h2>
          <p hlmDrawerDescription>{{ 'sessionDetailsHelp' | t }}</p>
        </hlm-drawer-header>
        <ng-scrollbar
          hlm
          hlmDrawerBody
          orientation="vertical"
          role="region"
          [attr.aria-label]="'sessionDetails' | t"
          class="min-h-0 flex-1"
        >
          @if (selected(); as session) {
            <div class="grid gap-5">
              <dl class="grid gap-4 sm:grid-cols-2">
                <div class="grid gap-1">
                  <dt class="text-muted-foreground">{{ 'device' | t }}</dt>
                  <dd class="font-medium">{{ session.device }}</dd>
                </div>
                <div class="grid gap-1">
                  <dt class="text-muted-foreground">{{ 'ipAddress' | t }}</dt>
                  <dd class="font-medium">{{ session.ipAddress }}</dd>
                </div>
                <div class="grid gap-1">
                  <dt class="text-muted-foreground">{{ 'status' | t }}</dt>
                  <dd class="font-medium">{{ (session.current ? 'currentSession' : 'active') | t }}</dd>
                </div>
                <div class="grid gap-1">
                  <dt class="text-muted-foreground">{{ 'lastActivity' | t }}</dt>
                  <dd class="font-medium">{{ i18n.date(session.lastActivityAt) }}</dd>
                </div>
                <div class="grid gap-1">
                  <dt class="text-muted-foreground">{{ 'createdAt' | t }}</dt>
                  <dd class="font-medium">{{ i18n.date(session.createdAt) }}</dd>
                </div>
                <div class="grid gap-1">
                  <dt class="text-muted-foreground">{{ 'expiresAt' | t }}</dt>
                  <dd class="font-medium">{{ i18n.date(session.expiresAt) }}</dd>
                </div>
              </dl>

              <section aria-labelledby="session-audit-heading">
                <div class="mb-4 grid gap-1">
                  <h3 id="session-audit-heading" class="font-semibold">{{ 'sessionAudit' | t }}</h3>
                  <p class="text-muted-foreground">{{ 'sessionAuditHelp' | t }}</p>
                </div>
                <app-page-state
                  [state]="auditData.state()"
                  [refreshError]="auditData.refreshError()"
                  (retry)="loadAudit()"
                  ><app-data-table
                    [columns]="auditColumns()"
                    [data]="auditData.value()?.items ?? []"
                    [loading]="auditData.state() === 'loading' || auditData.refreshing()"
                    [loadingText]="'loading' | t"
                    [emptyText]="'sessionAuditEmpty' | t"
                    [ariaLabel]="'sessionAudit' | t"
                    [sortColumn]="auditSort().column"
                    [sortDirection]="auditSort().direction"
                    (sortChange)="sortAudit($event)" /><app-list-pager
                    [total]="auditData.value()?.total ?? 0"
                    [page]="auditPage()"
                    [size]="auditPageSize()"
                    [busy]="auditData.state() === 'loading' || auditData.refreshing()"
                    [showSizePicker]="true"
                    (sizeChange)="setAuditPageSize($event)"
                    (pageChange)="setAuditPage($event)"
                /></app-page-state>
              </section>
            </div>
          }
        </ng-scrollbar>
        <hlm-drawer-footer>
          <button hlmBtn type="button" variant="outline" hlmDrawerClose>{{ 'close' | t }}</button>
        </hlm-drawer-footer>
      </hlm-drawer-content>
    </hlm-drawer>
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
  readonly auditData = new Resource<SessionAuditPage>();
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly busy = signal(false);
  readonly selected = signal<Session | null>(null);
  readonly auditPage = signal(1);
  readonly auditPageSize = signal(DEFAULT_PAGE_SIZE);
  readonly auditSort = signal<ServerSort>({ column: 'at', direction: 'desc' });
  readonly detailsLabel = (session: Session) =>
    `${this.i18n.text('sessionDetails')}: ${session.device} · ${session.ipAddress}`;
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
  readonly auditColumns = computed(() => {
    this.i18n.culture();
    return auditColumn.columns([
      auditColumn.accessor('at', {
        header: this.i18n.text('actionDate'),
        cell: ({ getValue }) => this.i18n.date(getValue()),
      }),
      auditColumn.accessor('action', {
        header: this.i18n.text('activity'),
        cell: ({ getValue }) => this.auditSummary(getValue()),
      }),
      auditColumn.accessor('subjectName', {
        header: this.i18n.text('relatedRecord'),
        cell: ({ getValue }) => getValue() || this.i18n.text('systemRecord'),
      }),
      auditColumn.accessor('outcome', {
        header: this.i18n.text('auditOutcome'),
        cell: ({ getValue }) => this.i18n.text('auditValue.' + getValue()),
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

  select(session: Session) {
    this.selected.set(session);
    this.auditPage.set(1);
    this.auditPageSize.set(DEFAULT_PAGE_SIZE);
    this.auditSort.set({ column: 'at', direction: 'desc' });
    this.auditData.value.set(null);
    this.auditData.state.set('loading');
    void this.loadAudit();
  }

  async loadAudit() {
    const session = this.selected();
    if (!session) return;
    const sort = this.auditSort();
    await this.auditData.load((abortSignal) =>
      this.api.get<SessionAuditPage>(
        `sessions/${session.id}/audit`,
        {
          pageNumber: this.auditPage(),
          pageSize: this.auditPageSize(),
          sort: sort.column,
          direction: sort.direction,
        },
        abortSignal,
      ),
    );
  }

  sortAudit(value: ServerSort) {
    this.auditSort.set(value);
    this.auditPage.set(1);
    void this.loadAudit();
  }

  setAuditPage(page: number) {
    this.auditPage.set(page);
    void this.loadAudit();
  }

  setAuditPageSize(size: number) {
    this.auditPageSize.set(size);
    this.auditPage.set(1);
    void this.loadAudit();
  }

  auditSummary(action: string) {
    const key = 'audit.' + action;
    const translated = this.i18n.text(key);
    return translated === key ? action.replaceAll('.', ' · ').replaceAll('_', ' ') : translated;
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

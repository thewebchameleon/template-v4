import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  DebouncedSearch,
  protectUnload,
  Confirmations,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';
import { RecordStatus, RecordUserIdentity } from '../shared/workspace-cells';
import { UserDetailPage } from './user-detail';
import { PeopleNav } from '../shared/people-nav';
import { InvitationDrawer } from './invite-user';
import { InvitationsPanel } from './invitations';
import { RolesPanel } from './roles';
import { WorkspaceApi } from '../core/workspace-api';
import { Auth } from '../core/auth';
import { I18n } from '../core/i18n';
import { UserDirectoryPage, UserDto } from '../api/models';
const column = createColumnHelper<DataTableFeatures, UserDto>();
@Component({
  selector: 'app-users',
  imports: [
    WorkspaceUi,
    DataTable,
    PeopleNav,
    HlmDrawerImports,
    HlmSelectImports,
    InvitationDrawer,
    InvitationsPanel,
    RolesPanel,
    UserDetailPage,
  ],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header
      title="userManagement"
      description="peopleIntro"
      eyebrow="administration"
    />
    <app-people-nav [section]="section()" (sectionChange)="setSection($event)" />
    @if (section() === 'users') {
      <section hlmCard class="workspace-directory-panel">
        <div
          hlmCardHeader
          class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div>
            <h2 hlmCardTitle>{{ 'directory' | t }}</h2>
            <p hlmCardDescription aria-live="polite">
              {{ i18n.number(directoryTotal()) }} {{ 'users' | t }} ·
              {{ i18n.number(data.value()?.active ?? 0) }} {{ 'active' | t }} ·
              {{ i18n.number(data.value()?.invited ?? 0) }} {{ 'invited' | t }} ·
              {{ i18n.number(data.value()?.disabled ?? 0) }} {{ 'disabled' | t }}
            </p>
          </div>
          @if (auth.has('users.manage')) {
            <app-invitation-drawer (invited)="load()" />
          }
        </div>
        <div hlmCardContent>
          <div class="workspace-directory-controls">
            <hlm-tabs
              [tab]="statusFilter()"
              (tabActivated)="setStatus($event)"
              class="workspace-directory-tabs"
            >
              <hlm-tabs-list [attr.aria-label]="'userStatusFilter' | t" class="flex-wrap">
                <button hlmTabsTrigger="all">
                  {{ 'all' | t }}
                  <span hlmBadge variant="secondary">{{ i18n.number(directoryTotal()) }}</span>
                </button>
                <button hlmTabsTrigger="Active">
                  {{ 'active' | t }}
                  <span hlmBadge variant="secondary">{{
                    i18n.number(data.value()?.active ?? 0)
                  }}</span>
                </button>
                <button hlmTabsTrigger="Invited">
                  {{ 'invited' | t }}
                  <span hlmBadge variant="secondary">{{
                    i18n.number(data.value()?.invited ?? 0)
                  }}</span>
                </button>
                <button hlmTabsTrigger="Disabled">
                  {{ 'disabled' | t }}
                  <span hlmBadge variant="secondary">{{
                    i18n.number(data.value()?.disabled ?? 0)
                  }}</span>
                </button>
              </hlm-tabs-list>
            </hlm-tabs>
            <div class="workspace-directory-toolbar">
              <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
                <label hlmFieldLabel class="sr-only" for="user-search">{{ 'search' | t }}</label>
                <input
                  hlmInput
                  id="user-search"
                  [ngModel]="search.value()"
                  (ngModelChange)="search.update($event)"
                  maxlength="120"
                  [placeholder]="'peopleSearch' | t"
                />
              </div>
              <hlm-drawer
                direction="right"
                [state]="filtersOpen() ? 'open' : 'closed'"
                (stateChanged)="setFiltersOpen($event === 'open')"
              >
                <button hlmBtn hlmDrawerTrigger type="button" variant="outline">
                  <ng-icon name="lucideFunnel" aria-hidden="true" />
                  {{ 'filters' | t }}
                  @if (roleFilter()) {
                    <span hlmBadge variant="counter">1</span>
                  }
                </button>
                <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
                  <hlm-drawer-header>
                    <h2 hlmDrawerTitle>{{ 'filters' | t }}</h2>
                    <p hlmDrawerDescription>{{ 'roleFilterHelp' | t }}</p>
                  </hlm-drawer-header>
                  <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
                    <div hlmField class="w-full">
                      <label hlmFieldLabel for="user-role-filter">{{ 'role' | t }}</label>
                      <hlm-select
                        class="w-full"
                        [value]="roleDraft()"
                        [itemToString]="roleLabel"
                        (valueChange)="roleDraft.set($event ?? 'all')"
                      >
                        <hlm-select-trigger buttonId="user-role-filter" class="w-full">
                          <hlm-select-value />
                        </hlm-select-trigger>
                        <hlm-select-content *hlmSelectPortal [ariaLabel]="'role' | t">
                          <hlm-select-item value="all">{{ 'allRoles' | t }}</hlm-select-item>
                          @for (role of data.value()?.roles ?? []; track role) {
                            <hlm-select-item [value]="role">{{ role }}</hlm-select-item>
                          }
                        </hlm-select-content>
                      </hlm-select>
                      <p hlmFieldDescription>{{ 'roleFilterHelp' | t }}</p>
                    </div>
                  </div>
                  <hlm-drawer-footer>
                    <button
                      hlmBtn
                      type="button"
                      [disabled]="!filtersChanged()"
                      (click)="applyFilters()"
                    >
                      {{ 'applyFilters' | t }}
                    </button>
                    <button
                      hlmBtn
                      type="button"
                      variant="outline"
                      [disabled]="!hasFilters()"
                      (click)="clearFilters()"
                    >
                      <ng-icon name="lucideFunnelX" aria-hidden="true" />
                      {{ 'clearFilters' | t }}
                    </button>
                  </hlm-drawer-footer>
                </hlm-drawer-content>
              </hlm-drawer>
            </div>
          </div>
          <app-page-state
            [state]="data.state()"
            [refreshError]="data.refreshError()"
            (retry)="load()"
            ><app-data-table
              [columns]="columns()"
              [rowActionLabel]="detailsLabel"
              (rowAction)="openDetails($event)"
              [data]="data.value()?.items ?? []"
              [loading]="data.state() === 'loading' || data.refreshing()"
              [loadingText]="'loading' | t"
              [emptyText]="emptyText()"
              [sortColumn]="query.text('sort', 'username')"
              [sortDirection]="query.direction('asc')"
              (sortChange)="sort($event)" /><app-list-pager
              [page]="query.page"
              [total]="data.value()?.total ?? 0"
              [size]="pageSize()"
              [showSizePicker]="true"
              [busy]="data.refreshing()"
              (pageChange)="query.set({ page: $event })"
              (sizeChange)="setPageSize($event)"
          /></app-page-state>
        </div>
      </section>
      <hlm-drawer
        direction="right"
        [state]="selectedUser() ? 'open' : 'closed'"
        [disableClose]="detailsBusy() || (detailEditor()?.hasUnsavedChanges() ?? false)"
        (stateChanged)="$event === 'closed' && closeDetails()"
      >
        <hlm-drawer-content
          *hlmDrawerPortal
          class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-2xl"
        >
          <hlm-drawer-header>
            <h2 hlmDrawerTitle>{{ 'personDetails' | t }}</h2>
            <p hlmDrawerDescription>{{ 'personDetailsHelp' | t }}</p>
          </hlm-drawer-header>
          <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
            @if (selectedUser(); as user) {
              <app-user-detail [userId]="user.id" [embedded]="true" (saved)="load()" />
            }
          </div>
          <hlm-drawer-footer>
            <button
              hlmBtn
              type="button"
              variant="outline"
              [disabled]="detailsBusy()"
              (click)="closeDetails()"
            >
              {{ 'close' | t }}
            </button>
          </hlm-drawer-footer>
        </hlm-drawer-content>
      </hlm-drawer>
    } @else if (section() === 'invitations') {
      <app-invitations-panel />
    } @else {
      <app-roles-panel />
    }`,
})
export class UsersPage {
  readonly auth = inject(Auth);
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly data = new Resource<UserDirectoryPage>();
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly filtersOpen = signal(false);
  readonly roleDraft = signal('all');
  readonly selectedUser = signal<UserDto | null>(null);
  readonly detailEditor = viewChild(UserDetailPage);
  readonly detailsBusy = computed(() => this.detailEditor()?.busy() ?? false);
  private readonly confirm = inject(Confirmations);
  readonly detailsLabel = (user: UserDto) =>
    `${this.i18n.text('personDetails')}: ${user.username || user.displayName}`;
  readonly roleLabel = (role: string) => (role === 'all' ? this.i18n.text('allRoles') : role);
  readonly emptyText = computed(() =>
    this.hasFilters() ? this.i18n.text('peopleFilteredEmpty') : this.i18n.text('peopleEmpty'),
  );
  private readonly invitationDrawer = viewChild(InvitationDrawer);
  private readonly invitationsPanel = viewChild(InvitationsPanel);
  private readonly rolesPanel = viewChild(RolesPanel);
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('username', {
        header: this.i18n.text('user'),
        cell: ({ row }) =>
          flexRenderComponent(RecordUserIdentity, {
            inputs: {
              username: row.original.username || row.original.email,
              displayName: row.original.displayName,
            },
          }),
      }),
      column.accessor('email', { header: this.i18n.text('email') }),
      column.accessor('roles', {
        header: this.i18n.text('roles'),
        cell: (c) => c.getValue().join(', ') || '—',
      }),
      column.accessor('status', {
        header: this.i18n.text('status'),
        cell: ({ row }) =>
          flexRenderComponent(RecordStatus, {
            inputs: { value: row.original.status ?? 'Active', danger: row.original.disabled },
          }),
      }),
    ]);
  });
  constructor() {
    this.query.connect(() => {
      this.search.sync(this.query.text('search'));
      if (this.section() === 'users') void this.load();
    }, ['section', 'search', 'page', 'size', 'status', 'role', 'sort', 'direction']);
  }
  section() {
    const requested = this.query.text('section');
    if (requested === 'invitations' && this.auth.has('users.manage')) return 'invitations';
    if (requested === 'roles' && this.auth.has('roles.manage')) return 'roles';
    if (this.auth.has('users.read')) return 'users';
    return 'roles';
  }
  async setSection(section: string) {
    if (!['users', 'invitations', 'roles'].includes(section) || section === this.section()) return;
    if (
      this.hasUnsavedChanges() &&
      !(await this.confirm.ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges'))
    )
      return;
    this.selectedUser.set(null);
    await this.query.set({ section });
  }
  async load() {
    const params: Record<string, string | number> = {
      pageNumber: this.query.page,
      pageSize: this.pageSize(),
      search: this.query.text('search'),
      status: this.statusFilter(),
      sort: this.query.text('sort', 'username'),
      direction: this.query.direction('asc'),
    };
    const role = this.roleFilter();
    if (role) params['role'] = role;
    const loaded = await this.data.load((signal) => this.api.get('/users', params, signal));
    if (loaded) this.query.clamp(this.data.value()?.total, this.pageSize());
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  directoryTotal() {
    const value = this.data.value();
    return value ? (value.active ?? 0) + (value.invited ?? 0) + (value.disabled ?? 0) : 0;
  }
  statusFilter() {
    const status = this.query.text('status', 'all');
    return ['all', 'Active', 'Invited', 'Disabled'].includes(status) ? status : 'all';
  }
  roleFilter() {
    return this.query.text('role');
  }
  pageSize() {
    const size = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
  }
  hasFilters() {
    return !!this.search.value() || this.statusFilter() !== 'all' || !!this.roleFilter();
  }
  setStatus(status: string) {
    void this.query.set({ status: status === 'all' ? null : status, page: 1 });
  }
  setRole(role: string | null | undefined) {
    void this.query.set({ role: !role || role === 'all' ? null : role, page: 1 });
  }
  setFiltersOpen(open: boolean) {
    if (open) this.roleDraft.set(this.roleFilter() || 'all');
    this.filtersOpen.set(open);
  }
  filtersChanged() {
    return this.roleDraft() !== (this.roleFilter() || 'all');
  }
  applyFilters() {
    this.filtersOpen.set(false);
    this.setRole(this.roleDraft());
  }
  setPageSize(size: number) {
    void this.query.set({ size, page: 1 });
  }
  clearFilters() {
    this.roleDraft.set('all');
    this.search.update('');
    void this.query.set({ search: null, status: null, role: null, page: 1 });
  }
  hasUnsavedChanges() {
    return (
      (this.invitationDrawer()?.hasUnsavedChanges() ?? false) ||
      (this.detailEditor()?.hasUnsavedChanges() ?? false) ||
      this.detailsBusy() ||
      (this.invitationsPanel()?.hasUnsavedChanges() ?? false) ||
      (this.rolesPanel()?.hasUnsavedChanges() ?? false)
    );
  }
  openDetails(user: UserDto) {
    this.selectedUser.set(user);
  }
  async closeDetails() {
    if (this.detailsBusy()) return;
    if (
      this.detailEditor()?.hasUnsavedChanges() &&
      !(await this.confirm.ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges'))
    )
      return;
    this.selectedUser.set(null);
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
}

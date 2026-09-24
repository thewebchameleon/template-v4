import { Component, computed, inject, input, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { NgScrollbar } from 'ngx-scrollbar';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  Confirmations,
  DebouncedSearch,
  ListQuery,
  protectUnload,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../shared/data-table';
import { RecordIdentity, RecordStatus } from '../../shared/workspace-cells';
import { WorkspaceApi } from '../../core/workspace-api';
import { Auth } from '../../core/auth';
import { Runtime } from '../../core/runtime';
import { I18n } from '../../core/i18n';
import { Notifications } from '../notifications/notifications';
import { AccessCatalog, PermissionItem, RoleItem } from '../../api/models';
const column = createColumnHelper<DataTableFeatures, RoleItem>();
const permissionColumn = createColumnHelper<DataTableFeatures, PermissionItem>();
interface PermissionPage {
  items: PermissionItem[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

@Component({
  selector: 'app-role-permission-checkbox',
  imports: [HlmCheckboxImports],
  template: `
    <hlm-checkbox
      [inputId]="'role-permission-' + key()"
      [aria-label]="label()"
      [checked]="checked()"
      [disabled]="disabled()"
      (checkedChange)="onToggle()($event)"
    />
  `,
})
class RolePermissionCheckbox {
  readonly key = input.required<string>();
  readonly label = input.required<string>();
  readonly checked = input(false);
  readonly disabled = input(false);
  readonly onToggle = input.required<(checked: boolean) => void>();
}

@Component({
  selector: 'app-roles-panel',
  imports: [
    WorkspaceUi,
    DataTable,
    HlmDrawerImports,
    HlmScrollAreaImports,
    HlmTextareaImports,
    NgScrollbar,
  ],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `
    <section hlmCard class="workspace-directory-panel">
      <div hlmCardHeader class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 hlmCardTitle>{{ 'roles' | t }}</h2>
          <p hlmCardDescription>{{ 'rolesSelectionHelp' | t }}</p>
        </div>
        <button hlmBtn type="button" (click)="select(null)">
          <ng-icon name="lucidePlus" />{{ 'createRole' | t }}
        </button>
      </div>
      <div hlmCardContent>
        <div class="workspace-directory-controls">
          <div class="workspace-directory-toolbar">
            <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
              <label hlmFieldLabel class="sr-only" for="role-search">{{ 'search' | t }}</label>
              <input
                hlmInput
                id="role-search"
                [ngModel]="search.value()"
                (ngModelChange)="search.update($event)"
                maxlength="120"
                [placeholder]="'roleSearch' | t"
              />
            </div>
            @if (search.value()) {
              <button hlmBtn type="button" variant="ghost" (click)="search.update('')">
                {{ 'clear' | t }}
              </button>
            }
          </div>
        </div>
        <app-page-state
          [state]="data.state()"
          skeleton="table"
          [refreshError]="data.refreshError()"
          [showInitialSkeleton]="false"
          (retry)="load()"
        >
          <app-data-table
            [columns]="columns()"
            fillColumn="name"
            [rowActionLabel]="roleDetailsLabel"
            (rowAction)="select($event)"
            [data]="data.value()?.roles.items ?? []"
            [loading]="data.state() === 'loading' || data.refreshing()"
            [loadingText]="'loading' | t"
            [emptyText]="emptyText()"
            [sortColumn]="query.text('sort', 'name')"
            [sortDirection]="query.direction('asc')"
            (sortChange)="sort($event)"
          />
          <app-list-pager
            [total]="data.value()?.roles.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [showSizePicker]="true"
            [busy]="data.refreshing()"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="setPageSize($event)"
          />
        </app-page-state>
      </div>
    </section>
    <hlm-drawer
      direction="right"
      [state]="editorOpen() ? 'open' : 'closed'"
      [disableClose]="busy() || hasUnsavedChanges()"
      [closeGuard]="confirmClose"
      [closeLabel]="'close' | t"
      (stateChanged)="drawerStateChanged($event)"
    >
      <hlm-drawer-content
        *hlmDrawerPortal
        class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-3xl"
      >
        <hlm-drawer-header>
          <h2 hlmDrawerTitle>
            {{ (selected()?.builtIn ? 'viewRole' : selected() ? 'editRole' : 'createRole') | t }}
          </h2>
          <p hlmDrawerDescription>
            {{ (selected()?.builtIn ? 'builtInRoleHelp' : 'delegationHelp') | t }}
          </p>
        </hlm-drawer-header>
        <form class="flex min-h-0 flex-1 flex-col" #form="ngForm" (ngSubmit)="form.valid && save()">
          <ng-scrollbar hlm hlmDrawerBody orientation="vertical" class="min-h-0 flex-1">
            <div class="grid gap-5">
              <div hlmField>
                <label hlmFieldLabel for="role-name">{{ 'roleName' | t }}</label
                ><input
                  hlmInput
                  id="role-name"
                  name="name"
                  [(ngModel)]="name"
                  required
                  minlength="2"
                  maxlength="80"
                  pattern="[A-Za-z0-9 -]+"
                  [disabled]="selected()?.builtIn || busy()"
                />
              </div>
              <div hlmField>
                <label hlmFieldLabel for="role-description">{{ 'description' | t }}</label
                ><textarea
                  hlmTextarea
                  id="role-description"
                  name="description"
                  [(ngModel)]="description"
                  maxlength="240"
                  rows="4"
                  [disabled]="busy()"
                ></textarea>
              </div>
              @if (conflict()) {
                <div hlmAlert role="alert">
                  <p hlmAlertDescription>{{ 'draftConflict' | t }}</p>
                  <button hlmBtn variant="outline" type="button" (click)="discard()">
                    {{ 'discardDraft' | t }}
                  </button>
                </div>
              }
              <section class="min-w-0 pt-(--card-spacing)" aria-labelledby="role-permissions-heading">
                <div class="workspace-directory-controls">
                  <h3 class="font-semibold" id="role-permissions-heading">
                    {{ 'rolePermissions' | t }}
                  </h3>
                  <div class="workspace-directory-toolbar">
                    <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
                      <label hlmFieldLabel class="sr-only" for="permission-search">
                        {{ 'findPermission' | t }}
                      </label>
                      <input
                        hlmInput
                        id="permission-search"
                        type="search"
                        name="permissionSearch"
                        maxlength="120"
                        [ngModel]="permissionSearch.value()"
                        (ngModelChange)="permissionSearch.update($event)"
                        [placeholder]="'findPermission' | t"
                      />
                    </div>
                    @if (permissionSearch.value()) {
                      <button hlmBtn type="button" variant="ghost" (click)="permissionSearch.update('')">
                        {{ 'clear' | t }}
                      </button>
                    }
                  </div>
                </div>
                <app-page-state
                  [state]="permissionData.state()"
                  skeleton="table"
                  [refreshError]="permissionData.refreshError()"
                  [showInitialSkeleton]="false"
                  (retry)="loadPermissions()"
                >
                  <app-data-table
                    [columns]="permissionColumns()"
                    [data]="permissionData.value()?.items ?? []"
                    [loading]="permissionData.state() === 'loading' || permissionData.refreshing()"
                    [loadingText]="'loading' | t"
                    [emptyText]="(permissionSearch.value() ? 'permissionsSearchEmpty' : 'permissionsEmpty') | t"
                    [ariaLabel]="'rolePermissions' | t"
                    fillColumn="key"
                    [sortColumn]="permissionQuery.text('sort', 'key')"
                    [sortDirection]="permissionQuery.direction('asc')"
                    (sortChange)="sortPermissions($event)"
                    [getRowId]="permissionRowId"
                    [rowSelectionActionLabel]="permissionRowLabel"
                    [rowSelectionActionDisabled]="permissionRowDisabled"
                    [rowSelected]="permissionRowSelected"
                    (rowSelectionAction)="selectPermissionRow($event)"
                  />
                  <app-list-pager
                    ariaLabel="permissionPagination"
                    [total]="permissionData.value()?.total ?? 0"
                    [page]="permissionQuery.page"
                    [size]="permissionPageSize()"
                    [showSizePicker]="true"
                    sizePickerId="permission-rows-per-page"
                    [busy]="permissionData.refreshing()"
                    (pageChange)="permissionQuery.set({ page: $event })"
                    (sizeChange)="setPermissionPageSize($event)"
                  />
                </app-page-state>
              </section>
            </div>
          </ng-scrollbar>
          <hlm-drawer-footer>
            <button
              hlmBtn
              [disabled]="form.invalid || busy() || conflict() || !hasUnsavedChanges()"
            >
              {{ 'saveRole' | t }}
            </button>
            <button hlmBtn type="button" variant="outline" (click)="close()">
              {{ 'close' | t }}
            </button>
          </hlm-drawer-footer>
        </form>
      </hlm-drawer-content>
    </hlm-drawer>
  `,
})
export class RolesPanel {
  readonly api = inject(WorkspaceApi);
  readonly auth = inject(Auth);
  readonly i18n = inject(I18n);
  readonly data = new Resource<AccessCatalog>();
  readonly permissionData = new Resource<PermissionPage>();
  readonly selected = signal<RoleItem | null>(null);
  readonly editorOpen = signal(false);
  readonly permissions = signal<string[]>([]);
  readonly query = new ListQuery('role');
  readonly search = new DebouncedSearch(this.query);
  readonly permissionQuery = new ListQuery('permission');
  readonly permissionSearch = new DebouncedSearch(this.permissionQuery);
  readonly busy = signal(false);
  readonly conflict = signal(false);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private readonly toast = inject(Notifications);
  private readonly confirm = inject(Confirmations);
  readonly confirmClose = () =>
    !this.busy() &&
    (!this.hasUnsavedChanges() ||
      this.confirm.ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges'));
  name = '';
  description = '';
  readonly emptyText = computed(() =>
    this.query.text('search') ? this.i18n.text('roleSearchEmpty') : this.i18n.text('rolesEmpty'),
  );
  readonly roleDetailsLabel = (role: RoleItem) =>
    `${this.i18n.text(role.builtIn ? 'viewRole' : 'editRole')}: ${role.name}`;
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('name', {
        header: this.i18n.text('roleName'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label: row.original.name,
              description:
                row.original.description ||
                (row.original.builtIn ? this.i18n.text('builtInRoleHelp') : ''),
              constrainWidth: false,
            },
          }),
      }),
      column.accessor('members', {
        header: this.i18n.text('roleMembers'),
        cell: (cell) => this.i18n.number(cell.getValue()),
      }),
      column.accessor('builtIn', {
        header: this.i18n.text('roleType'),
        cell: ({ row }) =>
          flexRenderComponent(RecordStatus, {
            inputs: { value: row.original.builtIn ? 'builtIn' : 'customRole' },
          }),
      }),
    ]);
  });
  readonly permissionRowId = (permission: PermissionItem) => permission.key;
  readonly permissionRowSelected = (permission: PermissionItem) =>
    this.permissions().includes(permission.key);
  readonly permissionRowDisabled = (permission: PermissionItem) =>
    !!this.selected()?.builtIn || !this.auth.has(permission.key) || this.busy();
  readonly permissionRowLabel = (permission: PermissionItem) =>
    `${this.i18n.text(this.permissionRowSelected(permission) ? 'deselectPermission' : 'selectPermission')}: ${this.i18n.text('permission.' + permission.key)}`;
  readonly permissionColumns = computed(() => {
    this.i18n.culture();
    const assigned = this.permissions();
    const disabled = !!this.selected()?.builtIn || this.busy();
    return permissionColumn.columns([
      permissionColumn.display({
        id: 'selection',
        header: this.i18n.text('selectPermission'),
        enableSorting: false,
        cell: ({ row }) =>
          flexRenderComponent(RolePermissionCheckbox, {
            inputs: {
              key: row.original.key,
              label: this.i18n.text('permission.' + row.original.key),
              checked: assigned.includes(row.original.key),
              disabled: disabled || !this.auth.has(row.original.key),
              onToggle: (checked: boolean) => this.toggle(row.original.key, checked),
            },
          }),
      }),
      permissionColumn.accessor('key', {
        header: this.i18n.text('permissionName'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label: this.i18n.text('permission.' + row.original.key),
              description: this.i18n.text('permissionHelp.' + row.original.key),
              constrainWidth: false,
            },
          }),
      }),
      permissionColumn.accessor('group', {
        header: this.i18n.text('permissionCategory'),
        cell: ({ getValue }) => this.i18n.text('permissionGroup.' + getValue()),
      }),
    ]);
  });
  constructor() {
    this.query.connect(() => {
      const search = this.query.text('search');
      this.search.sync(search);
      void this.load();
    }, ['search', 'page', 'size', 'sort', 'direction']);
    this.permissionQuery.connect(() => {
      this.permissionSearch.sync(this.permissionQuery.text('search'));
      if (this.editorOpen()) void this.loadPermissions();
    }, ['search', 'page', 'size', 'sort', 'direction']);
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        '/roles',
        {
          pageNumber: this.query.page,
          pageSize: this.pageSize(),
          search: this.query.text('search'),
          sort: this.query.text('sort', 'name'),
          direction: this.query.direction('asc'),
        },
        signal,
      ),
    );
    if (loaded) this.query.clamp(this.data.value()?.roles.total, this.pageSize());
    if (loaded && this.editorOpen() && this.permissionQuery.text('search'))
      void this.loadPermissions();
    return loaded;
  }
  async loadPermissions() {
    const search = this.permissionQuery.text('search').trim();
    const matchingKeys = search
      ? (this.data.value()?.permissions ?? [])
          .filter((permission) =>
            [
              this.i18n.text('permission.' + permission.key),
              this.i18n.text('permissionHelp.' + permission.key),
              this.i18n.text('permissionGroup.' + permission.group),
            ].some((value) => value.toLowerCase().includes(search.toLowerCase())),
          )
          .map((permission) => permission.key)
          .join(',')
      : '';
    const loaded = await this.permissionData.load((signal) =>
      this.api.get<PermissionPage>(
        '/roles/permissions',
        {
          pageNumber: this.permissionQuery.page,
          pageSize: this.permissionPageSize(),
          search,
          matchingKeys,
          sort: this.permissionQuery.text('sort', 'key'),
          direction: this.permissionQuery.direction('asc'),
        },
        signal,
      ),
    );
    if (loaded)
      this.permissionQuery.clamp(this.permissionData.value()?.total, this.permissionPageSize());
    return loaded;
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  pageSize() {
    const size = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
  }
  setPageSize(size: number) {
    void this.query.set({ size, page: 1 });
  }
  sortPermissions(value: ServerSort) {
    void this.permissionQuery.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  permissionPageSize() {
    const size = Number(this.permissionQuery.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
  }
  setPermissionPageSize(size: number) {
    void this.permissionQuery.set({ size, page: 1 });
  }
  selectPermissionRow(permission: PermissionItem) {
    if (!this.permissionRowDisabled(permission))
      this.toggle(permission.key, !this.permissionRowSelected(permission));
  }
  toggle(key: string, on: boolean) {
    this.permissions.update((p) => (on ? [...p, key] : p.filter((x) => x !== key)));
    if (key === 'users.manage' && on && !this.permissions().includes('users.read'))
      this.permissions.update((p) => [...p, 'users.read']);
    if (key === 'users.read' && !on)
      this.permissions.update((p) => p.filter((x) => x !== 'users.manage'));
  }
  hasUnsavedChanges() {
    const role = this.selected();
    return (
      this.editorOpen() &&
      (this.description !== (role?.description ?? '') ||
        (!role?.builtIn &&
          (this.name !== (role?.name ?? '') ||
            [...this.permissions()].sort().join() !== [...(role?.permissions ?? [])].sort().join())))
    );
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  async select(role: RoleItem | null) {
    if (this.hasUnsavedChanges() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
      return;
    this.apply(role);
  }
  private apply(role: RoleItem | null) {
    this.selected.set(role);
    this.name = role?.name ?? '';
    this.description = role?.description ?? '';
    this.permissions.set([...(role?.permissions ?? [])]);
    this.conflict.set(false);
    this.editorOpen.set(true);
    void this.loadPermissions();
  }
  async close() {
    if (this.hasUnsavedChanges() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
      return;
    this.editorOpen.set(false);
  }
  drawerStateChanged(state: 'open' | 'closed') {
    if (state === 'closed') this.editorOpen.set(false);
  }
  async discard() {
    if (!(await this.confirm.ask('unsavedTitle', 'unsavedHelp'))) return;
    if (!(await this.load())) return;
    this.apply(this.data.value()?.roles.items.find((r) => r.id === this.selected()?.id) ?? null);
  }
  async save() {
    if (this.busy() || this.conflict()) return;
    if (
      !(await this.confirm.ask(
        'saveRole',
        this.selected()?.builtIn ? 'roleDescriptionChangeConsequence' : 'roleChangeConsequence',
        this.name,
      ))
    )
      return;
    this.busy.set(true);
    try {
      const role = this.selected();
      const body = {
        name: this.name.trim(),
        description: this.description.trim(),
        permissions: this.permissions(),
        version: role?.version,
      };
      const url = this.runtime.apiUrl + '/api/v1/roles';
      const value = await firstValueFrom(
        role
          ? this.http.put<RoleItem>(url + '/' + role.id, body)
          : this.http.post<RoleItem>(url, body),
      );
      this.apply(value);
      this.toast.success('roleSaved');
      await this.load();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) this.conflict.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}

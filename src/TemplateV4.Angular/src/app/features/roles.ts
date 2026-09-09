import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
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
} from '../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';
import { RecordIdentity, RecordStatus } from '../shared/workspace-cells';
import { WorkspaceApi } from '../core/workspace-api';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { AccessCatalog, RoleItem } from '../api/models';
const column = createColumnHelper<DataTableFeatures, RoleItem>();
@Component({
  selector: 'app-roles-panel',
  imports: [WorkspaceUi, DataTable, HlmCheckboxImports, HlmDrawerImports],
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
      [disableClose]="hasUnsavedChanges()"
      (stateChanged)="drawerStateChanged($event)"
    >
      <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-xl">
        <hlm-drawer-header>
          <h2 hlmDrawerTitle>
            {{ (selected()?.builtIn ? 'viewRole' : selected() ? 'editRole' : 'createRole') | t }}
          </h2>
          <p hlmDrawerDescription>
            {{ (selected()?.builtIn ? 'builtInRoleHelp' : 'delegationHelp') | t }}
          </p>
        </hlm-drawer-header>
        <form class="flex min-h-0 flex-1 flex-col" #form="ngForm" (ngSubmit)="form.valid && save()">
          <div hlmDrawerBody class="grid min-h-0 flex-1 gap-5 overflow-y-auto">
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
              ><input
                hlmInput
                id="role-description"
                name="description"
                [(ngModel)]="description"
                maxlength="240"
                [disabled]="selected()?.builtIn || busy()"
              />
            </div>
            <div hlmField>
              <label hlmFieldLabel for="permission-search">{{ 'findPermission' | t }}</label
              ><input
                hlmInput
                id="permission-search"
                name="permissionSearch"
                [(ngModel)]="permissionSearch"
              />
            </div>
            @for (group of groups(); track group) {
              <fieldset hlmFieldSet>
                <legend hlmFieldLegend>{{ 'permissionGroup.' + group | t }}</legend>
                @for (permission of groupPermissions(group); track permission.key) {
                  <label
                    hlmFieldLabel
                    [for]="'permission-' + permission.key"
                    class="cursor-pointer has-[[data-disabled]]:cursor-not-allowed"
                  >
                    <div hlmField orientation="horizontal">
                      <hlm-checkbox
                        [inputId]="'permission-' + permission.key"
                        [checked]="permissions().includes(permission.key)"
                        [disabled]="selected()?.builtIn || !auth.has(permission.key) || busy()"
                        (checkedChange)="toggle(permission.key, $event)"
                      />
                      <div hlmFieldContent>
                        <span hlmFieldTitle>{{ 'permission.' + permission.key | t }}</span>
                        <p hlmFieldDescription>{{ 'permissionHelp.' + permission.key | t }}</p>
                      </div>
                    </div>
                  </label>
                }
              </fieldset>
            }
            @if (conflict()) {
              <div hlmAlert role="alert">
                <p hlmAlertDescription>{{ 'draftConflict' | t }}</p>
                <button hlmBtn variant="outline" type="button" (click)="discard()">
                  {{ 'discardDraft' | t }}
                </button>
              </div>
            }
          </div>
          <hlm-drawer-footer>
            @if (!selected()?.builtIn) {
              <button
                hlmBtn
                [disabled]="form.invalid || busy() || conflict() || !hasUnsavedChanges()"
              >
                {{ 'saveRole' | t }}
              </button>
            }
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
  readonly selected = signal<RoleItem | null>(null);
  readonly editorOpen = signal(false);
  readonly permissions = signal<string[]>([]);
  readonly query = new ListQuery('role');
  readonly search = new DebouncedSearch(this.query);
  readonly busy = signal(false);
  readonly conflict = signal(false);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private readonly toast = inject(Notifications);
  private readonly confirm = inject(Confirmations);
  name = '';
  description = '';
  permissionSearch = '';
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
  readonly groups = computed(() => [
    ...new Set(this.data.value()?.permissions.map((p) => p.group) ?? []),
  ]);
  constructor() {
    this.query.connect(() => {
      const search = this.query.text('search');
      this.search.sync(search);
      void this.load();
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
  groupPermissions(group: string) {
    return (
      this.data.value()?.permissions.filter(
        (p) =>
          p.group === group &&
          this.i18n
            .text('permission.' + p.key)
            .toLowerCase()
            .includes(this.permissionSearch.toLowerCase()),
      ) ?? []
    );
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
      !role?.builtIn &&
      (this.name !== (role?.name ?? '') ||
        this.description !== (role?.description ?? '') ||
        [...this.permissions()].sort().join() !== [...(role?.permissions ?? [])].sort().join())
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
    this.permissionSearch = '';
    this.conflict.set(false);
    this.editorOpen.set(true);
  }
  async close() {
    if (this.hasUnsavedChanges() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
      return;
    this.editorOpen.set(false);
  }
  drawerStateChanged(state: 'open' | 'closed') {
    if (state === 'closed' && !this.hasUnsavedChanges()) this.editorOpen.set(false);
  }
  async discard() {
    if (!(await this.confirm.ask('unsavedTitle', 'unsavedHelp'))) return;
    if (!(await this.load())) return;
    this.apply(this.data.value()?.roles.items.find((r) => r.id === this.selected()?.id) ?? null);
  }
  async save() {
    if (this.busy() || this.selected()?.builtIn || this.conflict()) return;
    if (!(await this.confirm.ask('saveRole', 'roleChangeConsequence', this.name))) return;
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

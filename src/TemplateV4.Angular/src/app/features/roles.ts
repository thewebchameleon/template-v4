import { Component, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { WorkspaceUi, Resource, Confirmations, protectUnload } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { AccessCatalog, RoleItem } from '../api/models';
@Component({
  selector: 'app-roles',
  imports: [WorkspaceUi, HlmCheckboxImports],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header
      title="rolesPermissions"
      description="rolesIntro"
      eyebrow="administration"
      ><button hlmBtn (click)="select(null)">{{ 'createRole' | t }}</button></app-page-header
    >
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="load()"
      ><div class="workspace-columns">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'roles' | t }}</h2>
          </div>
          <div hlmCardContent class="grid gap-4">
            <div hlmField>
              <label hlmFieldLabel for="role-search">{{ 'search' | t }}</label
              ><input
                hlmInput
                id="role-search"
                [ngModel]="search()"
                (ngModelChange)="search.set($event)"
              />
            </div>
            @for (role of filtered(); track role.id) {
              <button
                hlmBtn
                variant="outline"
                class="h-auto justify-between gap-4 whitespace-normal py-4 text-left"
                (click)="select(role)"
              >
                <span
                  ><span class="block font-semibold">{{ role.name }}</span
                  ><span class="block text-xs text-muted-foreground">{{
                    role.description || (role.builtIn ? ('builtInRoleHelp' | t) : '')
                  }}</span></span
                ><span class="shrink-0 text-xs"
                  >{{ i18n.number(role.members) }} {{ 'members' | t }}
                  @if (role.builtIn) {
                    · {{ 'builtIn' | t }}
                  }
                </span>
              </button>
            } @empty {
              <p class="workspace-meta">{{ 'empty' | t }}</p>
            }
          </div>
        </section>
        @if (editorOpen()) {
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>
                {{
                  (selected()?.builtIn ? 'viewRole' : selected() ? 'editRole' : 'createRole') | t
                }}
              </h2>
              <p hlmCardDescription>
                {{ (selected()?.builtIn ? 'builtInRoleHelp' : 'delegationHelp') | t }}
              </p>
            </div>
            <form
              hlmCardContent
              class="grid gap-5"
              #form="ngForm"
              (ngSubmit)="form.valid && save()"
            >
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
                    <div hlmField orientation="horizontal">
                      <hlm-checkbox
                        [inputId]="'permission-' + permission.key"
                        [checked]="permissions().includes(permission.key)"
                        [disabled]="selected()?.builtIn || !auth.has(permission.key) || busy()"
                        (checkedChange)="toggle(permission.key, $event)"
                      />
                      <div>
                        <label hlmFieldLabel [for]="'permission-' + permission.key">{{
                          'permission.' + permission.key | t
                        }}</label>
                        <p hlmFieldDescription>{{ 'permissionHelp.' + permission.key | t }}</p>
                      </div>
                    </div>
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
              <div class="flex gap-2">
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
              </div>
            </form>
          </section>
        } @else {
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'effectivePermissions' | t }}</h2>
              <p hlmCardDescription>{{ 'rolesSelectionHelp' | t }}</p>
            </div>
          </section>
        }
      </div></app-page-state
    >`,
})
export class RolesPage {
  readonly api = inject(WorkspaceApi);
  readonly auth = inject(Auth);
  readonly i18n = inject(I18n);
  readonly data = new Resource<AccessCatalog>();
  readonly selected = signal<RoleItem | null>(null);
  readonly editorOpen = signal(false);
  readonly permissions = signal<string[]>([]);
  readonly search = signal('');
  readonly busy = signal(false);
  readonly conflict = signal(false);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private readonly toast = inject(Notifications);
  private readonly confirm = inject(Confirmations);
  name = '';
  description = '';
  permissionSearch = '';
  readonly filtered = computed(
    () =>
      this.data
        .value()
        ?.roles.filter((r) =>
          (r.name + ' ' + r.description).toLowerCase().includes(this.search().toLowerCase()),
        ) ?? [],
  );
  readonly groups = computed(() => [
    ...new Set(this.data.value()?.permissions.map((p) => p.group) ?? []),
  ]);
  constructor() {
    void this.load();
  }
  load() {
    return this.data.load((signal) => this.api.get('/roles', {}, signal));
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
  async discard() {
    if (!(await this.confirm.ask('unsavedTitle', 'unsavedHelp'))) return;
    if (!(await this.load())) return;
    this.apply(this.data.value()?.roles.find((r) => r.id === this.selected()?.id) ?? null);
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

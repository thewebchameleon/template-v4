import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  Confirmations,
  protectUnload,
} from '../shared/workspace';
import { Breadcrumbs } from '../shared/breadcrumbs';
import { WorkspaceApi } from '../core/workspace-api';
import { Runtime } from '../core/runtime';
import { Auth } from '../core/auth';
import { Notifications } from '../core/notifications';
import { AccessCatalog, UserAccessDetail } from '../api/models';
@Component({
  selector: 'app-user-detail',
  imports: [WorkspaceUi, HlmCheckboxImports],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header
      title="personDetails"
      description="personDetailsHelp"
      eyebrow="administration"
      ><a hlmBtn variant="outline" routerLink="/users"
        ><ng-icon name="lucideArrowLeft" />{{ 'users' | t }}</a
      ></app-page-header
    >
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="load()"
    >
      @if (data.value(); as detail) {
        <div class="workspace-columns">
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ detail.user.displayName }}</h2>
              <p hlmCardDescription>{{ detail.user.email }}</p>
            </div>
            <form hlmCardContent class="grid gap-5" (ngSubmit)="save()">
              <fieldset hlmFieldSet>
                <legend hlmFieldLegend>{{ 'roles' | t }}</legend>
                <p hlmFieldDescription>{{ 'assignmentHelp' | t }}</p>
                @for (role of catalog.value()?.roles.items ?? []; track role.id) {
                  <div hlmField orientation="horizontal">
                    <hlm-checkbox
                      [inputId]="'role-' + role.id"
                      [checked]="roles().includes(role.name)"
                      [disabled]="!editable() || !canAssign(role.permissions) || busy()"
                      (checkedChange)="toggle(role.name, $event)"
                    /><label hlmFieldLabel [for]="'role-' + role.id">{{ role.name }}</label>
                  </div>
                }
              </fieldset>
              @if (catalog.state() === 'error') {
                <div hlmAlert>
                  <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
                  <button hlmBtn type="button" variant="outline" (click)="load()">
                    {{ 'retry' | t }}
                  </button>
                </div>
              }
              <div hlmField orientation="horizontal">
                <hlm-switch
                  inputId="disabled-user"
                  [checked]="disabled()"
                  [disabled]="!editable() || busy()"
                  (checkedChange)="disabled.set($event)"
                /><label hlmFieldLabel for="disabled-user">{{ 'disabled' | t }}</label>
              </div>
              @if (!editable()) {
                <p class="workspace-meta">{{ 'accessReadOnly' | t }}</p>
              }
              @if (conflict()) {
                <div hlmAlert role="alert">
                  <p hlmAlertDescription>{{ 'draftConflict' | t }}</p>
                  <button hlmBtn type="button" variant="outline" (click)="reloadDraft()">
                    {{ 'discardDraft' | t }}
                  </button>
                </div>
              }
              <div>
                <button
                  hlmBtn
                  [disabled]="busy() || !editable() || !hasUnsavedChanges() || conflict()"
                >
                  {{ 'saveAccess' | t }}
                </button>
              </div>
            </form>
          </section>
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'effectivePermissions' | t }}</h2>
              <p hlmCardDescription>{{ 'effectivePermissionsHelp' | t }}</p>
            </div>
            <div hlmCardContent class="grid gap-4">
              @for (permission of detail.effectivePermissions; track permission) {
                <div>
                  <p class="font-medium">{{ 'permission.' + permission | t }}</p>
                  <p class="workspace-meta">{{ sources(permission) }}</p>
                </div>
              } @empty {
                <p class="workspace-meta">{{ 'noAdministrativePermissions' | t }}</p>
              }
            </div>
            @if (auth.has('settings.manage')) {
              <div hlmCardFooter>
                <a
                  hlmBtn
                  variant="outline"
                  routerLink="/audit"
                  [queryParams]="{
                    subjectId: detail.user.id,
                    subjectName: detail.user.displayName,
                  }"
                  >{{ 'viewAudit' | t }}</a
                >
              </div>
            }
          </section>
        </div>
      }
    </app-page-state>`,
})
export class UserDetailPage {
  readonly api = inject(WorkspaceApi);
  readonly auth = inject(Auth);
  readonly data = new Resource<UserAccessDetail>();
  readonly catalog = new Resource<AccessCatalog>();
  readonly roles = signal<string[]>([]);
  readonly disabled = signal(false);
  readonly busy = signal(false);
  readonly conflict = signal(false);
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id')!;
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private readonly toast = inject(Notifications);
  private readonly confirm = inject(Confirmations);
  private readonly breadcrumbs = inject(Breadcrumbs);
  readonly editable = computed(
    () =>
      this.auth.has('users.manage') &&
      this.auth.access()?.userId !== this.id &&
      this.catalog.state() === 'ready' &&
      (this.data.value()?.effectivePermissions.every((p) => this.auth.has(p)) ?? false),
  );
  constructor() {
    void this.load();
  }
  async load() {
    const [loaded] = await Promise.all([
      this.data.load((signal) => this.api.get('/users/' + this.id, {}, signal)),
      this.catalog.load((signal) => this.api.get('/roles', { pageSize: 100 }, signal)),
    ]);
    const value = this.data.value();
    if (value && loaded) {
      this.roles.set([...value.user.roles]);
      this.disabled.set(value.user.disabled);
      this.conflict.set(false);
      this.breadcrumbs.set([{ label: 'users', link: '/users' }, { label: value.user.displayName }]);
    }
  }
  sources(permission: string) {
    return (
      this.data
        .value()
        ?.roles.filter((r) => r.permissions.includes(permission))
        .map((r) => r.name)
        .join(', ') ?? ''
    );
  }
  canAssign(permissions: string[]) {
    return permissions.every((p) => this.auth.has(p));
  }
  toggle(role: string, on: boolean) {
    this.roles.update((roles) => (on ? [...roles, role] : roles.filter((r) => r !== role)));
  }
  hasUnsavedChanges() {
    const user = this.data.value()?.user;
    return (
      !!user &&
      (this.disabled() !== user.disabled ||
        [...this.roles()].sort().join() !== [...user.roles].sort().join())
    );
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  async reloadDraft() {
    if (await this.confirm.ask('unsavedTitle', 'unsavedHelp')) await this.load();
  }
  async save() {
    const user = this.data.value()?.user;
    if (!user || this.busy() || !this.editable() || !this.hasUnsavedChanges()) return;
    if (
      !(await this.confirm.ask(
        'saveAccess',
        'accessChangeConsequence',
        user.displayName,
        this.disabled(),
      ))
    )
      return;
    this.busy.set(true);
    try {
      await firstValueFrom(
        this.http.put(this.runtime.apiUrl + '/api/v1/users/' + this.id, {
          id: this.id,
          version: user.version,
          roles: this.roles(),
          disabled: this.disabled(),
        }),
      );
      this.toast.success('rolesSaved');
      await this.load();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) this.conflict.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}

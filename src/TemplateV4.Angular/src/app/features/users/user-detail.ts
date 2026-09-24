import { Component, computed, inject, input, output, signal, OnInit } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { createColumnHelper } from '@tanstack/angular-table';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  Confirmations,
  protectUnload,
} from '../../shared/workspace';
import { Breadcrumbs } from '../../shared/breadcrumbs';
import { DataTable, DataTableFeatures } from '../../shared/data-table';
import { WorkspaceApi } from '../../core/workspace-api';
import { Runtime } from '../../core/runtime';
import { Auth } from '../../core/auth';
import { I18n } from '../../core/i18n';
import { Notifications } from '../notifications/notifications';
import { AccessCatalog, UserAccessDetail } from '../../api/models';
interface EffectivePermissionRow {
  key: string;
  roles: string;
}
const permissionColumn = createColumnHelper<DataTableFeatures, EffectivePermissionRow>();
@Component({
  selector: 'app-user-detail',
  imports: [WorkspaceUi, HlmCheckboxImports, NgTemplateOutlet, DataTable],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` @if (!embedded()) {
      <app-page-header title="personDetails" description="personDetailsHelp"
        ><a hlmBtn variant="outline" routerLink="/user-management/users"
          ><ng-icon name="lucideArrowLeft" />{{ 'users' | t }}</a
        ></app-page-header
      >
    }
    <app-page-state
      [state]="data.state()"
      skeleton="detail"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="load()"
    >
      @if (data.value(); as detail) {
        <ng-template #accessFields>
          <fieldset hlmFieldSet>
            <legend hlmFieldLegend>{{ 'roles' | t }}</legend>
            <p hlmFieldDescription>{{ 'assignmentHelp' | t }}</p>
            @for (role of catalog.value()?.roles.items ?? []; track role.id) {
              <label
                hlmFieldLabel
                [for]="'role-' + role.id"
                class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
              >
                <div hlmField orientation="horizontal">
                  <hlm-checkbox
                    [inputId]="'role-' + role.id"
                    [checked]="roles().includes(role.name)"
                    [disabled]="!editable() || !canAssign(role.permissions) || busy()"
                    (checkedChange)="toggle(role.name, $event)"
                  /><span>{{ role.name }}</span>
                </div>
              </label>
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
          <label
            hlmFieldLabel
            for="disabled-user"
            class="cursor-pointer has-[[data-disabled=true]]:cursor-not-allowed"
          >
            <div hlmField orientation="horizontal">
              <hlm-switch
                inputId="disabled-user"
                [checked]="disabled()"
                [disabled]="!editable() || busy()"
                (checkedChange)="disabled.set($event)"
              /><span>{{ 'disabled' | t }}</span>
            </div>
          </label>
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
        </ng-template>
        <ng-template #permissionList>
          <div class="min-w-0 [&_td]:whitespace-normal [&_td]:break-words">
            <app-data-table
              [columns]="permissionColumns()"
              [data]="permissionRows()"
              [emptyText]="'noAdministrativePermissions' | t"
              [ariaLabel]="'effectivePermissions' | t"
              sortColumn="none"
              sortDirection="asc"
              [getRowId]="permissionRowId"
            />
          </div>
        </ng-template>
        <ng-template #auditLink>
          @if (auth.has('settings.manage')) {
            <a
              hlmBtn
              variant="outline"
              routerLink="/administration/audit-history"
              [queryParams]="{
                subjectId: detail.user.id,
                subjectName: detail.user.displayName,
              }"
              >{{ 'viewAudit' | t }}</a
            >
          }
        </ng-template>
        @if (embedded()) {
          <div class="grid min-w-0 content-start gap-6">
            <div class="grid gap-1">
              <h3 class="break-words font-medium">{{ detail.user.displayName }}</h3>
              <p class="workspace-meta break-words">{{ detail.user.email }}</p>
            </div>
            @if (detail.user.status === 'Invited' && editable()) {
              <button
                hlmBtn
                type="button"
                variant="outline"
                class="justify-self-start"
                [disabled]="busy()"
                (click)="resendInvitation()"
              >
                {{ 'resendInvitation' | t }}
              </button>
            }
            <form class="grid gap-5" (ngSubmit)="save()">
              <ng-container [ngTemplateOutlet]="accessFields" />
            </form>
            <section class="grid gap-4" aria-labelledby="user-effective-permissions">
              <div class="grid gap-1">
                <h3 id="user-effective-permissions" class="font-medium">
                  {{ 'effectivePermissions' | t }}
                </h3>
                <p class="workspace-meta">{{ 'effectivePermissionsHelp' | t }}</p>
              </div>
              <ng-container [ngTemplateOutlet]="permissionList" />
              @if (auth.has('settings.manage')) {
                <div class="justify-self-start"><ng-container [ngTemplateOutlet]="auditLink" /></div>
              }
            </section>
          </div>
        } @else {
          <div class="workspace-columns">
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle class="break-words">{{ detail.user.displayName }}</h2>
                <p hlmCardDescription class="break-words">{{ detail.user.email }}</p>
              </div>
              <form hlmCardContent class="grid gap-5" (ngSubmit)="save()">
                <ng-container [ngTemplateOutlet]="accessFields" />
                <div>
                  <button hlmBtn [disabled]="!canSave()">{{ 'saveAccess' | t }}</button>
                </div>
              </form>
            </section>
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'effectivePermissions' | t }}</h2>
                <p hlmCardDescription>{{ 'effectivePermissionsHelp' | t }}</p>
              </div>
              <div hlmCardContent class="grid gap-4">
                <ng-container [ngTemplateOutlet]="permissionList" />
              </div>
              @if (auth.has('settings.manage')) {
                <div hlmCardFooter><ng-container [ngTemplateOutlet]="auditLink" /></div>
              }
            </section>
          </div>
        }
      }
    </app-page-state>`,
})
export class UserDetailPage implements OnInit {
  readonly userId = input<string>();
  readonly embedded = input(false);
  readonly saved = output<void>();
  readonly api = inject(WorkspaceApi);
  readonly auth = inject(Auth);
  readonly i18n = inject(I18n);
  readonly data = new Resource<UserAccessDetail>();
  readonly catalog = new Resource<AccessCatalog>();
  readonly roles = signal<string[]>([]);
  readonly disabled = signal(false);
  readonly busy = signal(false);
  readonly conflict = signal(false);
  private readonly route = inject(ActivatedRoute);
  private readonly id = computed(() => this.userId() ?? this.route.snapshot.paramMap.get('id')!);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private readonly toast = inject(Notifications);
  private readonly confirm = inject(Confirmations);
  private readonly breadcrumbs = inject(Breadcrumbs);
  readonly editable = computed(
    () =>
      this.auth.has('users.manage') &&
      this.auth.access()?.userId !== this.id() &&
      this.catalog.state() === 'ready' &&
      (this.data.value()?.effectivePermissions.every((p) => this.auth.has(p)) ?? false),
  );
  readonly canSave = computed(
    () => !this.busy() && this.editable() && this.hasUnsavedChanges() && !this.conflict(),
  );
  readonly permissionRowId = (row: EffectivePermissionRow) => row.key;
  readonly permissionRows = computed(() =>
    (this.data.value()?.effectivePermissions ?? []).map((key) => ({
      key,
      roles: this.sources(key),
    })),
  );
  readonly permissionColumns = computed(() => {
    this.i18n.culture();
    return permissionColumn.columns([
      permissionColumn.accessor('key', {
        header: this.i18n.text('permissionName'),
        cell: (cell) => this.i18n.text('permission.' + cell.getValue()),
        enableSorting: false,
      }),
      permissionColumn.accessor('roles', {
        header: this.i18n.text('roles'),
        enableSorting: false,
      }),
    ]);
  });
  ngOnInit() {
    void this.load();
  }
  async load() {
    const [loaded] = await Promise.all([
      this.data.load((signal) => this.api.get('/users/' + this.id(), {}, signal)),
      this.catalog.load((signal) => this.api.get('/roles', { pageSize: 100 }, signal)),
    ]);
    const value = this.data.value();
    if (value && loaded) {
      this.roles.set([...value.user.roles]);
      this.disabled.set(value.user.disabled);
      this.conflict.set(false);
      if (!this.embedded())
        this.breadcrumbs.set([
          { label: 'userManagement', link: '/user-management/users' },
          { label: value.user.displayName },
        ]);
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
  async resendInvitation() {
    const user = this.data.value()?.user;
    if (!user || user.status !== 'Invited' || this.busy() || !this.editable()) return;
    this.busy.set(true);
    try {
      await this.api.post('invitations', { userId: user.id, cancel: false });
      this.toast.success('invitationSent');
      this.saved.emit();
    } catch {
      /* Central notification preserves server feedback. */
    } finally {
      this.busy.set(false);
    }
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
        this.http.put(this.runtime.apiUrl + '/api/v1/users/' + this.id(), {
          id: this.id(),
          version: user.version,
          roles: this.roles(),
          disabled: this.disabled(),
        }),
      );
      this.toast.success('rolesSaved');
      await this.load();
      this.saved.emit();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) this.conflict.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}

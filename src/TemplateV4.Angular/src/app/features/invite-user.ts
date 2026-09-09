import { Component, inject, output, signal, viewChild } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { WorkspaceUi, Resource, protectUnload, workspaceIcons } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { I18n } from '../core/i18n';
import { Notifications } from '../core/notifications';
import { IDEMPOTENCY_KEY } from '../core/interceptors';
import { createUser } from '../api/fn/framework/create-user';
import { AccessCatalog } from '../api/models';
@Component({
  selector: 'app-invitation-editor',
  imports: [WorkspaceUi, HlmCheckboxImports, HlmDrawerImports, HlmSelectImports],
  template: `
    <form class="flex min-h-0 flex-1 flex-col" #form="ngForm" (ngSubmit)="form.valid && invite()">
      <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
        <app-page-state [state]="catalog.state()" (retry)="load()">
          <div class="grid gap-5">
            <div hlmField>
              <label hlmFieldLabel for="invite-name">{{ 'name' | t }}</label
              ><input
                hlmInput
                id="invite-name"
                name="name"
                [(ngModel)]="name"
                [placeholder]="'name' | t"
                required
                maxlength="120"
              />
            </div>
            <div hlmField>
              <label hlmFieldLabel for="invite-email">{{ 'email' | t }}</label
              ><input
                hlmInput
                id="invite-email"
                name="email"
                type="email"
                email
                [(ngModel)]="email"
                [placeholder]="'email' | t"
                required
                maxlength="254"
              />
            </div>
            <fieldset hlmFieldSet>
              <legend hlmFieldLegend>{{ 'roles' | t }}</legend>
              <p hlmFieldDescription>{{ 'assignmentHelp' | t }}</p>
              <div hlmFieldGroup data-slot="checkbox-group">
                @for (role of catalog.value()?.roles.items ?? []; track role.id) {
                  <label hlmFieldLabel [for]="'invite-role-' + role.id">
                    <div hlmField orientation="horizontal" style="align-items: center">
                      <hlm-checkbox
                        class="disabled:cursor-default"
                        style="margin-top: 0"
                        [inputId]="'invite-role-' + role.id"
                        [checked]="roles.includes(role.name)"
                        [disabled]="!canAssign(role.permissions) || busy()"
                        (checkedChange)="toggle(role.name, $event)"
                      />
                      <div hlmFieldContent>
                        <span hlmFieldTitle>{{ role.name }}</span>
                        <p hlmFieldDescription>{{ role.description }}</p>
                      </div>
                    </div>
                  </label>
                }
              </div>
            </fieldset>
            <div hlmField>
              <label hlmFieldLabel for="invite-language">{{ 'culture' | t }}</label>
              <hlm-select
                name="culture"
                [value]="culture"
                [itemToString]="cultureLabel"
                (valueChange)="culture = $event ?? culture"
              >
                <hlm-select-trigger buttonId="invite-language" class="w-full">
                  <hlm-select-value />
                </hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal [ariaLabel]="'culture' | t">
                  @for (supportedCulture of runtime.supportedCultures; track supportedCulture) {
                    <hlm-select-item [value]="supportedCulture">
                      {{ cultureLabel(supportedCulture) }}
                    </hlm-select-item>
                  }
                </hlm-select-content>
              </hlm-select>
            </div>
          </div>
        </app-page-state>
      </div>
      <hlm-drawer-footer>
        <button hlmBtn [disabled]="busy() || form.invalid || catalog.state() !== 'ready'">
          @if (busy()) {
            <hlm-spinner />
          }
          {{ 'invite' | t }}
        </button>
      </hlm-drawer-footer>
    </form>
  `,
})
export class InvitationEditor {
  readonly api = inject(WorkspaceApi);
  readonly auth = inject(Auth);
  readonly catalog = new Resource<AccessCatalog>();
  readonly busy = signal(false);
  readonly invited = output<void>();
  readonly runtime = inject(Runtime);
  private readonly http = inject(HttpClient);
  private readonly toast = inject(Notifications);
  name = '';
  email = '';
  roles = ['Reader'];
  culture = inject(I18n).culture();
  private key = crypto.randomUUID();
  private fingerprint = '';
  readonly cultureLabel = (culture: string) => (culture === 'af-ZA' ? 'Afrikaans' : 'English');
  constructor() {
    void this.load();
  }
  load() {
    return this.catalog.load((signal) => this.api.get('/roles', { pageSize: 100 }, signal));
  }
  canAssign(permissions: string[]) {
    return permissions.every((p) => this.auth.has(p));
  }
  toggle(role: string, on: boolean) {
    this.roles = on ? [...this.roles, role] : this.roles.filter((r) => r !== role);
  }
  hasUnsavedChanges() {
    return !!(this.name || this.email || this.roles.join() !== 'Reader');
  }
  async invite() {
    if (this.busy()) return;
    this.busy.set(true);
    const fingerprint = JSON.stringify([this.name, this.email, this.roles, this.culture]);
    if (fingerprint !== this.fingerprint) {
      this.key = crypto.randomUUID();
      this.fingerprint = fingerprint;
    }
    try {
      await firstValueFrom(
        createUser(
          this.http,
          this.runtime.apiUrl,
          {
            body: {
              displayName: this.name.trim(),
              email: this.email.trim(),
              roles: this.roles,
              culture: this.culture,
            },
          },
          new HttpContext().set(IDEMPOTENCY_KEY, this.key),
        ),
      );
      this.name = '';
      this.email = '';
      this.roles = ['Reader'];
      this.toast.success('invitationSent');
      this.invited.emit();
    } catch {
      /* retain draft and retry key */
    } finally {
      this.busy.set(false);
    }
  }
}

@Component({
  selector: 'app-invitation-drawer',
  imports: [WorkspaceUi, HlmDrawerImports, InvitationEditor],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `
    <hlm-drawer
      direction="right"
      [state]="open() ? 'open' : 'closed'"
      (stateChanged)="open.set($event === 'open')"
    >
      <button hlmBtn hlmDrawerTrigger><ng-icon name="lucidePlus" />{{ 'invite' | t }}</button>
      <hlm-drawer-content
        *hlmDrawerPortal
        class="overflow-hidden sm:max-w-lg"
        [attr.aria-label]="'invite' | t"
      >
        <hlm-drawer-header>
          <h2 hlmDrawerTitle>{{ 'invite' | t }}</h2>
          <p hlmDrawerDescription>{{ 'inviteHelp' | t }}</p>
        </hlm-drawer-header>
        <app-invitation-editor class="flex min-h-0 flex-1 flex-col" (invited)="complete()" />
      </hlm-drawer-content>
    </hlm-drawer>
  `,
})
export class InvitationDrawer {
  readonly invited = output<void>();
  readonly open = signal(false);
  private readonly editor = viewChild(InvitationEditor);

  hasUnsavedChanges() {
    return this.open() && (this.editor()?.hasUnsavedChanges() ?? false);
  }

  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }

  complete() {
    this.open.set(false);
    this.invited.emit();
  }
}

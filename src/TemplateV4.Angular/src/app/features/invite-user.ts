import { Component, inject, output, signal, viewChild } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { WorkspaceUi, Resource, protectUnload } from '../shared/workspace';
import { PeopleNav } from '../shared/people-nav';
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
  imports: [WorkspaceUi, HlmCheckboxImports],
  template: ` <app-page-state [state]="catalog.state()" (retry)="load()">
    <form class="grid gap-5" #form="ngForm" (ngSubmit)="form.valid && invite()">
      <div hlmField>
        <label hlmFieldLabel for="invite-name">{{ 'name' | t }}</label
        ><input hlmInput id="invite-name" name="name" [(ngModel)]="name" required maxlength="120" />
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
          required
          maxlength="254"
        />
      </div>
      <fieldset hlmFieldSet>
        <legend hlmFieldLegend>{{ 'roles' | t }}</legend>
        <p hlmFieldDescription>{{ 'assignmentHelp' | t }}</p>
        @for (role of catalog.value()?.roles.items ?? []; track role.id) {
          <div hlmField orientation="horizontal">
            <hlm-checkbox
              [inputId]="'invite-role-' + role.id"
              [checked]="roles.includes(role.name)"
              [disabled]="!canAssign(role.permissions) || busy()"
              (checkedChange)="toggle(role.name, $event)"
            /><label hlmFieldLabel [for]="'invite-role-' + role.id">{{ role.name }}</label>
          </div>
        }
      </fieldset>
      <fieldset hlmFieldSet>
        <legend hlmFieldLegend>{{ 'culture' | t }}</legend>
        <hlm-tabs [tab]="culture" (tabActivated)="culture = $event">
          <hlm-tabs-list [attr.aria-label]="'culture' | t">
            <button hlmTabsTrigger="en-ZA">English</button>
            <button hlmTabsTrigger="af-ZA">Afrikaans</button>
          </hlm-tabs-list>
        </hlm-tabs>
      </fieldset>
      <div class="flex gap-3">
        <button hlmBtn [disabled]="busy() || form.invalid">{{ 'invite' | t }}</button
        ><button
          hlmBtn
          type="button"
          variant="outline"
          [disabled]="busy()"
          (click)="cancelled.emit()"
        >
          {{ 'cancel' | t }}
        </button>
      </div>
    </form></app-page-state
  >`,
})
export class InvitationEditor {
  readonly api = inject(WorkspaceApi);
  readonly auth = inject(Auth);
  readonly catalog = new Resource<AccessCatalog>();
  readonly busy = signal(false);
  readonly invited = output<void>();
  readonly cancelled = output<void>();
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private readonly toast = inject(Notifications);
  name = '';
  email = '';
  roles = ['Reader'];
  culture = inject(I18n).culture();
  private key = crypto.randomUUID();
  private fingerprint = '';
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
  selector: 'app-invite-user',
  imports: [WorkspaceUi, PeopleNav, InvitationEditor],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header
      title="invite"
      description="inviteHelp"
      eyebrow="administration"
    /><app-people-nav />
    <section hlmCard class="max-w-(--form-content-width)">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'person' | t }}</h2>
      </div>
      <div hlmCardContent>
        <app-invitation-editor
          (invited)="returnToInvitations()"
          (cancelled)="returnToInvitations()"
        />
      </div>
    </section>`,
})
export class InviteUserPage {
  private readonly router = inject(Router);
  private readonly editor = viewChild(InvitationEditor);

  hasUnsavedChanges() {
    return this.editor()?.hasUnsavedChanges() ?? false;
  }

  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }

  returnToInvitations() {
    return this.router.navigateByUrl('/users/invitations');
  }
}

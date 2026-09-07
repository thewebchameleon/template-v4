import { Component, inject, signal } from '@angular/core';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { WorkspaceUi, workspaceIcons, Resource, protectUnload } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { Notifications } from '../core/notifications';
import { ProfileResponse } from '../api/models';
@Component({
  selector: 'app-account-home',
  imports: [WorkspaceUi, HlmCheckboxImports],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header title="account" description="accountIntro"
      ><a hlmBtn variant="outline" routerLink="/security"
        ><ng-icon name="lucideShieldCheck" />{{ 'security' | t }}</a
      ></app-page-header
    >
    <app-page-state [state]="data.state()" (retry)="load()"
      ><div class="max-w-(--form-content-width) grid gap-6">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ data.value()?.displayName }}</h2>
            <p hlmCardDescription>{{ data.value()?.email }}</p>
          </div>
        </section>
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'changeEmail' | t }}</h2>
            <p hlmCardDescription>{{ 'changeEmailHelp' | t }}</p>
          </div>
          <form
            hlmCardContent
            class="grid gap-5"
            #emailForm="ngForm"
            (ngSubmit)="emailForm.valid && changeEmail()"
          >
            <div hlmField>
              <label hlmFieldLabel for="new-email">{{ 'newEmail' | t }}</label
              ><input
                hlmInput
                id="new-email"
                name="email"
                type="email"
                autocomplete="email"
                email
                required
                maxlength="254"
                [(ngModel)]="email"
                #emailControl="ngModel"
              />
              @if (emailControl.invalid && emailControl.touched) {
                <hlm-field-error forceShow>{{ 'emailInvalid' | t }}</hlm-field-error>
              }
            </div>
            <div class="grid gap-5 sm:grid-cols-2">
              <div hlmField>
                <label hlmFieldLabel for="email-password">{{ 'currentPassword' | t }}</label
                ><input
                  hlmInput
                  id="email-password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  maxlength="1024"
                  [(ngModel)]="password"
                />
              </div>
              @if (data.value()?.mfaEnabled) {
                <div hlmField>
                  <label hlmFieldLabel for="email-code">{{ 'authenticatorCodeOptional' | t }}</label
                  ><input
                    hlmInput
                    id="email-code"
                    name="code"
                    autocomplete="one-time-code"
                    inputmode="numeric"
                    maxlength="64"
                    [(ngModel)]="code"
                  />
                </div>
                <div hlmField orientation="horizontal">
                  <hlm-checkbox
                    inputId="email-recovery"
                    name="recovery"
                    [(ngModel)]="recovery"
                  /><label hlmFieldLabel for="email-recovery">{{ 'useRecovery' | t }}</label>
                </div>
              }
            </div>
            <p class="workspace-meta">{{ 'emailProofHelp' | t }}</p>
            <div>
              <button hlmBtn [disabled]="busy() || emailForm.invalid">
                @if (busy()) {
                  <hlm-spinner />
                }
                {{ 'sendVerification' | t }}
              </button>
            </div>
            @if (emailSent()) {
              <div hlmAlert role="status">
                <h3 hlmAlertTitle>{{ 'emailChangeSent' | t }}</h3>
                <p hlmAlertDescription>{{ 'emailChangeSentHelp' | t }}</p>
              </div>
            }
          </form>
        </section>
      </div></app-page-state
    >`,
})
export class AccountHomePage {
  readonly api = inject(WorkspaceApi);
  readonly data = new Resource<ProfileResponse>();
  readonly busy = signal(false);
  readonly emailSent = signal(false);
  private readonly toast = inject(Notifications);
  email = '';
  password = '';
  code = '';
  recovery = false;
  constructor() {
    void this.load();
  }
  load() {
    return this.data.load((signal) => this.api.get('profile', {}, signal));
  }
  hasUnsavedChanges() {
    return !!(this.email || this.password || this.code);
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  async changeEmail() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post('privacy/email', {
        email: this.email.trim(),
        proof: { password: this.password, code: this.code, recoveryCode: this.recovery },
      });
      this.email = '';
      this.password = '';
      this.code = '';
      this.emailSent.set(true);
      this.toast.success('emailChangeSent');
    } catch {
      /* retain draft */
    } finally {
      this.busy.set(false);
    }
  }
}

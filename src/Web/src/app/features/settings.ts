import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { Translate } from '../core/i18n';
import { DeliverySummary } from '../api/models/delivery-summary';
import { SecuritySettings } from '../api/models/security-settings';
import { Notifications } from '../core/notifications';
@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    HlmButtonImports,
    HlmFieldImports,
    HlmToggleGroupImports,
    HlmSwitchImports,
    HlmCardImports,
    HlmAlertImports,
    HlmEmptyImports,
    HlmBadgeImports,
    HlmSpinnerImports,
    Translate,
  ],
  template: ` <h1 class="page-title">{{ 'adminSettings' | t }}</h1>
    <section hlmCard class="mt-6 max-w-(--form-content-width)">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'security' | t }}</h2>
        <p hlmCardDescription>{{ 'policyHelp' | t }}</p>
      </div>
      <form
        hlmCardContent
        #form="ngForm"
        (ngSubmit)="form.valid && save()"
        class="flex flex-col gap-5"
      >
        <fieldset hlmFieldSet>
          <legend hlmFieldLegend>{{ 'mfaPolicy' | t }}</legend>
          <hlm-toggle-group
            type="single"
            variant="outline"
            [nullable]="false"
            name="policy"
            [(ngModel)]="policy"
            [attr.aria-label]="'mfaPolicy' | t"
            class="flex-wrap"
          >
            <button hlmToggleGroupItem value="Optional">{{ 'policyOptional' | t }}</button>
            <button hlmToggleGroupItem value="Administrators">
              {{ 'policyAdministrators' | t }}
            </button>
            <button hlmToggleGroupItem value="Everyone">{{ 'policyEveryone' | t }}</button>
          </hlm-toggle-group>
        </fieldset>
        <div hlmField orientation="horizontal">
          <hlm-switch
            inputId="registration-enabled"
            name="registrationEnabled"
            [(ngModel)]="registrationEnabled"
            aria-describedby="registration-help"
            [disabled]="busy() || !settings()"
          />
          <div hlmFieldContent>
            <label hlmFieldLabel for="registration-enabled">{{ 'registrationEnabled' | t }}</label>
            <p hlmFieldDescription id="registration-help">{{ 'registrationHelp' | t }}</p>
          </div>
        </div>
        <button hlmBtn [disabled]="busy() || form.invalid || !settings()">
          @if (busy()) {
            <hlm-spinner />
          }
          {{ 'save' | t }}
        </button>
      </form>
    </section>
    <section hlmCard class="mt-6">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'deliveryOperations' | t }}</h2>
        <p hlmCardDescription>{{ 'deliveryHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <button
          hlmBtn
          variant="outline"
          class="my-4"
          [disabled]="busy()"
          (click)="loadOperations()"
        >
          {{ 'refreshList' | t }}
        </button>
        <ul class="flex flex-col gap-4">
          @for (item of deliveries(); track item.id) {
            <li class="flex flex-wrap items-center gap-3">
              <span class="break-all"
                >{{ item.type }} · <span hlmBadge variant="secondary">{{ item.state }}</span> ·
                {{ item.attempts }} · {{ item.errorCode }}</span
              >
              @if (item.state === 'Failed') {
                <button
                  hlmBtn
                  variant="outline"
                  [disabled]="busy()"
                  (click)="pendingReplay.set(item)"
                >
                  {{ 'replay' | t }}
                </button>
              }
            </li>
          } @empty {
            <li>
              <div hlmEmpty>
                <div hlmEmptyHeader>
                  <p hlmEmptyTitle>{{ 'noPendingDelivery' | t }}</p>
                </div>
              </div>
            </li>
          }
        </ul>
        @if (pendingReplay(); as item) {
          <div hlmAlert class="my-4">
            <p hlmAlertDescription>{{ 'replayWarning' | t }}</p>
            <button hlmBtn [disabled]="busy()" (click)="replay(item)">
              {{ 'confirmReplay' | t }}</button
            ><button hlmBtn variant="ghost" (click)="pendingReplay.set(null)">
              {{ 'cancel' | t }}
            </button>
          </div>
        }
      </div>
    </section>`,
})
export class SettingsPage {
  private readonly auth = inject(Auth);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  readonly deliveries = signal<DeliverySummary[]>([]);
  readonly pendingReplay = signal<DeliverySummary | null>(null);
  readonly settings = signal<SecuritySettings | null>(null);
  readonly busy = signal(false);
  private readonly notifications = inject(Notifications);
  policy = 'Administrators';
  registrationEnabled = false;
  constructor() {
    void this.load();
    void this.loadOperations();
  }
  async load() {
    try {
      const value = await firstValueFrom(
        this.http.get<SecuritySettings>(`${this.runtime.apiUrl}/api/v1/auth/settings/security`),
      );
      this.settings.set(value);
      this.policy = value.mfaPolicy ?? 'Administrators';
      this.registrationEnabled = value.registrationEnabled ?? false;
    } catch {
      /* Central error UI. */
    }
  }
  async loadOperations() {
    try {
      this.deliveries.set(
        await firstValueFrom(
          this.http.get<DeliverySummary[]>(`${this.runtime.apiUrl}/api/v1/auth/operations`),
        ),
      );
    } catch {
      /* Central errors. */
    }
  }
  async replay(item: DeliverySummary) {
    this.busy.set(true);
    try {
      await this.auth.action('operations/replay', {
        id: item.id,
        kind: item.type === 'job' ? 'job' : 'message',
      });
      this.pendingReplay.set(null);
      await this.loadOperations();
      this.notifications.success('replayQueued');
    } catch {
      /* Central errors. */
    } finally {
      this.busy.set(false);
    }
  }
  async save() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      this.settings.set(
        await this.auth.action<SecuritySettings>('settings/security', {
          mfaPolicy: this.policy,
          registrationEnabled: this.registrationEnabled,
          version: this.settings()?.version,
        }),
      );
      this.notifications.success('securitySaved');
      await this.auth.refresh();
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
}

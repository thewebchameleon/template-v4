import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmNativeSelectImports } from '@spartan-ng/helm/native-select';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { Translate } from '../core/i18n';
import { DeliverySummary } from '../api/models/delivery-summary';
import { SecuritySettings } from '../api/models/security-settings';
@Component({
  selector: 'app-settings',
  imports: [
    FormsModule,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputImports,
    HlmNativeSelectImports,
    Translate,
  ],
  template: ` <h1 class="text-3xl font-semibold">{{ 'adminSettings' | t }}</h1>
    <p class="mt-3">{{ 'policyHelp' | t }}</p>
    <form
      #form="ngForm"
      (ngSubmit)="form.valid && save()"
      class="mt-6 flex max-w-xl flex-col gap-5"
    >
      <div hlmField>
        <label hlmFieldLabel for="policy">{{ 'mfaPolicy' | t }}</label
        ><select hlmNativeSelect id="policy" name="policy" [(ngModel)]="policy">
          <option value="Optional">{{ 'policyOptional' | t }}</option>
          <option value="Administrators">{{ 'policyAdministrators' | t }}</option>
          <option value="Everyone">{{ 'policyEveryone' | t }}</option>
        </select>
      </div>
      <div hlmField>
        <label hlmFieldLabel for="settings-password">{{ 'password' | t }}</label
        ><input
          hlmInput
          id="settings-password"
          name="password"
          type="password"
          autocomplete="current-password"
          [(ngModel)]="password"
          required
        />
      </div>
      <div hlmField>
        <label hlmFieldLabel for="settings-code">{{ 'factorCode' | t }}</label
        ><input
          hlmInput
          id="settings-code"
          name="code"
          autocomplete="one-time-code"
          [(ngModel)]="code"
        />
        <p hlmFieldDescription>{{ 'policyProofHelp' | t }}</p>
        <label
          ><input type="checkbox" name="recovery" [(ngModel)]="recovery" />
          {{ 'useRecovery' | t }}</label
        >
      </div>
      <button hlmBtn [disabled]="busy() || form.invalid || !settings()">{{ 'save' | t }}</button>
      <p role="status">{{ message() | t }}</p>
    </form>
    <section class="mt-10">
      <h2 class="text-2xl font-semibold">{{ 'deliveryOperations' | t }}</h2>
      <p class="mt-3">{{ 'deliveryHelp' | t }}</p>
      <button hlmBtn variant="outline" class="my-4" [disabled]="busy()" (click)="loadOperations()">
        {{ 'refreshList' | t }}
      </button>
      <ul class="flex flex-col gap-4">
        @for (item of deliveries(); track item.id) {
          <li class="flex flex-wrap items-center gap-3">
            <span class="break-all"
              >{{ item.type }} � {{ item.state }} � {{ item.attempts }} � {{ item.errorCode }}</span
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
          <li>{{ 'noPendingDelivery' | t }}</li>
        }
      </ul>
      @if (pendingReplay(); as item) {
        <div class="my-4">
          <p>{{ 'replayWarning' | t }}</p>
          <button hlmBtn [disabled]="busy()" (click)="replay(item)">
            {{ 'confirmReplay' | t }}</button
          ><button hlmBtn variant="ghost" (click)="pendingReplay.set(null)">
            {{ 'cancel' | t }}
          </button>
        </div>
      }
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
  readonly message = signal('');
  policy = 'Administrators';
  password = '';
  code = '';
  recovery = false;
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
          version: this.settings()?.version,
          proof: { password: this.password, code: this.code, recoveryCode: this.recovery },
        }),
      );
      this.password = '';
      this.code = '';
      this.message.set('securitySaved');
      await this.auth.refresh();
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
}

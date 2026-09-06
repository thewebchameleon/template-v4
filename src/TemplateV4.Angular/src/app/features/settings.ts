import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
import { I18n, Translate } from '../core/i18n';
import { DeliverySummary } from '../api/models/delivery-summary';
import { DeliveryPage } from '../api/models/delivery-page';
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
        @if (settingsConflict()) {
          <div hlmAlert role="alert">
            <p hlmAlertDescription>{{ 'settingsConflict' | t }}</p>
            <button hlmBtn type="button" variant="outline" (click)="load(true)">
              {{ 'discardDraft' | t }}
            </button>
          </div>
        }
        @if (settingsState() === 'error') {
          <div hlmAlert variant="destructive" role="alert">
            <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
            <button hlmBtn type="button" variant="outline" (click)="load(true)">
              {{ 'retry' | t }}
            </button>
          </div>
        }
      </form>
    </section>
    <section hlmCard class="mt-6">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'deliveryOperations' | t }}</h2>
        <p hlmCardDescription>{{ 'deliveryHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <div class="flex flex-wrap gap-3">
          <hlm-toggle-group
            type="single"
            [nullable]="false"
            [value]="operationKind()"
            (valueChange)="selectOperationKind($event)"
          >
            <button hlmToggleGroupItem value="message">{{ 'messages' | t }}</button>
            <button hlmToggleGroupItem value="job">{{ 'jobs' | t }}</button>
          </hlm-toggle-group>
          <button
            hlmBtn
            variant="outline"
            [attr.aria-pressed]="failedOnly()"
            (click)="toggleFailedOnly()"
          >
            {{ 'failedOnly' | t }}
          </button>
        </div>
        <button
          hlmBtn
          variant="outline"
          class="my-4"
          [disabled]="busy()"
          (click)="loadOperations()"
        >
          {{ 'refreshList' | t }}
        </button>
        @if (operationsState() === 'error') {
          <div hlmAlert variant="destructive" role="alert">
            <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
          </div>
        } @else if (operationsState() === 'loading' && !deliveries().length) {
          <div class="flex items-center gap-2" role="status">
            <hlm-spinner />{{ 'loading' | t }}
          </div>
        } @else {
          <ul class="flex flex-col gap-4">
            @for (item of deliveries(); track item.id) {
              <li class="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <div class="min-w-0 flex-1">
                  <p class="break-all font-medium">{{ item.type }}</p>
                  <p class="break-all text-sm text-muted-foreground">{{ item.id }}</p>
                  <p class="mt-2 flex flex-wrap items-center gap-2 text-sm">
                    <span hlmBadge variant="secondary">{{ operationState(item.state) }}</span>
                    <span>{{ 'attempts' | t }}: {{ i18n.number(item.attempts) }}</span>
                    <span>{{ 'availableAt' | t }}: {{ i18n.date(item.availableAt) }}</span>
                  </p>
                  @if (item.errorCode) {
                    <p class="mt-2 break-all font-mono text-sm">{{ item.errorCode }}</p>
                  }
                </div>
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
          <div class="mt-4 flex items-center justify-between gap-3">
            <button
              hlmBtn
              variant="outline"
              [disabled]="operationPage() <= 1 || busy()"
              (click)="previousOperations()"
            >
              {{ 'previous' | t }}
            </button>
            <span
              >{{ 'page' | t }} {{ operationPage() }} · {{ 'totalItems' | t }}
              {{ operationTotal() }}</span
            >
            <button
              hlmBtn
              variant="outline"
              [disabled]="operationPage() * 25 >= operationTotal() || busy()"
              (click)="nextOperations()"
            >
              {{ 'next' | t }}
            </button>
          </div>
        }
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
  readonly i18n = inject(I18n);
  readonly deliveries = signal<DeliverySummary[]>([]);
  readonly operationTotal = signal(0);
  readonly operationPage = signal(1);
  readonly operationKind = signal<'message' | 'job'>('message');
  readonly failedOnly = signal(false);
  readonly operationsState = signal<'loading' | 'ready' | 'error'>('loading');
  readonly pendingReplay = signal<DeliverySummary | null>(null);
  readonly settings = signal<SecuritySettings | null>(null);
  readonly settingsState = signal<'loading' | 'ready' | 'error'>('loading');
  readonly settingsConflict = signal(false);
  readonly busy = signal(false);
  private operationsLoadSequence = 0;
  private readonly notifications = inject(Notifications);
  policy = 'Administrators';
  registrationEnabled = false;
  constructor() {
    void this.load();
    void this.loadOperations();
  }
  async load(applyDraft = true) {
    this.settingsState.set('loading');
    try {
      const value = await firstValueFrom(
        this.http.get<SecuritySettings>(`${this.runtime.apiUrl}/api/v1/auth/settings/security`),
      );
      this.settings.set(value);
      if (applyDraft) {
        this.policy = value.mfaPolicy ?? 'Administrators';
        this.registrationEnabled = value.registrationEnabled ?? false;
        this.settingsConflict.set(false);
      }
      this.settingsState.set('ready');
    } catch {
      this.settingsState.set('error');
    }
  }
  async loadOperations() {
    const sequence = ++this.operationsLoadSequence;
    this.operationsState.set('loading');
    try {
      const result = await firstValueFrom(
        this.http.get<DeliveryPage>(`${this.runtime.apiUrl}/api/v1/auth/operations`, {
          params: {
            kind: this.operationKind(),
            pageNumber: this.operationPage(),
            pageSize: 25,
            failedOnly: this.failedOnly(),
          },
        }),
      );
      if (sequence === this.operationsLoadSequence) {
        this.deliveries.set(result.items);
        this.operationTotal.set(result.total);
        this.operationsState.set('ready');
      }
    } catch {
      if (sequence === this.operationsLoadSequence) this.operationsState.set('error');
    }
  }
  async replay(item: DeliverySummary) {
    if (this.busy()) return;
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
      this.settingsConflict.set(false);
      this.notifications.success('securitySaved');
      await this.auth.refresh();
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 409) {
        this.settingsConflict.set(true);
        await this.load(false);
      }
    } finally {
      this.busy.set(false);
    }
  }
  selectOperationKind(value: string | string[] | null | undefined) {
    if (value !== 'message' && value !== 'job') return;
    this.operationKind.set(value);
    this.operationPage.set(1);
    void this.loadOperations();
  }
  toggleFailedOnly() {
    this.failedOnly.update((value) => !value);
    this.operationPage.set(1);
    void this.loadOperations();
  }
  previousOperations() {
    this.operationPage.update((value) => Math.max(1, value - 1));
    void this.loadOperations();
  }
  nextOperations() {
    this.operationPage.update((value) => value + 1);
    void this.loadOperations();
  }
  operationState(state: string) {
    const key = `operation${state}`;
    return this.i18n.text(key) === key ? state : this.i18n.text(key);
  }
}

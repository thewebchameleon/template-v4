import { Component, computed, inject, signal } from '@angular/core';

import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';

import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  Confirmations,
} from '../shared/workspace';

import { DataTable, DataTableFeatures } from '../shared/data-table';

import { RecordStatus, RowActions } from '../shared/workspace-cells';

import { Auth } from '../core/auth';

import { Features } from '../core/features';

import { HttpClient } from '@angular/common/http';

import { firstValueFrom } from 'rxjs';

import { Runtime } from '../core/runtime';

import { WorkspaceApi } from '../core/workspace-api';

import { I18n } from '../core/i18n';

import { Notifications } from '../core/notifications';

import { DeliveryPage, DeliverySummary, OperationsOverview } from '../api/models';

const column = createColumnHelper<DataTableFeatures, DeliverySummary>();

@Component({
  selector: 'app-operations',

  imports: [WorkspaceUi, DataTable],

  providers: [workspaceIcons],

  template: ` <app-page-header
      eyebrow="administration"
      title="operations"
      description="operationsIntro"
      ><button
        hlmBtn
        variant="outline"
        [disabled]="
          !auth.has('settings.manage') || overview.state() === 'loading' || overview.refreshing()
        "
        (click)="refresh()"
      >
        <ng-icon name="lucideRefreshCw" />{{ 'refresh' | t }}
      </button>
      @if (auth.has('jobs.trigger') && features.enabled('maintenance')) {
        <button hlmBtn variant="outline" [disabled]="busy()" (click)="maintenance()">
          {{ 'maintenance' | t }}
        </button>
      }
    </app-page-header>

    @if (auth.has('settings.manage')) {
      <app-page-state
        [state]="overview.state()"
        [refreshing]="overview.refreshing()"
        [refreshError]="overview.refreshError()"
        (retry)="refresh()"
      >
        @if (overview.value(); as value) {
          <div class="workspace-stats">
            @for (stat of stats(); track stat.label) {
              <section hlmCard>
                <div hlmCardHeader>
                  <p hlmCardDescription>{{ stat.label | t }}</p>
                </div>

                <div hlmCardContent>
                  <button
                    class="workspace-stat-value underline-offset-4 hover:underline"
                    (click)="showQueue(stat.label)"
                  >
                    {{ stat.value }}
                  </button>

                  <p class="workspace-stat-note">{{ stat.note | t }}</p>
                </div>
              </section>
            }
          </div>

          @if (
            value.failedMessages ||
            value.failedJobs ||
            value.oldestMessageSeconds > value.backlogWarningSeconds
          ) {
            <div hlmAlert variant="destructive" class="mb-6">
              <h2 hlmAlertTitle>{{ 'operationsNeedsAttention' | t }}</h2>

              <p hlmAlertDescription>{{ 'operationsNeedsAttentionHelp' | t }}</p>
              <div class="mt-3 flex gap-2">
                <button
                  hlmBtn
                  variant="outline"
                  (click)="query.set({ kind: 'message', failed: 'true', page: 1 })"
                >
                  {{ 'messages' | t }} ({{ value.failedMessages }})</button
                ><button
                  hlmBtn
                  variant="outline"
                  (click)="query.set({ kind: 'job', failed: 'true', page: 1 })"
                >
                  {{ 'jobs' | t }} ({{ value.failedJobs }})
                </button>
              </div>
            </div>
          }
        }
      </app-page-state>

      <div class="workspace-columns">
        <section hlmCard class="min-w-0">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'deliveryQueue' | t }}</h2>

            <p hlmCardDescription>{{ 'deliveryQueueHelp' | t }}</p>
          </div>

          <div hlmCardContent>
            <div class="workspace-toolbar">
              <hlm-toggle-group
                type="single"
                variant="outline"
                [nullable]="false"
                [value]="query.text('kind', 'message')"
                (valueChange)="kind($event)"
                [attr.aria-label]="'deliveryType' | t"
                ><button hlmToggleGroupItem value="message">{{ 'messages' | t }}</button
                ><button hlmToggleGroupItem value="job">
                  {{ 'jobs' | t }}
                </button></hlm-toggle-group
              >

              <div hlmField orientation="horizontal">
                <hlm-switch
                  inputId="failed-only"
                  [checked]="query.text('failed') === 'true'"
                  (checkedChange)="query.set({ failed: $event ? 'true' : null, page: 1 })"
                /><label hlmFieldLabel for="failed-only">{{ 'failedOnly' | t }}</label>
              </div>
            </div>

            <app-page-state
              [state]="data.state()"
              [refreshing]="data.refreshing()"
              [refreshError]="data.refreshError()"
              (retry)="load()"
              ><app-data-table
                [columns]="columns()"
                [data]="data.value()?.items ?? []"
                [emptyText]="'queueEmpty' | t" /><app-list-pager
                [total]="data.value()?.total ?? 0"
                [page]="query.page"
                (pageChange)="query.set({ page: $event })"
            /></app-page-state>
          </div>
        </section>

        <aside class="workspace-stack">
          @if (overview.value(); as value) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'systemDetails' | t }}</h2>

                <p hlmCardDescription>{{ 'systemDetailsHelp' | t }}</p>
              </div>

              <div hlmCardContent>
                <dl class="workspace-detail-list">
                  <div>
                    <dt>{{ 'deploymentVersion' | t }}</dt>

                    <dd class="break-all">{{ value.version }}</dd>
                  </div>

                  <div>
                    <dt>{{ 'lastMaintenance' | t }}</dt>

                    <dd>
                      {{
                        value.lastMaintenanceAt
                          ? i18n.date(value.lastMaintenanceAt)
                          : ('notRecorded' | t)
                      }}
                    </dd>
                  </div>

                  <div>
                    <dt>{{ 'checkedAt' | t }}</dt>

                    <dd>{{ i18n.date(value.checkedAt) }}</dd>
                  </div>
                </dl>
              </div>
            </section>

            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ 'recoveryGuidance' | t }}</h2>

                <p hlmCardDescription>{{ 'recoveryGuidanceHelp' | t }}</p>
              </div>

              <div hlmCardContent>
                <ol class="list-decimal pl-5 text-sm text-muted-foreground flex flex-col gap-3">
                  <li>{{ 'recoveryStepOne' | t }}</li>

                  <li>{{ 'recoveryStepTwo' | t }}</li>

                  <li>{{ 'recoveryStepThree' | t }}</li>
                </ol>
              </div>

              <div hlmCardFooter>
                <a
                  hlmBtn
                  variant="outline"
                  routerLink="/audit"
                  [queryParams]="{ action: 'operations' }"
                  >{{ 'viewAudit' | t }}<ng-icon name="lucideArrowUpRight"
                /></a>
              </div>
            </section>
          }
        </aside>
      </div>
    }`,
})
export class OperationsPage {
  readonly auth = inject(Auth);
  readonly features = inject(Features);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);

  readonly api = inject(WorkspaceApi);

  readonly i18n = inject(I18n);

  readonly toast = inject(Notifications);

  readonly confirm = inject(Confirmations);

  readonly overview = new Resource<OperationsOverview>();

  readonly data = new Resource<DeliveryPage>();

  readonly query = new ListQuery();

  readonly busy = signal(false);

  readonly stats = computed(() => {
    const v = this.overview.value();

    return [
      {
        label: 'pendingMessages',

        value: this.i18n.number(v?.pendingMessages ?? 0),

        note: 'pendingMessagesHelp',
      },

      {
        label: 'failedDeliveries',

        value: this.i18n.number((v?.failedMessages ?? 0) + (v?.failedJobs ?? 0)),

        note: 'failedDeliveriesHelp',
      },

      { label: 'activeJobs', value: this.i18n.number(v?.activeJobs ?? 0), note: 'activeJobsHelp' },

      {
        label: 'oldestPending',

        value:
          this.i18n.number(Math.ceil((v?.oldestMessageSeconds ?? 0) / 60)) +
          ' ' +
          this.i18n.text('minutesShort'),

        note: 'oldestPendingHelp',
      },
    ];
  });

  readonly columns = computed(() => {
    this.i18n.culture();

    const busy = this.busy();

    return column.columns([
      column.accessor('type', {
        header: this.i18n.text('deliveryType'),

        cell: (c) =>
          this.i18n.text(
            c.getValue() === 'job'
              ? 'maintenance'
              : c.getValue() === 'email.requested.v1'
                ? 'emailDelivery'
                : 'backgroundDelivery',
          ),
      }),

      column.accessor('state', {
        header: this.i18n.text('status'),

        cell: ({ row }) =>
          flexRenderComponent(RecordStatus, {
            inputs: { value: row.original.state, danger: row.original.state === 'Failed' },
          }),
      }),

      column.display({
        id: 'recovery',
        header: this.i18n.text('failureReason'),
        cell: ({ row }) =>
          row.original.state === 'Failed' ? this.failureHelp(row.original.errorCode) : '—',
      }),

      column.accessor('attempts', { header: this.i18n.text('attempts') }),

      column.accessor('availableAt', {
        header: this.i18n.text('availableAt'),

        cell: (c) => this.i18n.date(c.getValue()),
      }),

      column.display({
        id: 'actions',

        header: this.i18n.text('actions'),

        cell: ({ row }) =>
          flexRenderComponent(RowActions, {
            inputs: {
              actions:
                row.original.state === 'Failed'
                  ? [{ label: 'replay', disabled: busy, run: () => void this.replay(row.original) }]
                  : [],
            },
          }),
      }),
    ]);
  });

  constructor() {
    if (this.auth.has('settings.manage')) this.query.connect(() => void this.load());

    if (this.auth.has('settings.manage'))
      void this.overview.load((signal) => this.api.get('operations/overview', {}, signal));
  }

  async refresh() {
    if (!this.auth.has('settings.manage')) return;
    await Promise.all([
      this.overview.load((signal) => this.api.get('operations/overview', {}, signal)),
      this.load(),
    ]);
  }

  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        'operations',
        {
          kind: this.query.text('kind', 'message'),

          pageNumber: this.query.page,

          failedOnly: this.query.text('failed') === 'true',
        },
        signal,
      ),
    );

    if (loaded) this.query.clamp(this.data.value()?.total);
  }

  failureHelp(code: string | null) {
    const key =
      code === 'SmtpException'
        ? 'deliveryMailFailure'
        : code === 'TimeoutException' || code === 'TaskCanceledException'
          ? 'deliveryTimeout'
          : code === 'job.recovery_exhausted'
            ? 'deliveryRetriesExhausted'
            : 'deliveryFailureHelp';
    return this.i18n.text(key);
  }
  showQueue(label: string) {
    void this.query.set({
      kind: label === 'activeJobs' ? 'job' : 'message',
      failed: label === 'failedDeliveries' ? 'true' : null,
      page: 1,
    });
  }

  async maintenance() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await firstValueFrom(
        this.http.post(
          this.runtime.apiUrl + '/api/v1/jobs/maintenance',
          {},
          { headers: { 'Idempotency-Key': crypto.randomUUID() } },
        ),
      );
      this.toast.success('requested');
      await this.refresh();
    } catch {
      /* central feedback */
    } finally {
      this.busy.set(false);
    }
  }

  kind(value: unknown) {
    if (value === 'message' || value === 'job') void this.query.set({ kind: value, page: 1 });
  }

  async replay(item: DeliverySummary) {
    if (
      this.busy() ||
      !(await this.confirm.ask(
        'replayTitle',
        'replayHelp',
        this.i18n.text(item.type === 'job' ? 'maintenance' : 'backgroundDelivery') +
          ' · ' +
          this.i18n.date(item.availableAt),
      ))
    )
      return;

    this.busy.set(true);

    try {
      await this.api.post('operations/replay', {
        id: item.id,

        kind: this.query.text('kind', 'message'),
      });

      this.toast.success('replayQueued');

      await this.refresh();
    } catch {
      /* Central error notification. */
    } finally {
      this.busy.set(false);
    }
  }
}

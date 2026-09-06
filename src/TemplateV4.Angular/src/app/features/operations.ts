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
        [disabled]="overview.state() === 'loading'"
        (click)="refresh()"
      >
        <ng-icon name="lucideRefreshCw" />{{ 'refresh' | t }}
      </button></app-page-header
    >
    <app-page-state [state]="overview.state()" (retry)="refresh()">
      @if (overview.value(); as value) {
        <div class="workspace-stats">
          @for (stat of stats(); track stat.label) {
            <section hlmCard>
              <div hlmCardHeader>
                <p hlmCardDescription>{{ stat.label | t }}</p>
              </div>
              <div hlmCardContent>
                <p class="workspace-stat-value">{{ stat.value }}</p>
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
          </div>
        }
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
              <app-page-state [state]="data.state()" (retry)="load()"
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
          </aside>
        </div>
      }
    </app-page-state>`,
})
export class OperationsPage {
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
    this.query.connect(() => void this.load());
    void this.overview.load(() => this.api.get('operations/overview'));
  }
  refresh() {
    void this.overview.load(() => this.api.get('operations/overview'));
    void this.load();
  }
  load() {
    return this.data.load(() =>
      this.api.get('operations', {
        kind: this.query.text('kind', 'message'),
        pageNumber: this.query.page,
        failedOnly: this.query.text('failed') === 'true',
      }),
    );
  }
  kind(value: unknown) {
    if (value === 'message' || value === 'job') void this.query.set({ kind: value, page: 1 });
  }
  async replay(item: DeliverySummary) {
    if (this.busy() || !(await this.confirm.ask('replayTitle', 'replayHelp'))) return;
    this.busy.set(true);
    try {
      await this.api.post('operations/replay', {
        id: item.id,
        kind: this.query.text('kind', 'message'),
      });
      this.toast.success('replayQueued');
      this.refresh();
    } catch {
      /* Central error notification. */
    } finally {
      this.busy.set(false);
    }
  }
}

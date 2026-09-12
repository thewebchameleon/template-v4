import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { SupportNewPage } from './support-new';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  DebouncedSearch,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';
import { RecordIdentity } from '../shared/workspace-cells';
import { WorkspaceApi } from '../core/workspace-api';
import { I18n } from '../core/i18n';
import { PageOfTicketItem, TicketItem, SupportOptions } from '../api/models';

export const ticketStates = ['Open', 'InProgress', 'WaitingOnRequester', 'Resolved', 'Closed'];
export const ticketPriorities = ['Low', 'Normal', 'High', 'Urgent'];
const column = createColumnHelper<DataTableFeatures, TicketItem>();
@Component({
  selector: 'app-support',
  imports: [HlmSelectImports, HlmDrawerImports, WorkspaceUi, DataTable, SupportNewPage],
  providers: [workspaceIcons],
  template: `<app-page-header title="support" description="supportIntro">
      <hlm-drawer
        direction="right"
        [state]="newTicketOpen() ? 'open' : 'closed'"
        (stateChanged)="newTicketOpen.set($event === 'open')"
      >
        <button hlmBtn hlmDrawerTrigger>{{ 'supportNew' | t }}</button>
        <hlm-drawer-content
          *hlmDrawerPortal
          class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-lg"
          [attr.aria-label]="'supportTicketDetails' | t"
        >
          <hlm-drawer-header>
            <h2 hlmDrawerTitle>{{ 'supportTicketDetails' | t }}</h2>
            <p hlmDrawerDescription>{{ 'supportNewHelp' | t }}</p>
          </hlm-drawer-header>
          <app-support-new class="flex min-h-0 flex-1 flex-col" [embedded]="true" />
        </hlm-drawer-content>
      </hlm-drawer>
      @if (options.value()?.administrator) {
        <a hlmBtn variant="outline" routerLink="/support/categories">{{
          'supportCategories' | t
        }}</a>
      }
    </app-page-header>
    <app-page-state [state]="options.state()" (retry)="loadOptions()">
      @if (options.value()?.agent) {
        <hlm-tabs
          class="mb-6"
          [tab]="query.text('queue', 'false')"
          (tabActivated)="query.set({ queue: $event, page: 1 })"
        >
          <hlm-tabs-list [attr.aria-label]="'supportView' | t">
            <button hlmTabsTrigger="false">{{ 'supportMine' | t }}</button>
            <button hlmTabsTrigger="true">{{ 'supportQueue' | t }}</button>
          </hlm-tabs-list>
        </hlm-tabs>
      }
    </app-page-state>
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>
          {{ (query.text('queue') === 'true' ? 'supportQueue' : 'supportMine') | t }}
        </h2>
        <p hlmCardDescription>{{ 'supportListHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <div class="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div hlmField>
            <label hlmFieldLabel for="ticket-search">{{ 'search' | t }}</label
            ><input
              hlmInput
              id="ticket-search"
              [ngModel]="search.value()"
              (ngModelChange)="search.update($event)"
              maxlength="200"
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel for="ticket-status">{{ 'status' | t }}</label
            ><hlm-select
              [value]="query.text('status')"
              [itemToString]="ticketLabel"
              (valueChange)="query.set({ status: $event ?? '', page: 1 })"
            >
              <hlm-select-trigger buttonId="ticket-status" class="w-full"
                ><hlm-select-value
              /></hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'status' | t"
                ><hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                @for (s of states; track s) {
                  <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
          </div>
          <div hlmField>
            <label hlmFieldLabel for="ticket-priority">{{ 'supportPriority' | t }}</label
            ><hlm-select
              [value]="query.text('priority')"
              [itemToString]="ticketLabel"
              (valueChange)="query.set({ priority: $event ?? '', page: 1 })"
            >
              <hlm-select-trigger buttonId="ticket-priority" class="w-full"
                ><hlm-select-value
              /></hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportPriority' | t"
                ><hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                @for (s of priorities; track s) {
                  <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
          </div>
          <div hlmField>
            <label hlmFieldLabel for="ticket-category">{{ 'supportCategory' | t }}</label
            ><hlm-select
              [value]="query.text('category')"
              [itemToString]="categoryLabel"
              (valueChange)="query.set({ category: $event ?? '', page: 1 })"
            >
              <hlm-select-trigger buttonId="ticket-category" class="w-full"
                ><hlm-select-value
              /></hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportCategory' | t"
                ><hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                @for (c of options.value()?.categories ?? []; track c.id) {
                  <hlm-select-item [value]="c.id">{{ c.name }}</hlm-select-item>
                }
              </hlm-select-content>
            </hlm-select>
          </div>
          @if (options.value()?.agent) {
            <div hlmField>
              <label hlmFieldLabel for="ticket-agent">{{ 'supportAssignee' | t }}</label
              ><hlm-select
                [value]="query.text('assignee')"
                [itemToString]="assigneeLabel"
                (valueChange)="query.set({ assignee: $event ?? '', page: 1 })"
              >
                <hlm-select-trigger buttonId="ticket-agent" class="w-full"
                  ><hlm-select-value
                /></hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportAssignee' | t"
                  ><hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                  <hlm-select-item value="unassigned">{{
                    'supportUnassigned' | t
                  }}</hlm-select-item>
                  @for (a of options.value()?.agents ?? []; track a.id) {
                    <hlm-select-item [value]="a.id">{{ a.name }}</hlm-select-item>
                  }
                </hlm-select-content>
              </hlm-select>
            </div>
          }
          <button
            hlmBtn
            variant="outline"
            (click)="
              query.set({
                search: null,
                status: null,
                priority: null,
                category: null,
                assignee: null,
                page: 1,
              })
            "
          >
            {{ 'clearFilters' | t }}
          </button>
          <button hlmBtn variant="outline" (click)="load()" [disabled]="data.refreshing()">
            {{ 'refresh' | t }}
          </button>
        </div>
        <app-page-state
          [state]="data.state()"
          [refreshError]="data.refreshError()"
          (retry)="load()"
        >
          <app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.refreshing()"
            [emptyText]="'supportEmpty' | t"
            [loadingText]="'loading' | t"
            [sortColumn]="query.text('sort', 'updatedAt')"
            [sortDirection]="query.direction('desc')"
            (sortChange)="sort($event)"
          />
          <app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [showSizePicker]="true"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ size: $event, page: 1 })"
          />
        </app-page-state>
      </div>
    </section>`,
})
export class SupportPage {
  readonly newTicketOpen = signal(false);
  private readonly ticketEditor = viewChild(SupportNewPage);
  hasUnsavedChanges() {
    return this.newTicketOpen() && (this.ticketEditor()?.hasUnsavedChanges() ?? false);
  }
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly options = new Resource<SupportOptions>();
  readonly data = new Resource<PageOfTicketItem>();
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly states = ticketStates;
  readonly priorities = ticketPriorities;
  readonly ticketLabel = (value: string) =>
    this.i18n.text(value ? 'ticket.' + value : 'supportAll');
  readonly categoryLabel = (id: string) =>
    id
      ? (this.options.value()?.categories.find((category) => category.id === id)?.name ?? id)
      : this.i18n.text('supportAll');
  readonly assigneeLabel = (id: string) =>
    !id
      ? this.i18n.text('supportAll')
      : id === 'unassigned'
        ? this.i18n.text('supportUnassigned')
        : (this.options.value()?.agents.find((agent) => agent.id === id)?.name ?? id);

  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('subject', {
        header: this.i18n.text('supportSubject'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: { label: row.original.subject, link: '/support/' + row.original.id },
          }),
      }),
      column.accessor('requester', { header: this.i18n.text('supportRequester') }),
      column.accessor('category', { header: this.i18n.text('supportCategory') }),
      column.accessor('status', {
        header: this.i18n.text('status'),
        cell: (c) => this.i18n.text('ticket.' + c.getValue()),
      }),
      column.accessor('priority', {
        header: this.i18n.text('supportPriority'),
        cell: (c) => this.i18n.text('ticket.' + c.getValue()),
      }),
      column.accessor('assignee', {
        header: this.i18n.text('supportAssignee'),
        cell: (c) => c.getValue() || this.i18n.text('supportUnassigned'),
      }),
      column.accessor('updatedAt', {
        header: this.i18n.text('supportUpdated'),
        cell: (c) => this.i18n.date(c.getValue()),
      }),
    ]);
  });
  constructor() {
    void this.loadOptions();
    this.query.connect(() => {
      this.search.sync(this.query.text('search'));
      void this.load();
    });
  }
  loadOptions() {
    return this.options.load((signal) => this.api.get('support/options', {}, signal));
  }
  pageSize() {
    const n = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
  }
  async load() {
    if (
      await this.data.load((signal) =>
        this.api.get(
          'support/',
          {
            pageNumber: this.query.page,
            pageSize: this.pageSize(),
            search: this.query.text('search'),
            status: this.query.text('status'),
            priority: this.query.text('priority'),
            category: this.query.text('category'),
            assignee: this.query.text('assignee'),
            queue: this.query.text('queue') === 'true',
            sort: this.query.text('sort', 'updatedAt'),
            direction: this.query.direction('desc'),
          },
          signal,
        ),
      )
    )
      this.query.clamp(this.data.value()?.total, this.pageSize());
  }
  sort(s: ServerSort) {
    void this.query.set({ sort: s.column, direction: s.direction, page: 1 });
  }
}

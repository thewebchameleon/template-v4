import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { Router } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { SupportNewPage } from './create/support-new';
import { SupportTicketsLayout } from './tickets-layout';
import { ticketStates, ticketPriorities } from './ticket-options';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  DebouncedSearch,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  Confirmations,
} from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../../../../src/TemplateV4.Angular/src/app/shared/data-table';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { I18n, Translate } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { PageOfTicketItem, TicketItem, SupportOptions } from '../../../../../src/TemplateV4.Angular/src/app/api/models';

const column = createColumnHelper<DataTableFeatures, TicketItem>();
@Component({
  selector: 'app-ticket-message-cell',
  template: `<span class="block max-w-80 truncate">{{ value() || '—' }}</span>`,
})
class TicketMessageCell {
  readonly value = input.required<string>();
}
@Component({
  selector: 'app-ticket-badge-cell',
  imports: [HlmBadgeImports, Translate],
  template: `<span hlmBadge [variant]="badgeVariant()" class="whitespace-nowrap">{{ 'ticket.' + value() | t }}</span>`,
})
class TicketBadgeCell {
  readonly value = input.required<string>();
  readonly badgeVariant = computed<'default' | 'secondary' | 'outline' | 'destructive'>(() =>
    this.value() === 'Critical' ? 'destructive' :
    this.value() === 'Open' ? 'default' :
    this.value() === 'InProgress' || this.value() === 'WaitingOnRequester' || this.value() === 'High' ? 'outline' :
    'secondary');
}
@Component({
  selector: 'app-support',
  imports: [HlmSelectImports, HlmDrawerImports, WorkspaceUi, DataTable, SupportNewPage],
  providers: [workspaceIcons],
  template: `<app-page-header title="support" description="supportIntro">
      <hlm-drawer
        direction="right"
        [state]="newTicketOpen() ? 'open' : 'closed'"
        [disableClose]="newTicketBusy() || newTicketDirty()"
        [closeGuard]="confirmNewTicketClose"
        [closeLabel]="'close' | t"
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
        <a hlmBtn variant="outline" routerLink="/support/tickets/categories">{{
          'supportCategories' | t
        }}</a>
      }
    </app-page-header>
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>
          {{ (ticketsLayout.selectedTab() === 'true' ? 'supportQueue' : 'supportMine') | t }}
        </h2>
        <p hlmCardDescription>{{ 'supportListHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <div class="workspace-directory-controls">
          <div class="workspace-directory-toolbar">
            <div hlmField class="min-w-0 flex-1 sm:max-w-sm">
              <label hlmFieldLabel class="sr-only" for="ticket-search">{{ 'search' | t }}</label>
              <input
                hlmInput
                id="ticket-search"
                [ngModel]="search.value()"
                (ngModelChange)="search.update($event)"
                maxlength="200"
                [placeholder]="'supportSearchPlaceholder' | t"
              />
            </div>
            <hlm-drawer
              direction="right"
              [state]="filtersOpen() ? 'open' : 'closed'"
              [closeLabel]="'close' | t"
              (stateChanged)="filtersOpen.set($event === 'open')"
            >
              <button hlmBtn variant="outline" type="button" (click)="filtersOpen.set(true)">
                <ng-icon name="lucideFunnel" aria-hidden="true" />{{ 'supportFilters' | t }}
                @if (filterCount()) { <span hlmBadge variant="secondary">{{ filterCount() }}</span> }
              </button>
              <hlm-drawer-content
                *hlmDrawerPortal
                class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-md"
              >
                <hlm-drawer-header>
                  <h2 hlmDrawerTitle>{{ 'supportFilters' | t }}</h2>
                  <p hlmDrawerDescription>{{ 'supportFilterHelp' | t }}</p>
                </hlm-drawer-header>
                <div hlmDrawerBody class="grid content-start gap-4 overflow-y-auto">
                  <div hlmField>
                    <label hlmFieldLabel for="ticket-status">{{ 'status' | t }}</label>
                    <hlm-select
                      [value]="query.text('status')"
                      [itemToString]="ticketLabel"
                      (valueChange)="query.set({ status: $event ?? '', page: 1 })"
                    >
                      <hlm-select-trigger buttonId="ticket-status" class="w-full"><hlm-select-value /></hlm-select-trigger>
                      <hlm-select-content *hlmSelectPortal [ariaLabel]="'status' | t">
                        <hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                        @for (s of states; track s) {
                          <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                        }
                      </hlm-select-content>
                    </hlm-select>
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="ticket-priority">{{ 'supportPriority' | t }}</label>
                    <hlm-select
                      [value]="query.text('priority')"
                      [itemToString]="ticketLabel"
                      (valueChange)="query.set({ priority: $event ?? '', page: 1 })"
                    >
                      <hlm-select-trigger buttonId="ticket-priority" class="w-full"><hlm-select-value /></hlm-select-trigger>
                      <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportPriority' | t">
                        <hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                        @for (s of priorities; track s) {
                          <hlm-select-item [value]="s">{{ 'ticket.' + s | t }}</hlm-select-item>
                        }
                      </hlm-select-content>
                    </hlm-select>
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="ticket-category">{{ 'supportCategory' | t }}</label>
                    <hlm-select
                      [value]="query.text('category')"
                      [itemToString]="categoryLabel"
                      (valueChange)="query.set({ category: $event ?? '', page: 1 })"
                    >
                      <hlm-select-trigger buttonId="ticket-category" class="w-full"><hlm-select-value /></hlm-select-trigger>
                      <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportCategory' | t">
                        <hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                        @for (c of options.value()?.categories ?? []; track c.id) {
                          <hlm-select-item [value]="c.id">{{ c.name }}</hlm-select-item>
                        }
                      </hlm-select-content>
                    </hlm-select>
                  </div>
                  @if (options.value()?.agent) {
                    <div hlmField>
                      <label hlmFieldLabel for="ticket-agent">{{ 'supportAssignee' | t }}</label>
                      <hlm-select
                        [value]="query.text('assignee')"
                        [itemToString]="assigneeLabel"
                        (valueChange)="query.set({ assignee: $event ?? '', page: 1 })"
                      >
                        <hlm-select-trigger buttonId="ticket-agent" class="w-full"><hlm-select-value /></hlm-select-trigger>
                        <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportAssignee' | t">
                          <hlm-select-item value="">{{ 'supportAll' | t }}</hlm-select-item>
                          <hlm-select-item value="unassigned">{{ 'supportUnassigned' | t }}</hlm-select-item>
                          @for (a of options.value()?.agents ?? []; track a.id) {
                            <hlm-select-item [value]="a.id">{{ a.name }}</hlm-select-item>
                          }
                        </hlm-select-content>
                      </hlm-select>
                    </div>
                  }
                </div>
                <hlm-drawer-footer>
                  <button hlmBtn variant="destructive" type="button" [disabled]="!filterCount()" (click)="clearFilters()">
                    <ng-icon name="lucideFunnelX" aria-hidden="true" />{{ 'clearFilters' | t }}
                  </button>
                  <button hlmBtn variant="outline" type="button" hlmDrawerClose>{{ 'close' | t }}</button>
                </hlm-drawer-footer>
              </hlm-drawer-content>
            </hlm-drawer>
            <button hlmBtn variant="outline" type="button" (click)="load()" [disabled]="data.refreshing()">
              <ng-icon name="lucideRefreshCw" aria-hidden="true" />{{ 'refresh' | t }}
            </button>
          </div>
        </div>
        <app-page-state
          [state]="data.state()"
          [refreshError]="data.refreshError()"
          (retry)="load()"
          skeleton="table"
          [skeletonColumns]="columns().length"
        >
          <app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.refreshing()"
            [emptyText]="'supportEmpty' | t"
            [loadingText]="'loading' | t"
            [rowActionLabel]="rowLabel"
            [rowActionLink]="ticketLink"
            (rowAction)="openTicket($event)"
            [sortColumn]="query.text('sort', 'createdAt')"
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
  private readonly confirm = inject(Confirmations);
  private readonly router = inject(Router);
  readonly ticketsLayout = inject(SupportTicketsLayout);
  readonly filtersOpen = signal(false);
  readonly rowLabel = (ticket: TicketItem) => `${this.i18n.text('supportTicketDetails')}: ${this.reference(ticket.referenceNumber)}`;
  readonly ticketLink = (ticket: TicketItem) =>
    this.router.serializeUrl(this.router.createUrlTree(
      ['/support/tickets', ticket.id],
      { queryParamsHandling: 'preserve' },
    ));
  reference(number: number) { return `TK-${String(number).padStart(6, '0')}`; }
  dateLogged(value: string) {
    return new Intl.DateTimeFormat(this.i18n.culture(), { dateStyle: 'medium', timeZone: this.i18n.timeZone() }).format(new Date(value));
  }
  openTicket(ticket: TicketItem) { void this.router.navigateByUrl(this.ticketLink(ticket)); }
  readonly newTicketDirty = () => this.ticketEditor()?.hasUnsavedChanges() ?? false;
  readonly newTicketBusy = () => this.ticketEditor()?.busy() ?? false;
  readonly confirmNewTicketClose = () =>
    !this.newTicketBusy() &&
    (!this.newTicketDirty() ||
      this.confirm.ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges'));
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
  filterCount() {
    return ['status', 'priority', 'category', 'assignee'].filter((key) => !!this.query.text(key)).length;
  }
  clearFilters() {
    void this.query.set({ status: null, priority: null, category: null, assignee: null, page: 1 });
  }

  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('referenceNumber', {
        header: this.i18n.text('supportTicketId'),
        cell: (c) => this.reference(c.getValue()),
      }),
      column.accessor('assignee', {
        header: this.i18n.text('supportAssignee'),
        cell: ({ row }) => row.original.status === 'Draft' ? '—' : row.original.assignee || this.i18n.text('supportUnassigned'),
      }),
      column.accessor('status', {
        header: this.i18n.text('status'),
        cell: (c) => flexRenderComponent(TicketBadgeCell, { inputs: { value: c.getValue() } }),
      }),
      column.accessor('priority', {
        header: this.i18n.text('supportPriority'),
        cell: ({ row }) => row.original.status === 'Draft' ? '—' :
          flexRenderComponent(TicketBadgeCell, { inputs: { value: row.original.priority } }),
      }),
      column.accessor('category', {
        header: this.i18n.text('supportCategory'),
        cell: (c) => c.getValue() || '—',
      }),
      column.display({
        id: 'description',
        header: this.i18n.text('supportMessage'),
        cell: ({ row }) => flexRenderComponent(TicketMessageCell, { inputs: { value: row.original.description } }),
      }),
      column.accessor('createdAt', {
        header: this.i18n.text('supportDateLogged'),
        cell: (c) => this.dateLogged(c.getValue()),
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
            queue: this.ticketsLayout.selectedTab() === 'true',
            sort: this.query.text('sort', 'createdAt'),
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

import { Component, Input, computed, inject, signal } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  DebouncedSearch,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
} from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../../../../src/TemplateV4.Angular/src/app/shared/data-table';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { I18n } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { ContactEnquiry, PageOfContactEnquiry } from '../../../../../src/TemplateV4.Angular/src/app/api/models';

@Component({
  selector: 'app-contact-read',
  imports: [WorkspaceUi],
  template: `<button hlmBtn variant="outline" [disabled]="busy() || row.read" (click)="read()">
    {{ (row.read ? 'contactRead' : 'contactMarkRead') | t }}
  </button>`,
})
export class ContactReadAction {
  @Input() row!: ContactEnquiry;
  readonly busy = signal(false);
  private readonly api = inject(WorkspaceApi);
  async read() {
    this.busy.set(true);
    try {
      await this.api.post('contact/' + this.row.id + '/read');
      this.row.read = true;
    } finally {
      this.busy.set(false);
    }
  }
}
const column = createColumnHelper<DataTableFeatures, ContactEnquiry>();
@Component({
  selector: 'app-contact-inbox',
  imports: [WorkspaceUi, DataTable],
  providers: [workspaceIcons],
  template: `<app-page-header title="contactInbox" description="contactInboxHelp" />
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'contactInbox' | t }}</h2>
      </div>
      <div hlmCardContent>
        <div hlmField class="mb-4">
          <label hlmFieldLabel for="contact-search">{{ 'search' | t }}</label
          ><input
            hlmInput
            id="contact-search"
            [ngModel]="search.value()"
            (ngModelChange)="search.update($event)"
            maxlength="200"
          />
        </div>
        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [loading]="data.refreshing()"
            [emptyText]="'contactEmpty' | t"
            [loadingText]="'loading' | t"
            [sortColumn]="query.text('sort', 'createdAt')"
            [sortDirection]="query.direction('desc')"
            (sortChange)="sort($event)" /><app-list-pager
            [total]="data.value()?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [showSizePicker]="true"
            (pageChange)="query.set({ page: $event })"
            (sizeChange)="query.set({ size: $event, page: 1 })"
        /></app-page-state>
      </div>
    </section>`,
})
export class ContactInboxPage {
  private readonly api = inject(WorkspaceApi);
  private readonly i18n = inject(I18n);
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly data = new Resource<PageOfContactEnquiry>();
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('name', { header: this.i18n.text('contactName') }),
      column.accessor('email', { header: this.i18n.text('contactEmail') }),
      column.accessor('message', {
        header: this.i18n.text('contactMessage'),
        enableSorting: false,
      }),
      column.accessor('createdAt', {
        header: this.i18n.text('contactReceived'),
        cell: (c) => this.i18n.date(c.getValue()),
      }),
      column.display({
        id: 'actions',
        header: this.i18n.text('status'),
        cell: (c) => flexRenderComponent(ContactReadAction, { inputs: { row: c.row.original } }),
      }),
    ]);
  });
  constructor() {
    this.query.connect(() => {
      this.search.sync(this.query.text('search'));
      void this.load();
    });
  }
  pageSize() {
    const size = Number(this.query.text('size', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  async load() {
    await this.data.load((signal) =>
      this.api.get(
        'contact',
        {
          search: this.query.text('search'),
          pageNumber: this.query.page,
          pageSize: this.pageSize(),
          sort: this.query.text('sort', 'createdAt'),
          direction: this.query.direction('desc'),
        },
        signal,
      ),
    );
    this.query.clamp(this.data.value()?.total, this.pageSize());
  }
}

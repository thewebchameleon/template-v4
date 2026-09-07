import { Component, computed, inject } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { WorkspaceUi, Resource, ListQuery } from '../shared/workspace';
import { DataTable, DataTableFeatures } from '../shared/data-table';
import { RecordIdentity, RecordStatus } from '../shared/workspace-cells';
import { PeopleNav } from '../shared/people-nav';
import { WorkspaceApi } from '../core/workspace-api';
import { Auth } from '../core/auth';
import { I18n } from '../core/i18n';
import { UserDto, PageOfUserDto } from '../api/models';
const column = createColumnHelper<DataTableFeatures, UserDto>();
@Component({
  selector: 'app-users',
  imports: [WorkspaceUi, DataTable, PeopleNav],
  template: ` <app-page-header title="users" description="peopleIntro" eyebrow="administration">
      @if (auth.has('users.manage')) {
        <a hlmBtn routerLink="/users/invite">{{ 'invite' | t }}</a>
      }
    </app-page-header>
    <app-people-nav />
    <section hlmCard>
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'directory' | t }}</h2>
      </div>
      <div hlmCardContent>
        <form class="workspace-toolbar" (ngSubmit)="query.set({ search: search || null, page: 1 })">
          <div hlmField>
            <label hlmFieldLabel for="search">{{ 'search' | t }}</label
            ><input
              hlmInput
              id="search"
              name="search"
              [(ngModel)]="search"
              maxlength="120"
              [placeholder]="'peopleSearch' | t"
            />
          </div>
          <button hlmBtn variant="outline">{{ 'search' | t }}</button>
          @if (query.text('search')) {
            <button
              hlmBtn
              type="button"
              variant="ghost"
              (click)="query.set({ search: null, page: 1 })"
            >
              {{ 'clear' | t }}
            </button>
          }
        </form>
        <hlm-toggle-group
          type="single"
          variant="outline"
          [nullable]="false"
          [value]="query.text('sort', 'name')"
          (valueChange)="sort($event)"
          [attr.aria-label]="'sort' | t"
          class="mb-4"
          ><button hlmToggleGroupItem value="name">{{ 'name' | t }}</button
          ><button hlmToggleGroupItem value="email">{{ 'email' | t }}</button></hlm-toggle-group
        >
        <app-page-state
          [state]="data.state()"
          [refreshing]="data.refreshing()"
          [refreshError]="data.refreshError()"
          (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [data]="data.value()?.items ?? []"
            [emptyText]="'peopleEmpty' | t" /><app-list-pager
            [page]="query.page"
            [total]="data.value()?.total ?? 0"
            [busy]="data.refreshing()"
            (pageChange)="query.set({ page: $event })"
        /></app-page-state>
      </div>
    </section>`,
})
export class UsersPage {
  readonly auth = inject(Auth);
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly data = new Resource<PageOfUserDto>();
  readonly query = new ListQuery();
  search = '';
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('displayName', {
        header: this.i18n.text('person'),
        cell: ({ row }) =>
          flexRenderComponent(RecordIdentity, {
            inputs: {
              label: row.original.displayName,
              description: row.original.email,
              link: '/users/' + row.original.id,
            },
          }),
      }),
      column.accessor('roles', {
        header: this.i18n.text('roles'),
        cell: (c) => c.getValue().join(', ') || '—',
      }),
      column.accessor('status', {
        header: this.i18n.text('status'),
        cell: ({ row }) =>
          flexRenderComponent(RecordStatus, {
            inputs: { value: row.original.status ?? 'Active', danger: row.original.disabled },
          }),
      }),
    ]);
  });
  constructor() {
    this.query.connect(() => {
      this.search = this.query.text('search');
      void this.load();
    });
  }
  async load() {
    const loaded = await this.data.load((signal) =>
      this.api.get(
        '/users',
        {
          pageNumber: this.query.page,
          pageSize: 25,
          search: this.query.text('search'),
          sort: this.query.text('sort', 'name'),
        },
        signal,
      ),
    );
    if (loaded) this.query.clamp(this.data.value()?.total);
  }
  sort(value: unknown) {
    if (value === 'name' || value === 'email') void this.query.set({ sort: value, page: 1 });
  }
}

import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  ListQuery,
  DebouncedSearch,
  protectUnload,
  Confirmations,
} from '../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../shared/data-table';
import { RecordStatus } from '../shared/workspace-cells';
import { UserDetailPage } from './user-detail';
import { PeopleNav } from '../shared/people-nav';
import { InvitationEditor } from './invite-user';
import { WorkspaceApi } from '../core/workspace-api';
import { Auth } from '../core/auth';
import { I18n } from '../core/i18n';
import { UserDto, PageOfUserDto } from '../api/models';
const column = createColumnHelper<DataTableFeatures, UserDto>();
@Component({
  selector: 'app-users',
  imports: [WorkspaceUi, DataTable, PeopleNav, HlmDrawerImports, InvitationEditor, UserDetailPage],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header title="users" description="peopleIntro" eyebrow="administration">
      @if (auth.has('users.manage')) {
        <hlm-drawer
          direction="right"
          [state]="inviteOpen() ? 'open' : 'closed'"
          [disableClose]="true"
          (stateChanged)="inviteOpen.set($event === 'open')"
        >
          <button hlmBtn hlmDrawerTrigger><ng-icon name="lucideMail" />{{ 'invite' | t }}</button>
          <hlm-drawer-content
            *hlmDrawerPortal
            class="overflow-hidden sm:max-w-lg"
            [attr.aria-label]="'invite' | t"
          >
            <hlm-drawer-header>
              <h2 hlmDrawerTitle>{{ 'invite' | t }}</h2>
              <p hlmDrawerDescription>{{ 'inviteHelp' | t }}</p>
            </hlm-drawer-header>
            <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              <app-invitation-editor (invited)="invited()" (cancelled)="inviteOpen.set(false)" />
            </div>
          </hlm-drawer-content>
        </hlm-drawer>
      }
    </app-page-header>
    <app-people-nav />
    <section hlmCard>
      <div
        hlmCardHeader
        class="workspace-card-search-header flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <h2 hlmCardTitle>{{ 'directory' | t }}</h2>
        <div class="flex w-full items-end gap-2 sm:w-auto">
          @if (search.value()) {
            <button hlmBtn type="button" (click)="search.update('')">
              {{ 'clear' | t }}
            </button>
          }
          <div hlmField class="min-w-0 flex-1 sm:w-72">
            <input
              hlmInput
              id="search"
              [attr.aria-label]="'search' | t"
              [ngModel]="search.value()"
              (ngModelChange)="search.update($event)"
              maxlength="120"
              [placeholder]="'peopleSearch' | t"
            />
          </div>
        </div>
      </div>
      <div hlmCardContent>
        <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
          ><app-data-table
            [columns]="columns()"
            [rowActionLabel]="detailsLabel"
            (rowAction)="openDetails($event)"
            [data]="data.value()?.items ?? []"
            [loading]="data.state() === 'loading' || data.refreshing()"
            [loadingText]="'loading' | t"
            [emptyText]="'peopleEmpty' | t"
            [sortColumn]="query.text('sort', 'displayName')"
            [sortDirection]="query.direction('asc')"
            (sortChange)="sort($event)" /><app-list-pager
            [page]="query.page"
            [total]="data.value()?.total ?? 0"
            [busy]="data.refreshing()"
            (pageChange)="query.set({ page: $event })"
        /></app-page-state>
      </div>
    </section>
    <hlm-drawer
      direction="right"
      [state]="selectedUser() ? 'open' : 'closed'"
      [disableClose]="detailsBusy() || (detailEditor()?.hasUnsavedChanges() ?? false)"
      (stateChanged)="$event === 'closed' && closeDetails()"
    >
      <hlm-drawer-content
        *hlmDrawerPortal
        class="overflow-hidden data-[vaul-drawer-direction=right]:w-full data-[vaul-drawer-direction=right]:sm:max-w-2xl"
      >
        <hlm-drawer-header>
          <h2 hlmDrawerTitle>{{ 'personDetails' | t }}</h2>
          <p hlmDrawerDescription>{{ 'personDetailsHelp' | t }}</p>
        </hlm-drawer-header>
        <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          @if (selectedUser(); as user) {
            <app-user-detail [userId]="user.id" [embedded]="true" (saved)="load()" />
          }
        </div>
        <hlm-drawer-footer>
          <button
            hlmBtn
            type="button"
            variant="outline"
            [disabled]="detailsBusy()"
            (click)="closeDetails()"
          >
            {{ 'close' | t }}
          </button>
        </hlm-drawer-footer>
      </hlm-drawer-content>
    </hlm-drawer>`,
})
export class UsersPage {
  readonly auth = inject(Auth);
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly data = new Resource<PageOfUserDto>();
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly inviteOpen = signal(false);
  readonly selectedUser = signal<UserDto | null>(null);
  readonly detailEditor = viewChild(UserDetailPage);
  readonly detailsBusy = computed(() => this.detailEditor()?.busy() ?? false);
  private readonly confirm = inject(Confirmations);
  readonly detailsLabel = (user: UserDto) =>
    `${this.i18n.text('personDetails')}: ${user.username || user.displayName}`;
  private readonly editor = viewChild(InvitationEditor);
  readonly columns = computed(() => {
    this.i18n.culture();
    return column.columns([
      column.accessor('username', { header: this.i18n.text('username') }),
      column.accessor('displayName', { header: this.i18n.text('displayName') }),
      column.accessor('email', { header: this.i18n.text('email') }),
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
      this.search.sync(this.query.text('search'));
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
          sort: this.query.text('sort', 'displayName'),
          direction: this.query.direction('asc'),
        },
        signal,
      ),
    );
    if (loaded) this.query.clamp(this.data.value()?.total);
  }
  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }
  hasUnsavedChanges() {
    return (
      (this.inviteOpen() && (this.editor()?.hasUnsavedChanges() ?? false)) ||
      (this.detailEditor()?.hasUnsavedChanges() ?? false) ||
      this.detailsBusy()
    );
  }
  openDetails(user: UserDto) {
    this.selectedUser.set(user);
  }
  async closeDetails() {
    if (this.detailsBusy()) return;
    if (
      this.detailEditor()?.hasUnsavedChanges() &&
      !(await this.confirm.ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges'))
    )
      return;
    this.selectedUser.set(null);
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  invited() {
    this.inviteOpen.set(false);
    void this.load();
  }
}

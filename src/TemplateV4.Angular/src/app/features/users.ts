import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { Auth } from '../core/auth';
import { Runtime } from '../core/runtime';
import { I18n, Translate } from '../core/i18n';
import { UserDto as User } from '../api/models/user-dto';
import { PageOfUserDto as Page } from '../api/models/page-of-user-dto';
import { listUsers } from '../api/fn/framework/list-users';
import { createUser } from '../api/fn/framework/create-user';
import { updateUser } from '../api/fn/framework/update-user';
import { IDEMPOTENCY_KEY } from '../core/interceptors';
import { Features } from '../core/features';
import { Notifications } from '../core/notifications';
import { DataTable, type DataTableFeatures } from '../shared/data-table';
import {
  UserActionsCell,
  UserIdentityCell,
  UserStatusCell,
  type UserTableRow,
} from './users-table-cells';

const userColumnHelper = createColumnHelper<DataTableFeatures, UserTableRow>();

@Component({
  selector: 'app-users',
  imports: [
    FormsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmFieldImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmToggleGroupImports,
    HlmAlertImports,
    DataTable,
    Translate,
  ],
  template: ` <div class="mb-8">
      <p class="mb-2 text-sm text-muted-foreground">{{ 'people' | t }}</p>
      <h1 class="page-title">{{ 'users' | t }}</h1>
      <p class="mt-3 text-muted-foreground">{{ 'intro' | t }}</p>
      @if (auth.has('jobs.trigger') && features.enabled('maintenance')) {
        <button hlmBtn variant="outline" class="mt-4" [disabled]="busy()" (click)="maintenance()">
          {{ 'maintenance' | t }}
        </button>
      }
    </div>
    @if (pendingDisable(); as user) {
      <section hlmAlert variant="destructive" class="mb-6" aria-labelledby="disable-title">
        <h2 hlmAlertTitle id="disable-title">{{ 'confirmDisable' | t }}: {{ user.displayName }}</h2>
        <p hlmAlertDescription>{{ 'disableHelp' | t }}</p>
        <button hlmBtn variant="destructive" [disabled]="busy()" (click)="toggle(user, true)">
          {{ 'disable' | t }}</button
        ><button hlmBtn variant="ghost" (click)="pendingDisable.set(null)">
          {{ 'cancel' | t }}
        </button>
      </section>
    }
    <div
      class="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_var(--directory-form-width)]"
    >
      <section hlmCard class="min-w-0">
        <div hlmCardHeader>
          <h2 hlmCardTitle>
            {{ 'users' | t }}
            <span hlmBadge variant="secondary">{{ i18n.number(page().total) }}</span>
          </h2>
          <p hlmCardDescription>{{ 'intro' | t }}</p>
        </div>
        <div hlmCardContent class="flex min-w-0 flex-col gap-5">
          @if (loadState() === 'error') {
            <div hlmAlert variant="destructive" role="alert">
              <p hlmAlertDescription>{{ 'loadFailed' | t }}</p>
              <button hlmBtn variant="outline" type="button" (click)="load()">
                {{ 'retry' | t }}
              </button>
            </div>
          }
          <form class="flex min-w-0 gap-3" (ngSubmit)="pageNumber = 1; load()">
            <label class="sr-only" for="search">{{ 'search' | t }}</label
            ><input
              hlmInput
              id="search"
              name="search"
              [(ngModel)]="search"
              [placeholder]="'search' | t"
            /><button hlmBtn variant="outline">{{ 'search' | t }}</button>
          </form>
          <app-data-table
            class="min-w-0 max-w-full"
            [columns]="columns()"
            [data]="tableRows()"
            [emptyText]="i18n.text('empty')"
            [loading]="busy()"
            [loadingText]="i18n.text('loading')"
            [getRowId]="getRowId"
          />
        </div>
        <div hlmCardFooter class="justify-between">
          <button
            hlmBtn
            variant="outline"
            [disabled]="pageNumber <= 1 || busy()"
            (click)="pageNumber = pageNumber - 1; load()"
          >
            {{ 'previous' | t }}</button
          ><span>{{ i18n.number(pageNumber) }}</span
          ><button
            hlmBtn
            variant="outline"
            [disabled]="pageNumber * 25 >= page().total || busy()"
            (click)="pageNumber = pageNumber + 1; load()"
          >
            {{ 'next' | t }}
          </button>
        </div>
      </section>
      @if (auth.has('users.manage')) {
        <section hlmCard class="min-w-0">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'invite' | t }}</h2>
            <p hlmCardDescription>{{ 'inviteHelp' | t }}</p>
          </div>
          <form
            #inviteForm="ngForm"
            hlmCardContent
            class="flex min-w-0 flex-col gap-5"
            (ngSubmit)="invite()"
          >
            <div hlmField>
              <label hlmFieldLabel for="name">{{ 'name' | t }}</label
              ><input hlmInput id="name" name="name" [(ngModel)]="name" maxlength="120" required />
            </div>
            <div hlmField>
              <label hlmFieldLabel for="inviteEmail">{{ 'email' | t }}</label
              ><input
                hlmInput
                id="inviteEmail"
                name="email"
                type="email"
                [(ngModel)]="email"
                required
                email
              />
            </div>
            <fieldset hlmFieldSet>
              <legend hlmFieldLegend>{{ 'role' | t }}</legend>
              <hlm-toggle-group
                id="role"
                type="multiple"
                variant="outline"
                [nullable]="false"
                name="role"
                [(ngModel)]="roles"
                [attr.aria-label]="'role' | t"
              >
                <button hlmToggleGroupItem value="Reader">{{ 'reader' | t }}</button>
                <button hlmToggleGroupItem value="Administrator">{{ 'administrator' | t }}</button>
              </hlm-toggle-group>
            </fieldset>
            <fieldset hlmFieldSet>
              <legend hlmFieldLegend>{{ 'culture' | t }}</legend>
              <hlm-toggle-group
                type="single"
                variant="outline"
                [nullable]="false"
                name="culture"
                [(ngModel)]="culture"
                [attr.aria-label]="'culture' | t"
              >
                <button hlmToggleGroupItem value="en-ZA">English</button>
                <button hlmToggleGroupItem value="af-ZA">Afrikaans</button>
              </hlm-toggle-group>
            </fieldset>
            <button hlmBtn [disabled]="busy() || inviteForm.invalid">{{ 'invite' | t }}</button>
          </form>
          <div hlmCardFooter>
            <p class="text-sm text-muted-foreground">{{ 'inviteHelp' | t }}</p>
          </div>
        </section>
      }
    </div>`,
})
export class UsersPage {
  readonly features = inject(Features);
  readonly auth = inject(Auth);
  readonly i18n = inject(I18n);
  private readonly http = inject(HttpClient);
  private readonly runtime = inject(Runtime);
  private readonly notifications = inject(Notifications);
  readonly page = signal<Page>({ items: [], total: 0, pageNumber: 1, pageSize: 25 });
  readonly busy = signal(false);
  readonly loadState = signal<'loading' | 'ready' | 'error'>('loading');
  search = '';
  pageNumber = 1;
  name = '';
  email = '';
  roles = ['Reader'];
  readonly pendingDisable = signal<User | null>(null);
  readonly roleDrafts = new Map<string, string[]>();
  readonly columns = computed(() => {
    this.i18n.culture();
    return userColumnHelper.columns([
      userColumnHelper.accessor((row) => row.user.displayName, {
        id: 'name',
        header: this.i18n.text('name'),
        cell: ({ row }) =>
          flexRenderComponent(UserIdentityCell, { inputs: { user: row.original.user } }),
      }),
      userColumnHelper.accessor((row) => row.user.roles.join(', '), {
        id: 'role',
        header: this.i18n.text('role'),
      }),
      userColumnHelper.accessor((row) => row.user.status, {
        id: 'status',
        header: this.i18n.text('status'),
        cell: ({ row }) =>
          flexRenderComponent(UserStatusCell, { inputs: { user: row.original.user } }),
      }),
      userColumnHelper.display({
        id: 'actions',
        header: this.i18n.text('actions'),
        cell: ({ row }) => flexRenderComponent(UserActionsCell, { inputs: { row: row.original } }),
      }),
    ]);
  });
  readonly tableRows = computed<UserTableRow[]>(() => {
    const canManage = this.auth.has('users.manage');
    const currentUserId = this.auth.access()?.userId;
    return this.page().items.map((user) => ({
      user,
      busy: this.busy,
      canManage,
      isCurrentUser: user.id === currentUserId,
      roleDrafts: this.roleDrafts,
      invitation: (cancel) => void this.invitation(user, cancel),
      toggle: () => void this.toggle(user),
      selectRoles: (roles) => this.selectRoles(user, roles),
      changeRole: () => void this.changeRole(user),
    }));
  });
  readonly getRowId = (row: UserTableRow) => row.user.id;
  private loadSequence = 0;
  private invitationFingerprint = '';
  culture = 'en-ZA';
  private invitationKey = crypto.randomUUID();
  constructor() {
    void this.load();
    void this.features.load();
  }
  async maintenance() {
    this.busy.set(true);
    try {
      await firstValueFrom(
        this.http.post(
          `${this.runtime.apiUrl}/api/v1/jobs/maintenance`,
          {},
          { headers: { 'Idempotency-Key': crypto.randomUUID() } },
        ),
      );
      this.notifications.success('requested');
    } catch {
      /* Central Problem Details UI. */
    } finally {
      this.busy.set(false);
    }
  }
  async load() {
    const sequence = ++this.loadSequence;
    this.busy.set(true);
    this.loadState.set('loading');
    try {
      const result = (
        await firstValueFrom(
          listUsers(this.http, this.runtime.apiUrl, {
            pageNumber: this.pageNumber,
            pageSize: 25,
            search: this.search,
          }),
        )
      ).body;
      if (sequence === this.loadSequence) {
        this.page.set(result);
        this.loadState.set('ready');
      }
    } catch {
      if (sequence === this.loadSequence) this.loadState.set('error');
    } finally {
      if (sequence === this.loadSequence) this.busy.set(false);
    }
  }
  async invite() {
    if (this.busy()) return;
    const fingerprint = JSON.stringify([this.email, this.name, this.roles, this.culture]);
    if (fingerprint !== this.invitationFingerprint) {
      this.invitationKey = crypto.randomUUID();
      this.invitationFingerprint = fingerprint;
    }
    this.busy.set(true);
    try {
      await firstValueFrom(
        createUser(
          this.http,
          this.runtime.apiUrl,
          {
            body: {
              email: this.email,
              displayName: this.name,
              roles: this.roles,
              culture: this.culture,
            },
          },
          new HttpContext().set(IDEMPOTENCY_KEY, this.invitationKey),
        ),
      );
      this.invitationKey = crypto.randomUUID();
      this.name = '';
      this.email = '';
      await this.load();
      this.notifications.success('invitationSent');
    } catch {
      /* Retain idempotency key for a retry. */
    } finally {
      this.busy.set(false);
    }
  }
  async invitation(user: User, cancel: boolean) {
    this.busy.set(true);
    try {
      await this.auth.action('invitations', { userId: user.id, cancel });
      await this.load();
      this.notifications.success(cancel ? 'invitationCancelled' : 'invitationSent');
    } catch {
      /* Central error UI. */
    } finally {
      this.busy.set(false);
    }
  }
  async toggle(user: User, confirmed = false) {
    if (!user.disabled && !confirmed) {
      this.pendingDisable.set(user);
      return;
    }
    this.pendingDisable.set(null);
    this.busy.set(true);
    try {
      await firstValueFrom(
        updateUser(this.http, this.runtime.apiUrl, {
          id: user.id,
          body: { id: user.id, version: user.version, roles: user.roles, disabled: !user.disabled },
        }),
      );
      await this.load();
      this.notifications.success(user.disabled ? 'accountEnabled' : 'accountDisabled');
    } catch {
      /* Central errors. */
    } finally {
      this.busy.set(false);
    }
  }
  selectRoles(user: User, roles: unknown) {
    if (Array.isArray(roles) && roles.every((role) => typeof role === 'string')) {
      this.roleDrafts.set(user.id, roles);
    }
  }
  async changeRole(user: User) {
    const roles = this.roleDrafts.get(user.id) ?? user.roles;
    this.busy.set(true);
    try {
      await firstValueFrom(
        updateUser(this.http, this.runtime.apiUrl, { id: user.id, body: { ...user, roles } }),
      );
      this.notifications.success('rolesSaved');
    } catch {
      /* Central Problem Details UI. */
    } finally {
      this.roleDrafts.delete(user.id);
      await this.load();
    }
  }
}

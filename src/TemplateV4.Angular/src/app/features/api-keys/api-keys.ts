import { Component, computed, inject, signal } from '@angular/core';
import { provideIcons } from '@ng-icons/core';
import { lucideCopy, lucideKeyRound, lucideX } from '@ng-icons/lucide';
import { createColumnHelper, flexRenderComponent } from '@tanstack/angular-table';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import {
  DebouncedSearch,
  DEFAULT_PAGE_SIZE,
  Confirmations,
  ListQuery,
  PAGE_SIZE_OPTIONS,
  Resource,
  WorkspaceUi,
  workspaceIcons,
} from '../../shared/workspace';
import { DataTable, DataTableFeatures, ServerSort } from '../../shared/data-table';
import { RecordStatus, RowActions } from '../../shared/workspace-cells';
import { WorkspaceApi } from '../../core/workspace-api';
import { I18n } from '../../core/i18n';
import { Notifications } from '../notifications/notifications';
import { ApiKeyCreated, ApiKeyItem, ApiKeyPage } from '../../api/models';

const column = createColumnHelper<DataTableFeatures, ApiKeyItem>();

@Component({
  selector: 'app-api-keys',
  imports: [WorkspaceUi, HlmDrawerImports, HlmInputGroupImports, HlmSelectImports, DataTable],
  providers: [workspaceIcons, provideIcons({ lucideCopy, lucideKeyRound, lucideX })],
  template: `
    <app-page-header eyebrow="administration" title="apiKeys" description="apiKeysIntro">
      <button hlmBtn type="button" (click)="createOpen.set(true)">
        <ng-icon name="lucidePlus" />{{ 'createApiKey' | t }}
      </button>
    </app-page-header>

    @if (created(); as value) {
      <section hlmAlert variant="primary" class="mb-6" aria-live="polite">
        <ng-icon name="lucideKeyRound" aria-hidden="true" />
        <h2 hlmAlertTitle>{{ 'apiKeyCreated' | t }}</h2>
        <p hlmAlertDescription>{{ 'apiKeyCreatedHelp' | t }}</p>
        <button
          hlmAlertAction
          hlmBtn
          type="button"
          variant="ghost"
          size="icon-sm"
          [attr.aria-label]="'close' | t"
          (click)="created.set(null)"
        >
          <ng-icon name="lucideX" aria-hidden="true" />
        </button>
        <hlm-input-group class="col-span-full mt-3">
          <input
            hlmInputGroupInput
            class="font-mono"
            readonly
            [value]="value.secret"
            [attr.aria-label]="'apiKeyCreated' | t"
          />
          <hlm-input-group-addon align="inline-end">
            <button hlmInputGroupButton type="button" (click)="copy(value.secret)">
              <ng-icon name="lucideCopy" aria-hidden="true" />
              {{ 'copyApiKey' | t }}
            </button>
          </hlm-input-group-addon>
        </hlm-input-group>
      </section>
    }

    <section hlmCard class="min-w-0">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'applications' | t }}</h2>
        <p hlmCardDescription>{{ 'apiKeyListHelp' | t }}</p>
      </div>
      <div hlmCardContent>
        <div class="mb-4" hlmField>
          <label hlmFieldLabel class="sr-only" for="api-key-search">{{
            'searchApiKeys' | t
          }}</label>
          <input
            hlmInput
            id="api-key-search"
            class="sm:max-w-sm"
            [ngModel]="search.value()"
            (ngModelChange)="search.update($event)"
            maxlength="200"
            [placeholder]="'searchApiKeys' | t"
          />
        </div>
        <app-page-state
          [state]="keys.state()"
          [refreshError]="keys.refreshError()"
          (retry)="load()"
        >
          <app-data-table
            [columns]="columns()"
            [data]="keys.value()?.items ?? []"
            [loading]="keys.state() === 'loading' || keys.refreshing()"
            [loadingText]="'loading' | t"
            [emptyText]="'apiKeysEmpty' | t"
            [ariaLabel]="'applications' | t"
            [sortColumn]="query.text('sort', 'createdAt')"
            [sortDirection]="query.direction('desc')"
            (sortChange)="sort($event)"
          /><app-list-pager
            [total]="keys.value()?.total ?? 0"
            [page]="query.page"
            [size]="pageSize()"
            [sizeOptions]="pageSizes"
            [busy]="keys.state() === 'loading' || keys.refreshing()"
            [showSizePicker]="true"
            (sizeChange)="query.set({ pageSize: $event, page: 1 })"
            (pageChange)="query.set({ page: $event })"
          />
        </app-page-state>
      </div>
    </section>

    <hlm-drawer
      direction="right"
      [state]="createOpen() ? 'open' : 'closed'"
      [disableClose]="busy() || hasCreateChanges()"
      [closeGuard]="confirmCreateClose"
      [closeLabel]="'close' | t"
      (stateChanged)="drawerStateChanged($event)"
    >
      <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-lg">
        <hlm-drawer-header>
          <h2 hlmDrawerTitle>{{ 'createApiKey' | t }}</h2>
          <p hlmDrawerDescription>{{ 'createApiKeyHelp' | t }}</p>
        </hlm-drawer-header>
        <form class="flex min-h-0 flex-1 flex-col" (ngSubmit)="create()">
          <div hlmDrawerBody class="grid gap-5 overflow-y-auto">
            <div hlmField>
              <label hlmFieldLabel for="api-key-name">{{ 'applicationName' | t }}</label>
              <input
                hlmInput
                id="api-key-name"
                name="apiKeyName"
                maxlength="100"
                required
                [(ngModel)]="name"
                [placeholder]="'applicationNamePlaceholder' | t"
              />
              <p hlmFieldDescription>{{ 'applicationNameHelp' | t }}</p>
            </div>

            <fieldset hlmFieldSet>
              <legend hlmFieldLegend>{{ 'apiKeyScopes' | t }}</legend>
              <p hlmFieldDescription>{{ 'apiKeyScopesHelp' | t }}</p>
              <label hlmFieldLabel for="scope-articles" class="cursor-pointer">
                <div hlmField orientation="horizontal">
                  <hlm-checkbox
                    inputId="scope-articles"
                    name="scopeArticles"
                    [(ngModel)]="articles"
                    [disabled]="busy()"
                  />
                  <div hlmFieldContent>
                    <span hlmFieldTitle>{{ 'apiScope.cms.articles.read' | t }}</span>
                    <p hlmFieldDescription>{{ 'apiScopeHelp.cms.articles.read' | t }}</p>
                  </div>
                </div>
              </label>
              <label hlmFieldLabel for="scope-sections" class="cursor-pointer">
                <div hlmField orientation="horizontal">
                  <hlm-checkbox
                    inputId="scope-sections"
                    name="scopeSections"
                    [(ngModel)]="sections"
                    [disabled]="busy()"
                  />
                  <div hlmFieldContent>
                    <span hlmFieldTitle>{{ 'apiScope.cms.sections.read' | t }}</span>
                    <p hlmFieldDescription>{{ 'apiScopeHelp.cms.sections.read' | t }}</p>
                  </div>
                </div>
              </label>
            </fieldset>

            <div hlmField>
              <label hlmFieldLabel for="api-content-collections">{{
                'apiKeyCollections' | t
              }}</label
              ><input
                hlmInput
                id="api-content-collections"
                name="collections"
                [(ngModel)]="collections"
              />
              <p hlmFieldDescription>{{ 'apiKeyCollectionsHelp' | t }}</p>
            </div>
            <div hlmField>
              <label hlmFieldLabel for="api-key-expiry">{{ 'expires' | t }}</label>
              <hlm-select [(value)]="expiry" [itemToString]="expiryLabel">
                <hlm-select-trigger buttonId="api-key-expiry" class="w-full">
                  <hlm-select-value />
                </hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal [ariaLabel]="'expires' | t">
                  @for (option of expiryOptions; track option) {
                    <hlm-select-item [value]="option">{{
                      'apiExpiry.' + option | t
                    }}</hlm-select-item>
                  }
                </hlm-select-content>
              </hlm-select>
            </div>
          </div>
          <hlm-drawer-footer>
            <button
              hlmBtn
              type="submit"
              [disabled]="busy() || !name.trim() || (!articles && !sections && !collections.trim())"
            >
              {{ 'createApiKey' | t }}
            </button>
            <button
              hlmBtn
              type="button"
              variant="outline"
              [disabled]="busy()"
              (click)="closeCreate()"
            >
              {{ 'close' | t }}
            </button>
          </hlm-drawer-footer>
        </form>
      </hlm-drawer-content>
    </hlm-drawer>
  `,
})
export class ApiKeysPage {
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly keys = new Resource<ApiKeyPage>();
  readonly query = new ListQuery();
  readonly search = new DebouncedSearch(this.query);
  readonly created = signal<ApiKeyCreated | null>(null);
  readonly createOpen = signal(false);
  readonly busy = signal(false);
  readonly pageSizes = PAGE_SIZE_OPTIONS;
  readonly expiryOptions = ['30', '90', '365', 'never'];
  readonly columns = computed(() => {
    this.i18n.culture();
    const busy = this.busy();
    return column.columns([
      column.accessor('name', { header: this.i18n.text('applicationName') }),
      column.accessor('prefix', {
        header: this.i18n.text('apiKeyPrefix'),
        cell: ({ getValue }) => `${getValue()}…`,
      }),
      column.accessor('scopes', {
        header: this.i18n.text('apiKeyScopes'),
        enableSorting: false,
        cell: ({ getValue }) =>
          getValue()
            .map((scope) => this.i18n.text('apiScope.' + scope))
            .join(', '),
      }),
      column.accessor('createdAt', {
        header: this.i18n.text('createdAt'),
        cell: ({ getValue }) => this.i18n.date(getValue()),
      }),
      column.accessor('expiresAt', {
        header: this.i18n.text('expires'),
        cell: ({ getValue }) =>
          getValue() ? this.i18n.date(getValue()!) : this.i18n.text('never'),
      }),
      column.accessor((key) => this.status(key), {
        id: 'status',
        header: this.i18n.text('status'),
        cell: ({ row }) =>
          flexRenderComponent(RecordStatus, {
            inputs: {
              value: this.status(row.original),
              danger: this.status(row.original) !== 'active',
            },
          }),
      }),
      column.accessor('lastUsedAt', {
        header: this.i18n.text('lastUsed'),
        cell: ({ getValue }) =>
          getValue() ? this.i18n.date(getValue()!) : this.i18n.text('never'),
      }),
      column.accessor('requestCount', {
        header: this.i18n.text('requests'),
        cell: ({ getValue }) => this.i18n.number(getValue()),
      }),
      column.accessor('createdByName', {
        header: this.i18n.text('createdBy'),
        cell: ({ getValue }) => getValue() || '—',
      }),
      column.display({
        id: 'actions',
        enableSorting: false,
        header: this.i18n.text('actions'),
        cell: ({ row }) => {
          const active = this.status(row.original) === 'active';
          return flexRenderComponent(RowActions, {
            inputs: {
              actions: active
                ? [
                    {
                      label: 'rotateApiKey',
                      disabled: busy,
                      run: () => void this.rotate(row.original),
                    },
                    {
                      label: 'revokeApiKey',
                      disabled: busy,
                      destructive: true,
                      run: () => void this.revoke(row.original),
                    },
                  ]
                : [
                    {
                      label: 'deleteApiKey',
                      disabled: busy,
                      destructive: true,
                      run: () => void this.delete(row.original),
                    },
                  ],
            },
          });
        },
      }),
    ]);
  });
  name = '';
  collections = '';
  articles = true;
  sections = false;
  expiry = '90';
  readonly expiryLabel = (value: string) => this.i18n.text('apiExpiry.' + value);
  readonly confirmCreateClose = () =>
    !this.busy() &&
    (!this.hasCreateChanges() ||
      this.confirm.ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges'));

  constructor() {
    this.query.connect(() => {
      const value = this.query.text('search');
      if (this.search.value() !== value) this.search.sync(value);
      void this.load();
    }, ['search', 'page', 'pageSize', 'sort', 'direction']);
  }

  pageSize() {
    const size = Number(this.query.text('pageSize', String(DEFAULT_PAGE_SIZE)));
    return PAGE_SIZE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
  }

  async load() {
    const loaded = await this.keys.load((abortSignal) =>
      this.api.get<ApiKeyPage>(
        'administration/api-keys',
        {
          search: this.query.text('search'),
          pageNumber: this.query.page,
          pageSize: this.pageSize(),
          sort: this.query.text('sort', 'createdAt'),
          direction: this.query.direction('desc'),
        },
        abortSignal,
      ),
    );
    if (loaded) this.query.clamp(this.keys.value()?.total, this.pageSize());
  }

  sort(value: ServerSort) {
    void this.query.set({ sort: value.column, direction: value.direction, page: 1 });
  }

  status(key: ApiKeyItem) {
    return key.revokedAt ? 'revoked' : this.expired(key) ? 'expired' : 'active';
  }

  expired(key: ApiKeyItem) {
    return !!key.expiresAt && new Date(key.expiresAt).getTime() <= Date.now();
  }

  hasCreateChanges() {
    return (
      this.createOpen() &&
      (this.name !== '' ||
        this.collections !== '' ||
        !this.articles ||
        this.sections ||
        this.expiry !== '90')
    );
  }

  async closeCreate() {
    if (this.busy()) return;
    if (
      this.hasCreateChanges() &&
      !(await this.confirm.ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges'))
    )
      return;
    this.resetCreate();
    this.createOpen.set(false);
  }

  drawerStateChanged(state: 'open' | 'closed') {
    if (state !== 'closed') return;
    this.resetCreate();
    this.createOpen.set(false);
  }

  async create() {
    if (
      this.busy() ||
      !this.name.trim() ||
      (!this.articles && !this.sections && !this.collections.trim())
    )
      return;
    this.busy.set(true);
    try {
      const created = await this.api.post<ApiKeyCreated>('administration/api-keys', {
        name: this.name.trim(),
        scopes: [
          ...(this.articles ? ['cms.articles.read'] : []),
          ...(this.sections ? ['cms.sections.read'] : []),
          ...(this.collections.trim() ? ['cms.content.read'] : []),
        ],
        collections: this.collections
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean),
        expiresInDays: this.expiry === 'never' ? null : Number(this.expiry),
      });
      this.created.set(created);
      this.resetCreate();
      this.createOpen.set(false);
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }

  async rotate(key: ApiKeyItem) {
    if (this.busy() || !(await this.confirm.ask('rotateApiKey', 'rotateApiKeyHelp', key.name)))
      return;
    this.busy.set(true);
    try {
      const created = await this.api.post<ApiKeyCreated>(
        `administration/api-keys/${key.id}/rotate`,
      );
      this.created.set(created);
      this.toast.success('apiKeyRotated');
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }

  async revoke(key: ApiKeyItem) {
    if (this.busy() || !(await this.confirm.ask('revokeApiKey', 'revokeApiKeyHelp', key.name)))
      return;
    this.busy.set(true);
    try {
      await this.api.post(`administration/api-keys/${key.id}/revoke`);
      this.toast.success('apiKeyRevoked');
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }

  async delete(key: ApiKeyItem) {
    if (this.busy() || !(await this.confirm.ask('deleteApiKey', 'deleteApiKeyHelp', key.name)))
      return;
    this.busy.set(true);
    try {
      await this.api.delete(`administration/api-keys/${key.id}`);
      this.toast.success('apiKeyDeleted');
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }

  async copy(secret: string) {
    await navigator.clipboard.writeText(secret);
    this.toast.success('copied');
  }

  private resetCreate() {
    this.name = '';
    this.collections = '';
    this.articles = true;
    this.sections = false;
    this.expiry = '90';
  }
}

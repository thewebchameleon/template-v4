import { Component, inject, signal } from '@angular/core';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { WorkspaceUi, Resource, Confirmations, workspaceIcons } from '../../shared/workspace';
import { WorkspaceApi } from '../../core/workspace-api';
import { I18n } from '../../core/i18n';
import { Notifications } from '../notifications/notifications';
import { ApiKeyCreated, ApiKeyItem } from '../../api/models';

@Component({
  selector: 'app-api-keys',
  imports: [WorkspaceUi, HlmSelectImports],
  providers: [workspaceIcons],
  template: `
    <app-page-header eyebrow="administration" title="apiKeys" description="apiKeysIntro" />

    @if (created(); as value) {
      <section hlmAlert class="mb-6" aria-live="polite">
        <h2 hlmAlertTitle>{{ 'apiKeyCreated' | t }}</h2>
        <p hlmAlertDescription>{{ 'apiKeyCreatedHelp' | t }}</p>
        <code class="mt-3 block break-all rounded-md bg-muted p-3 font-mono text-sm select-all">{{
          value.secret
        }}</code>
        <button hlmBtn type="button" variant="outline" class="mt-3" (click)="copy(value.secret)">
          {{ 'copyApiKey' | t }}
        </button>
      </section>
    }

    <div class="workspace-columns">
      <section hlmCard class="min-w-0">
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'applications' | t }}</h2>
          <p hlmCardDescription>{{ 'apiKeyListHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <app-page-state
            [state]="keys.state()"
            [refreshError]="keys.refreshError()"
            (retry)="load()"
          >
            @if (keys.value()?.length) {
              <div class="grid gap-4">
                @for (key of keys.value(); track key.id) {
                  <article class="rounded-lg border p-4">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div class="min-w-0">
                        <h3 class="font-semibold break-words">{{ key.name }}</h3>
                        <p class="workspace-meta font-mono">{{ key.prefix }}…</p>
                      </div>
                      <span hlmBadge [variant]="key.revokedAt ? 'destructive' : 'secondary'">{{
                        (key.revokedAt ? 'revoked' : expired(key) ? 'expired' : 'active') | t
                      }}</span>
                    </div>
                    <dl class="workspace-detail-list mt-4">
                      <div>
                        <dt>{{ 'apiKeyScopes' | t }}</dt>
                        <dd class="flex flex-wrap gap-2">
                          @for (scope of key.scopes; track scope) {
                            <span hlmBadge variant="outline">{{ 'apiScope.' + scope | t }}</span>
                          }
                        </dd>
                      </div>
                      <div>
                        <dt>{{ 'expires' | t }}</dt>
                        <dd>{{ key.expiresAt ? i18n.date(key.expiresAt) : ('never' | t) }}</dd>
                      </div>
                      <div>
                        <dt>{{ 'lastUsed' | t }}</dt>
                        <dd>{{ key.lastUsedAt ? i18n.date(key.lastUsedAt) : ('never' | t) }}</dd>
                      </div>
                      <div>
                        <dt>{{ 'requests' | t }}</dt>
                        <dd>{{ i18n.number(key.requestCount) }}</dd>
                      </div>
                    </dl>
                    @if (!key.revokedAt) {
                      <button
                        hlmBtn
                        type="button"
                        variant="destructive"
                        class="mt-4"
                        [disabled]="busy()"
                        (click)="revoke(key)"
                      >
                        {{ 'revokeApiKey' | t }}
                      </button>
                    }
                  </article>
                }
              </div>
            } @else {
              <p class="workspace-meta">{{ 'apiKeysEmpty' | t }}</p>
            }
          </app-page-state>
        </div>
      </section>

      <aside hlmCard>
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'createApiKey' | t }}</h2>
          <p hlmCardDescription>{{ 'createApiKeyHelp' | t }}</p>
        </div>
        <form hlmCardContent class="grid gap-5" (ngSubmit)="create()">
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

          <button
            hlmBtn
            type="submit"
            [disabled]="busy() || !name.trim() || (!articles && !sections)"
          >
            {{ 'createApiKey' | t }}
          </button>
        </form>
      </aside>
    </div>
  `,
})
export class ApiKeysPage {
  readonly api = inject(WorkspaceApi);
  readonly i18n = inject(I18n);
  readonly toast = inject(Notifications);
  readonly confirm = inject(Confirmations);
  readonly keys = new Resource<ApiKeyItem[]>();
  readonly created = signal<ApiKeyCreated | null>(null);
  readonly busy = signal(false);
  readonly expiryOptions = ['30', '90', '365', 'never'];
  name = '';
  articles = true;
  sections = false;
  expiry = '90';
  readonly expiryLabel = (value: string) => this.i18n.text('apiExpiry.' + value);

  constructor() {
    void this.load();
  }

  load() {
    return this.keys.load((signal) =>
      this.api.get<ApiKeyItem[]>('administration/api-keys', {}, signal),
    );
  }

  expired(key: ApiKeyItem) {
    return !!key.expiresAt && new Date(key.expiresAt).getTime() <= Date.now();
  }

  async create() {
    if (this.busy() || !this.name.trim() || (!this.articles && !this.sections)) return;
    this.busy.set(true);
    try {
      const created = await this.api.post<ApiKeyCreated>('administration/api-keys', {
        name: this.name.trim(),
        scopes: [
          ...(this.articles ? ['cms.articles.read'] : []),
          ...(this.sections ? ['cms.sections.read'] : []),
        ],
        expiresInDays: this.expiry === 'never' ? null : Number(this.expiry),
      });
      this.created.set(created);
      this.name = '';
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

  async copy(secret: string) {
    await navigator.clipboard.writeText(secret);
    this.toast.success('copied');
  }
}

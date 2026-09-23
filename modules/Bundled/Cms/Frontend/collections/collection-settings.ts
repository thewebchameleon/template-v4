import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { WorkspaceUi, Resource, protectUnload } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { Auth } from '../../../../../src/TemplateV4.Angular/src/app/core/auth';
import {
  ContentCollection,
  ContentField,
  ContentWorkflow,
  ContentAccessOptions,
  ContentGrant,
} from '../../../../../src/TemplateV4.Angular/src/app/api/models';
import { ContentSchemaFields } from './schema-fields';

@Component({
  selector: 'app-content-collection-settings',
  imports: [WorkspaceUi, HlmSelectImports, ContentSchemaFields],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="cmsSchema" description="cmsSchemaHelp"
      ><a hlmBtn variant="outline" routerLink="/cms">{{ 'cmsCollections' | t }}</a></app-page-header
    >
    <app-page-state [state]="data.state()" (retry)="load()">
      @if (error()) {
        <div hlmAlert variant="destructive" role="alert" class="mb-4">
          <p hlmAlertDescription>{{ error() | t }}</p>
        </div>
      }
      <form (ngSubmit)="save()" class="grid gap-5">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'cmsCollectionSettings' | t }}</h2>
            <p hlmCardDescription>{{ 'cmsSchemaHelp' | t }}</p>
          </div>
          <div hlmCardContent>
            <fieldset [disabled]="busy() || !canSchema()" class="grid gap-4">
              <div hlmField>
                <label hlmFieldLabel for="collection-key">{{ 'cmsKey' | t }}</label
                ><input
                  hlmInput
                  id="collection-key"
                  name="key"
                  [(ngModel)]="key"
                  [readonly]="!!current()"
                  required
                  pattern="[a-z][a-z0-9-]{0,63}"
                />
              </div>
              <div hlmField>
                <label hlmFieldLabel for="collection-label">{{ 'cmsLabel' | t }}</label
                ><input
                  hlmInput
                  id="collection-label"
                  name="label"
                  [(ngModel)]="label"
                  required
                  maxlength="120"
                />
              </div>
              <label hlmFieldLabel for="collection-public" class="cursor-pointer"
                ><div hlmField orientation="horizontal">
                  <hlm-checkbox
                    inputId="collection-public"
                    name="publicRead"
                    [(ngModel)]="publicRead"
                    [disabled]="key === 'articles' || !canSchema() || busy()"
                  /><span>{{ 'cmsPublicRead' | t }}</span>
                </div></label
              >
              <app-content-schema-fields
                [(fields)]="fields"
                [original]="current()?.fields ?? []"
                [collections]="data.value() ?? []"
                [disabled]="busy() || !canSchema()"
              />
            </fieldset>
          </div>
        </section>
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'cmsWorkflow' | t }}</h2>
            <p hlmCardDescription>{{ 'cmsWorkflowHelp' | t }}</p>
          </div>
          <div hlmCardContent>
            <fieldset [disabled]="busy() || !canSchema()" class="grid gap-4">
              <label hlmFieldLabel for="approval-required" class="cursor-pointer"
                ><div hlmField orientation="horizontal">
                  <hlm-checkbox
                    inputId="approval-required"
                    name="approvalRequired"
                    [(ngModel)]="workflow.required"
                    [disabled]="busy() || !canSchema()"
                  />{{ 'cmsApprovalRequired' | t }}
                </div></label
              >
              <div hlmField>
                <label hlmFieldLabel for="approval-count">{{ 'cmsApprovalCount' | t }}</label
                ><input
                  hlmInput
                  id="approval-count"
                  name="approvals"
                  type="number"
                  min="1"
                  max="20"
                  [(ngModel)]="workflow.approvals"
                />
              </div>
              <label hlmFieldLabel for="auto-publish" class="cursor-pointer"
                ><div hlmField orientation="horizontal">
                  <hlm-checkbox
                    inputId="auto-publish"
                    name="autoPublish"
                    [(ngModel)]="workflow.autoPublish"
                    [disabled]="busy() || !canSchema()"
                  />{{ 'cmsAutoPublish' | t }}
                </div></label
              >
              <div hlmField>
                <label hlmFieldLabel for="review-users">{{ 'cmsReviewers' | t }}</label>
                <hlm-select-multiple
                  [itemToString]="userLabel"
                  [value]="workflow.users ?? []"
                  (valueChange)="workflow.users = $event"
                  [disabled]="busy() || !canSchema()"
                >
                  <hlm-select-trigger buttonId="review-users"
                    ><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal>
                    @for (user of options()?.users; track user.id) {
                      <hlm-select-item [value]="user.id">{{ user.label }}</hlm-select-item>
                    }
                  </hlm-select-content></hlm-select-multiple
                >
              </div>
              <div hlmField>
                <label hlmFieldLabel for="review-roles">{{ 'cmsReviewerRoles' | t }}</label>
                <hlm-select-multiple
                  [itemToString]="roleLabel"
                  [value]="workflow.roles ?? []"
                  (valueChange)="workflow.roles = $event"
                  [disabled]="busy() || !canSchema()"
                >
                  <hlm-select-trigger buttonId="review-roles"
                    ><hlm-select-value /></hlm-select-trigger
                  ><hlm-select-content *hlmSelectPortal>
                    @for (role of options()?.roles; track role.id) {
                      <hlm-select-item [value]="role.id">{{ role.label }}</hlm-select-item>
                    }
                  </hlm-select-content></hlm-select-multiple
                >
              </div>
            </fieldset>
          </div>
        </section>
        @if (canSchema()) {
          <button hlmBtn type="submit" [disabled]="busy()">{{ 'cmsSaveSchema' | t }}</button>
        }
      </form>
      @if (current() && auth.has('roles.manage')) {
        <section hlmCard class="mt-5">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'cmsCollectionGrants' | t }}</h2>
            <p hlmCardDescription>{{ 'cmsGrantsHelp' | t }}</p>
          </div>
          <div hlmCardContent class="grid gap-4">
            @for (role of options()?.roles; track role.id) {
              <fieldset hlmFieldSet>
                <legend hlmFieldLegend>{{ role.label }}</legend>
                <div class="flex flex-wrap gap-4">
                  @for (permission of permissions; track permission) {
                    <label hlmFieldLabel [for]="role.id + permission" class="cursor-pointer"
                      ><div hlmField orientation="horizontal">
                        <hlm-checkbox
                          [inputId]="role.id + permission"
                          [checked]="granted(role.id, permission)"
                          (checkedChange)="grant(role.id, permission, $event === true)"
                          [disabled]="busy() || protectedRole(role.label)"
                        />{{ 'permission.' + permission | t }}
                      </div></label
                    >
                  }
                </div>
              </fieldset>
            }
            <button hlmBtn type="button" (click)="saveGrants()" [disabled]="busy()">
              {{ 'cmsSaveGrants' | t }}
            </button>
          </div>
        </section>
      }
    </app-page-state>`,
})
export class ContentCollectionSettingsPage {
  readonly auth = inject(Auth);
  private readonly api = inject(WorkspaceApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly data = new Resource<ContentCollection[]>();
  readonly current = signal<ContentCollection | null>(null);
  readonly options = signal<ContentAccessOptions | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly permissions = [
    'cms.schema.manage',
    'cms.content.read',
    'cms.content.edit',
    'cms.content.review',
    'cms.content.publish',
  ];
  key = '';
  label = '';
  publicRead = false;
  fields: ContentField[] = [];
  grants: ContentGrant[] = [];
  workflow: ContentWorkflow = {
    required: true,
    approvals: 1,
    autoPublish: false,
    users: [],
    roles: [],
  };
  readonly userLabel = (id: string) => this.options()?.users.find((x) => x.id === id)?.label ?? id;
  readonly roleLabel = (id: string) => this.options()?.roles.find((x) => x.id === id)?.label ?? id;
  private savedSchema = '';
  private savedGrants = '[]';
  constructor() {
    void this.load();
  }
  canSchema() {
    return (
      this.auth.has('cms.schema.manage') || !!this.current()?.actions.includes('cms.schema.manage')
    );
  }
  snapshot() {
    return JSON.stringify([this.key, this.label, this.publicRead, this.fields, this.workflow]);
  }
  hasUnsavedChanges() {
    return (
      !!this.savedSchema &&
      (this.savedSchema !== this.snapshot() || this.savedGrants !== JSON.stringify(this.grants))
    );
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  async load() {
    await this.data.load(async (signal) => {
      const collections = await this.api.get<ContentCollection[]>('cms/collections', {}, signal);
      this.options.set(
        await this.api.get<ContentAccessOptions>('cms/collections/access-options', {}, signal),
      );
      const key = this.route.snapshot.paramMap.get('key');
      if (key)
        this.accept(await this.api.get<ContentCollection>('cms/collections/' + key, {}, signal));
      this.savedSchema = this.snapshot();
      this.savedGrants = JSON.stringify(this.grants);
      return collections;
    });
  }
  accept(value: ContentCollection) {
    this.current.set(value);
    this.key = value.key;
    this.label = value.label;
    this.publicRead = value.publicRead;
    this.fields = structuredClone(value.fields);
    this.workflow = structuredClone(value.workflow);
    this.grants = structuredClone(value.grants);
  }
  protectedRole(label: string) {
    return label === 'Administrator' || label === 'Reader';
  }
  granted(roleId: string, permission: string) {
    return this.grants.some((x) => x.roleId === roleId && x.permission === permission);
  }
  grant(roleId: string, permission: string, checked: boolean) {
    this.grants = this.grants.filter((x) => x.roleId !== roleId || x.permission !== permission);
    if (checked) this.grants.push({ roleId, permission });
  }
  async save() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const grants = this.grants;
      this.accept(
        await this.api.post<ContentCollection>('cms/collections', {
          key: this.key,
          label: this.label,
          version: this.current()?.version ?? null,
          fields: this.fields,
          workflow: this.workflow,
          publicRead: this.publicRead,
        }),
      );
      this.savedSchema = this.snapshot();
      this.savedGrants = JSON.stringify(this.current()!.grants);
      this.grants = grants;
      if (this.route.snapshot.paramMap.get('key') === null)
        await this.router.navigate(['/cms/collections', this.key, 'settings'], {
          replaceUrl: true,
        });
    } catch {
      this.error.set('cmsSchemaFailure');
    } finally {
      this.busy.set(false);
    }
  }
  async saveGrants() {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      const result = await this.api.post<ContentCollection>(
        'cms/collections/' + this.key + '/grants',
        { version: this.current()!.version, grants: this.grants },
      );
      this.current.set(result);
      this.grants = structuredClone(result.grants);
      this.savedGrants = JSON.stringify(this.grants);
    } catch {
      this.error.set('cmsSchemaFailure');
    } finally {
      this.busy.set(false);
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { WorkspaceUi, Resource, protectUnload, Confirmations } from '../../../shared/workspace';
import { WorkspaceApi } from '../../../core/workspace-api';
import { ContentCollection, ContentItem, ContentField } from '../../../api/models';
import { ContentFields, ContentValues } from './content-fields';

@Component({
  selector: 'app-content-editor',
  imports: [WorkspaceUi, HlmTextareaImports, ContentFields],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="cmsItems" description="cmsItemHelp"
      ><a hlmBtn variant="outline" [routerLink]="['/cms/collections', key]">{{
        collection.value()?.label
      }}</a></app-page-header
    >
    <app-page-state [state]="collection.state()" (retry)="load()">
      @if (error()) {
        <div hlmAlert variant="destructive" role="alert" class="mb-4">
          <p hlmAlertDescription>{{ error() | t }}</p>
          <button hlmBtn variant="outline" type="button" (click)="reload()">
            {{ 'cmsReload' | t }}
          </button>
        </div>
      }
      <form (ngSubmit)="save()">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ item()?.title || collection.value()?.label }}</h2>
            <p hlmCardDescription>{{ 'cmsItemHelp' | t }}</p>
            @if (item(); as current) {
              <div class="flex flex-wrap gap-2">
                <span hlmBadge>{{ 'cmsState.' + current.state | t }}</span>
                @if (current.published) {
                  <span hlmBadge variant="secondary">{{ 'cmsPublished' | t }}</span>
                }
                @if (current.pendingChanges) {
                  <span hlmBadge variant="outline">{{ 'cmsPending' | t }}</span>
                }
              </div>
            }
          </div>
          <div hlmCardContent class="grid gap-5">
            <app-content-fields
              [fields]="collection.value()?.fields ?? []"
              [(values)]="values"
              [disabled]="busy() || !can('cms.content.edit')"
            />
            <div class="flex flex-wrap gap-3">
              @if (can('cms.content.edit')) {
                <button hlmBtn type="submit" [disabled]="busy()">{{ 'cmsSave' | t }}</button>
              }
              @if (item(); as current) {
                @if (can('cms.content.edit') && current.state === 'Draft') {
                  <button
                    hlmBtn
                    variant="outline"
                    type="button"
                    (click)="transition('submit')"
                    [disabled]="busy() || hasUnsavedChanges()"
                  >
                    {{ 'cmsSubmit' | t }}
                  </button>
                }
                @if (can('cms.content.publish')) {
                  @if (!collection.value()?.workflow?.required || current.state === 'Approved') {
                    <button
                      hlmBtn
                      type="button"
                      (click)="transition('publish')"
                      [disabled]="busy() || hasUnsavedChanges()"
                    >
                      {{ 'cmsPublish' | t }}
                    </button>
                  }
                  @if (current.published) {
                    <button
                      hlmBtn
                      variant="destructive"
                      type="button"
                      (click)="transition('unpublish')"
                      [disabled]="busy() || hasUnsavedChanges()"
                    >
                      {{ 'cmsUnpublish' | t }}
                    </button>
                  }
                }
              }
            </div>
          </div>
        </section>
      </form>
      @if (item()?.state === 'InReview' && item()?.actions?.includes('review-assigned')) {
        <section hlmCard class="mt-5">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'cmsReview' | t }}</h2>
            <p hlmCardDescription>{{ 'cmsReviewHelp' | t }}</p>
          </div>
          <div hlmCardContent class="grid gap-3">
            <div hlmField>
              <label hlmFieldLabel for="review-comment">{{ 'cmsReviewComment' | t }}</label
              ><textarea
                hlmTextarea
                id="review-comment"
                [(ngModel)]="comment"
                maxlength="2000"
                [disabled]="busy()"
              ></textarea>
            </div>
            <div class="flex gap-3">
              <button
                hlmBtn
                type="button"
                (click)="transition('approve')"
                [disabled]="busy() || hasUnsavedChanges()"
              >
                {{ 'cmsApprove' | t }}</button
              ><button
                hlmBtn
                variant="outline"
                type="button"
                (click)="transition('changes')"
                [disabled]="busy() || hasUnsavedChanges()"
              >
                {{ 'cmsRequestChanges' | t }}
              </button>
            </div>
          </div>
        </section>
      }
      @if (item()?.decisions?.length) {
        <section hlmCard class="mt-5">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'cmsReviewDecisions' | t }}</h2>
          </div>
          <div hlmCardContent class="grid gap-3">
            @for (decision of item()?.decisions; track decision.reviewerId) {
              <div>
                <span hlmBadge variant="outline">{{ 'cmsDecision.' + decision.state | t }}</span>
                <p class="mt-1 text-sm">{{ decision.comment }}</p>
              </div>
            }
          </div>
        </section>
      }
    </app-page-state>`,
})
export class ContentEditorPage {
  private readonly api = inject(WorkspaceApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirm = inject(Confirmations);
  readonly collection = new Resource<ContentCollection>();
  readonly item = signal<ContentItem | null>(null);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly key = this.route.snapshot.paramMap.get('key') ?? 'articles';
  values: ContentValues = {};
  comment = '';
  private saved = '{}';
  constructor() {
    void this.load();
  }
  can(permission: string) {
    return this.collection.value()?.actions.includes(permission) ?? false;
  }
  hasUnsavedChanges() {
    return JSON.stringify(this.values) !== this.saved;
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  accept(item: ContentItem) {
    this.item.set(item);
    this.values = structuredClone(item.values);
    this.saved = JSON.stringify(this.values);
    this.error.set('');
    this.comment = '';
  }
  load() {
    return this.collection.load(async (signal) => {
      const collection = await this.api.get<ContentCollection>(
        'cms/collections/' + this.key,
        {},
        signal,
      );
      const id = this.route.snapshot.paramMap.get('id');
      if (id)
        this.accept(
          await this.api.get<ContentItem>(
            'cms/collections/' + this.key + '/items/' + id,
            {},
            signal,
          ),
        );
      if (!id) {
        this.values = this.initialValues(collection.fields);
        this.saved = JSON.stringify(this.values);
      }
      return collection;
    });
  }
  initialValues(fields: ContentField[]): ContentValues {
    return Object.fromEntries(
      fields
        .filter((f) => f.multiple || f.type === 'boolean' || f.type === 'group')
        .map((f) => [
          f.key,
          f.multiple ? [] : f.type === 'boolean' ? false : this.initialValues(f.fields ?? []),
        ]),
    );
  }
  async reload() {
    if (
      !this.hasUnsavedChanges() ||
      (await this.confirm.ask('cmsReload', 'cmsReloadHelp', '', true, 'cmsReload'))
    )
      await this.load();
  }
  async save() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      const creating = !this.item();
      this.accept(
        await this.api.post<ContentItem>('cms/collections/' + this.key + '/items', {
          id: this.item()?.id ?? null,
          version: this.item()?.version ?? null,
          values: this.values,
        }),
      );
      if (creating)
        await this.router.navigate(['/cms/collections', this.key, 'items', this.item()!.id], {
          replaceUrl: true,
        });
    } catch (error) {
      this.failure(error);
    } finally {
      this.busy.set(false);
    }
  }
  async transition(action: string) {
    if (this.busy() || !this.item() || this.hasUnsavedChanges()) return;
    if (
      action === 'unpublish' &&
      !(await this.confirm.ask('cmsUnpublish', 'cmsUnpublishHelp', '', true, 'cmsUnpublish'))
    )
      return;
    this.busy.set(true);
    try {
      this.accept(
        await this.api.post<ContentItem>(
          'cms/collections/' + this.key + '/items/' + this.item()!.id + '/transition',
          { version: this.item()!.version, action, comment: this.comment || null },
        ),
      );
    } catch (error) {
      this.failure(error);
    } finally {
      this.busy.set(false);
    }
  }
  failure(error: unknown) {
    const code = error instanceof HttpErrorResponse ? error.error?.code : '';
    this.error.set(
      code === 'concurrency.conflict'
        ? 'cmsConflict'
        : code === 'cms.reviewers_required'
          ? 'cmsReviewersRequired'
          : code === 'cms.approval_required'
            ? 'cmsApprovalNeeded'
            : code === 'cms.references_unpublished'
              ? 'cmsReferencesUnpublished'
              : code === 'cms.slug_locked'
                ? 'cmsSlugHelp'
                : 'cmsItemFailure',
    );
  }
}

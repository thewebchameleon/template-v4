import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  Confirmations,
  protectUnload,
} from '../../../shared/workspace';
import { WorkspaceApi } from '../../../core/workspace-api';
import { Notifications } from '../../notifications/notifications';
import { ArticleContent, CmsArticle, MarkdownPreview } from '../../../api/models';

@Component({
  selector: 'app-cms-editor',
  imports: [WorkspaceUi, HlmTextareaImports],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header title="cms" description="cmsEditHelp"
      ><a hlmBtn variant="outline" routerLink="/cms">{{ 'cmsArticles' | t }}</a></app-page-header
    >
    <app-page-state [state]="data.state()" (retry)="load()">
      @if (conflict()) {
        <div hlmAlert variant="destructive" class="mb-4" role="alert">
          <p hlmAlertDescription>{{ 'cmsConflict' | t }}</p>
          <button hlmBtn variant="outline" type="button" (click)="reload()">
            {{ 'cmsReload' | t }}
          </button>
        </div>
      }
      <form #form="ngForm" (ngSubmit)="save()">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ (article()?.id ? 'cmsArticles' : 'cmsNew') | t }}</h2>
            <p hlmCardDescription>
              {{ (article()?.published ? 'cmsPendingHelp' : 'cmsEditHelp') | t }}
            </p>
          </div>
          <div hlmCardContent class="grid gap-5">
            <fieldset [disabled]="busy()" class="grid min-w-0 gap-5">
              <div hlmField>
                <label hlmFieldLabel for="cms-title">{{ 'cmsTitle' | t }}</label>
                <input
                  hlmInput
                  id="cms-title"
                  name="title"
                  [(ngModel)]="content.title"
                  required
                  maxlength="200"
                />
              </div>
              <div class="grid gap-5 sm:grid-cols-2">
                <div hlmField>
                  <label hlmFieldLabel for="cms-slug">{{ 'cmsSlug' | t }}</label>
                  <input
                    hlmInput
                    id="cms-slug"
                    name="slug"
                    [(ngModel)]="content.slug"
                    required
                    maxlength="160"
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    [readonly]="!!article()?.publishedAt"
                    aria-describedby="cms-slug-help"
                  />
                  <p hlmFieldDescription id="cms-slug-help">{{ 'cmsSlugHelp' | t }}</p>
                </div>
                <div hlmField>
                  <label hlmFieldLabel for="cms-author">{{ 'cmsAuthor' | t }}</label>
                  <input
                    hlmInput
                    id="cms-author"
                    name="author"
                    [(ngModel)]="content.author"
                    required
                    maxlength="120"
                  />
                </div>
              </div>
              <div hlmField>
                <label hlmFieldLabel for="cms-excerpt">{{ 'cmsExcerpt' | t }}</label>
                <textarea
                  hlmTextarea
                  id="cms-excerpt"
                  name="excerpt"
                  [(ngModel)]="content.excerpt"
                  required
                  maxlength="500"
                  rows="3"
                ></textarea>
              </div>
              <div hlmField>
                <label hlmFieldLabel for="cms-body">{{ 'cmsMarkdown' | t }}</label>
                <textarea
                  hlmTextarea
                  id="cms-body"
                  name="markdown"
                  [(ngModel)]="content.markdown"
                  required
                  maxlength="100000"
                  rows="18"
                  aria-describedby="cms-markdown-help"
                ></textarea>
                <p hlmFieldDescription id="cms-markdown-help">{{ 'cmsMarkdownHelp' | t }}</p>
              </div>
            </fieldset>
            <div class="flex flex-wrap gap-3">
              <button hlmBtn type="submit" [disabled]="busy() || !form.valid || conflict()">
                {{ 'cmsSave' | t }}
              </button>
              <button
                hlmBtn
                variant="outline"
                type="button"
                (click)="preview()"
                [disabled]="busy()"
              >
                {{ 'cmsPreview' | t }}
              </button>
              @if (article(); as current) {
                <button
                  hlmBtn
                  type="button"
                  (click)="publish(true)"
                  [disabled]="busy() || hasUnsavedChanges() || conflict()"
                >
                  {{ (current.publishedAt ? 'cmsRepublish' : 'cmsPublish') | t }}
                </button>
                @if (current.published) {
                  <button
                    hlmBtn
                    variant="destructive"
                    type="button"
                    (click)="publish(false)"
                    [disabled]="busy() || hasUnsavedChanges() || conflict()"
                  >
                    {{ 'cmsUnpublish' | t }}
                  </button>
                }
              }
            </div>
          </div>
        </section>
      </form>
      @if (previewHtml() !== null) {
        <section hlmCard class="mt-6" aria-live="polite">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'cmsPreview' | t }}</h2>
            <p hlmCardDescription>{{ 'cmsPreviewHelp' | t }}</p>
          </div>
          <div hlmCardContent>
            @if (previewSource !== content.markdown) {
              <p role="status">{{ 'cmsPreviewStale' | t }}</p>
            }
            <div class="cms-prose" [innerHTML]="previewHtml()"></div>
          </div>
        </section>
      }
    </app-page-state>`,
})
export class CmsEditorPage {
  private readonly api = inject(WorkspaceApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmations = inject(Confirmations);
  private readonly toast = inject(Notifications);
  readonly data = new Resource<CmsArticle | null>();
  readonly article = signal<CmsArticle | null>(null);
  readonly busy = signal(false);
  readonly conflict = signal(false);
  readonly previewHtml = signal<string | null>(null);
  previewSource = '';
  content: ArticleContent = { title: '', slug: '', excerpt: '', markdown: '', author: '' };
  private saved = JSON.stringify(this.content);
  constructor() {
    void this.load();
  }
  hasUnsavedChanges() {
    return JSON.stringify(this.content) !== this.saved;
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  async load() {
    const id = this.route.snapshot.paramMap.get('id');
    const loaded = await this.data.load((signal) =>
      id ? this.api.get<CmsArticle>('cms/' + id, {}, signal) : Promise.resolve(null),
    );
    if (loaded && this.data.value()) this.accept(this.data.value()!);
  }
  private accept(article: CmsArticle) {
    this.article.set(article);
    this.content = { ...article.draft };
    this.saved = JSON.stringify(this.content);
    this.conflict.set(false);
  }
  async reload() {
    if (this.busy()) return;
    if (await this.confirmations.ask('cmsReload', 'cmsReloadHelp', '', true, 'cmsReload')) {
      this.previewHtml.set(null);
      this.busy.set(true);
      try {
        await this.load();
      } finally {
        this.busy.set(false);
      }
    }
  }
  async save() {
    if (this.busy() || this.conflict()) return;
    this.busy.set(true);
    try {
      const result = await this.api.post<CmsArticle>('cms', {
        id: this.article()?.id ?? null,
        version: this.article()?.version ?? null,
        content: this.content,
      });
      const creating = !this.article();
      this.accept(result);
      this.toast.success('cmsSaved');
      if (creating) await this.router.navigate(['/cms', result.id], { replaceUrl: true });
    } catch (error) {
      this.handleError(error);
    } finally {
      this.busy.set(false);
    }
  }
  async publish(published: boolean) {
    const article = this.article();
    if (!article || this.busy() || this.hasUnsavedChanges() || this.conflict()) return;
    if (
      !published &&
      !(await this.confirmations.ask('cmsUnpublish', 'cmsUnpublishHelp', '', true, 'cmsUnpublish'))
    )
      return;
    this.busy.set(true);
    try {
      this.accept(
        await this.api.post<CmsArticle>('cms/' + article.id + '/publish', {
          version: article.version,
          published,
        }),
      );
      this.toast.success('cmsPublicationSaved');
    } catch (error) {
      this.handleError(error);
    } finally {
      this.busy.set(false);
    }
  }
  async preview() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      const source = this.content.markdown;
      const result = await this.api.post<MarkdownPreview>('cms/preview', { markdown: source });
      this.previewSource = source;
      this.previewHtml.set(result.html);
    } catch {
      /* Central error UI retains the draft. */
    } finally {
      this.busy.set(false);
    }
  }
  private handleError(error: unknown) {
    if (
      error instanceof HttpErrorResponse &&
      error.status === 409 &&
      error.error?.code === 'concurrency.conflict'
    )
      this.conflict.set(true);
  }
}

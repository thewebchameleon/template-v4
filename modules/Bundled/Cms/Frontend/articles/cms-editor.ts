import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  WorkspaceUi,
  workspaceIcons,
  Resource,
  Confirmations,
  protectUnload,
} from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { Notifications } from '../../../../../src/TemplateV4.Angular/src/app/features/notifications/notifications';
import { ArticleContent, CmsArticle } from '../../../../../src/TemplateV4.Angular/src/app/api/models';
import { CmsMarkdownEditor } from './cms-markdown-editor';

@Component({
  selector: 'app-cms-editor',
  imports: [WorkspaceUi, CmsMarkdownEditor],
  providers: [workspaceIcons],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: ` <app-page-header title="cms" description="cmsEditHelp"
      ><a hlmBtn variant="outline" routerLink="/cms">{{ 'cmsArticles' | t }}</a></app-page-header
    >
    <app-page-state [state]="data.state()" (retry)="load()" skeleton="form-card">
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
                  [ngModel]="content.title"
                  (ngModelChange)="titleChanged($event)"
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
                    [ngModel]="content.slug"
                    (ngModelChange)="slugChanged($event)"
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
                <app-cms-markdown-editor
                  inputId="cms-body"
                  describedBy="cms-markdown-help"
                  name="markdown"
                  [(ngModel)]="content.markdown"
                  [disabled]="busy()"
                  required
                  maxlength="100000"
                />
                <p hlmFieldDescription id="cms-markdown-help">{{ 'cmsMarkdownHelp' | t }}</p>
              </div>
            </fieldset>
            <div class="flex flex-wrap gap-3">
              <button hlmBtn type="submit" [disabled]="busy() || !form.valid || conflict()">
                {{ 'cmsSave' | t }}
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
  content: ArticleContent = { title: '', slug: '', excerpt: '', markdown: '', author: '' };
  private saved = JSON.stringify(this.content);
  private slugIsAutomatic = true;
  constructor() {
    void this.load();
  }
  titleChanged(title: string) {
    this.content.title = title;
    if (this.slugIsAutomatic) this.content.slug = this.toSlug(title);
  }
  slugChanged(slug: string) {
    this.content.slug = slug;
    this.slugIsAutomatic = false;
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
    this.slugIsAutomatic = false;
    this.saved = JSON.stringify(this.content);
    this.conflict.set(false);
  }
  private toSlug(title: string) {
    return title
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 160)
      .replace(/-+$/g, '');
  }
  async reload() {
    if (this.busy()) return;
    if (await this.confirmations.ask('cmsReload', 'cmsReloadHelp', '', true, 'cmsReload')) {
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
  private handleError(error: unknown) {
    if (
      error instanceof HttpErrorResponse &&
      error.status === 409 &&
      error.error?.code === 'concurrency.conflict'
    )
      this.conflict.set(true);
  }
}

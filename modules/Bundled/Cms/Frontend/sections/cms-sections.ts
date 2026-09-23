import { Component, OnInit, inject, signal } from '@angular/core';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { WorkspaceUi, protectUnload } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { CmsSections, LandingSection } from '../../../../../src/TemplateV4.Angular/src/app/api/models';
@Component({
  selector: 'app-cms-sections',
  imports: [WorkspaceUi, HlmTextareaImports],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="cmsSections" description="cmsSectionsHelp"
      ><a hlmBtn variant="outline" routerLink="/cms">{{ 'cmsArticles' | t }}</a></app-page-header
    >
    @if (failed()) {
      <div hlmAlert variant="destructive" role="alert">
        <p hlmAlertDescription>{{ 'cmsSectionsFailure' | t }}</p>
        <button hlmBtn variant="outline" (click)="load()">{{ 'retry' | t }}</button>
      </div>
    }
    @if (data()) {
      <form #form="ngForm" (ngSubmit)="form.valid && save()">
        <div class="grid gap-6">
          @for (section of sections; track section.key) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>{{ labels[section.key] | t }}</h2>
              </div>
              <div hlmCardContent class="grid gap-4">
                <fieldset hlmFieldSet [disabled]="busy()" class="grid gap-4">
                  <div hlmField>
                    <label hlmFieldLabel [for]="section.key + '-heading'">{{
                      'cmsSectionHeading' | t
                    }}</label
                    ><input
                      hlmInput
                      [id]="section.key + '-heading'"
                      [name]="section.key + '-heading'"
                      [(ngModel)]="section.heading"
                      maxlength="200"
                      [required]="!!section.text"
                    />
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel [for]="section.key + '-text'">{{
                      'cmsSectionText' | t
                    }}</label
                    ><textarea
                      hlmTextarea
                      [id]="section.key + '-text'"
                      [name]="section.key + '-text'"
                      [(ngModel)]="section.text"
                      maxlength="4000"
                      rows="4"
                      [required]="!!section.heading"
                    ></textarea>
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel [for]="section.key + '-image'">{{
                      'cmsSectionImage' | t
                    }}</label
                    ><input
                      hlmInput
                      [id]="section.key + '-image'"
                      [name]="section.key + '-image'"
                      [(ngModel)]="section.imageUrl"
                      maxlength="2048"
                    />
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel [for]="section.key + '-alt'">{{
                      'cmsSectionImageAlt' | t
                    }}</label
                    ><input
                      hlmInput
                      [id]="section.key + '-alt'"
                      [name]="section.key + '-alt'"
                      [(ngModel)]="section.imageAlt"
                      maxlength="200"
                      [required]="!!section.imageUrl"
                    />
                  </div>
                </fieldset>
              </div>
            </section>
          }
          <div class="flex flex-wrap gap-3">
            <button hlmBtn type="submit" [disabled]="busy() || form.invalid">
              {{ 'cmsSave' | t }}</button
            ><button
              hlmBtn
              variant="outline"
              type="button"
              [disabled]="busy() || hasUnsavedChanges()"
              (click)="publish()"
            >
              {{ 'cmsPublishSections' | t }}
            </button>
          </div>
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'cmsSectionsPreview' | t }}</h2>
            </div>
            <div hlmCardContent>
              @for (section of data()!.draft; track section.key) {
                <article class="mb-6">
                  <h3>{{ section.heading }}</h3>
                  <p class="whitespace-pre-line">{{ section.text }}</p>
                  @if (section.imageUrl) {
                    <img
                      [src]="section.imageUrl"
                      [alt]="section.imageAlt"
                      width="480"
                      height="260"
                      class="max-w-full object-cover"
                    />
                  }
                </article>
              }
            </div>
          </section>
        </div>
      </form>
    } @else if (!failed()) {
      <p role="status">{{ 'loading' | t }}</p>
    }
    @if (saved()) {
      <p role="status">{{ 'cmsSectionsChanged' | t }}</p>
    }`,
})
export class CmsSectionsPage implements OnInit {
  private readonly api = inject(WorkspaceApi);
  readonly data = signal<CmsSections | null>(null);
  readonly busy = signal(false);
  readonly failed = signal(false);
  readonly saved = signal(false);
  sections: LandingSection[] = [];
  private baseline = '';
  readonly labels: Record<string, string> = {
    hero: 'cmsSectionHero',
    about: 'cmsSectionAbout',
    services: 'cmsSectionServices',
    testimonials: 'cmsSectionTestimonials',
    contact: 'cmsSectionContact',
  };
  ngOnInit() {
    void this.load();
  }
  hasUnsavedChanges() {
    return !!this.baseline && JSON.stringify(this.sections) !== this.baseline;
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.hasUnsavedChanges());
  }
  private accept(value: CmsSections) {
    this.data.set(value);
    this.sections = Object.keys(this.labels).map((key) => ({
      ...(value.draft.find((x) => x.key === key) ?? {
        key,
        heading: '',
        text: '',
        imageUrl: '',
        imageAlt: '',
      }),
    }));
    this.baseline = JSON.stringify(this.sections);
  }
  async load() {
    this.failed.set(false);
    try {
      this.accept(await this.api.get<CmsSections>('cms/sections'));
    } catch {
      this.failed.set(true);
    }
  }
  async save() {
    this.busy.set(true);
    this.failed.set(false);
    this.saved.set(false);
    try {
      this.accept(
        await this.api.post<CmsSections>('cms/sections', {
          version: this.data()!.version,
          sections: this.sections.filter((x) => x.heading.trim() || x.text.trim()),
        }),
      );
      this.saved.set(true);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
  async publish() {
    this.busy.set(true);
    this.failed.set(false);
    try {
      this.accept(
        await this.api.post<CmsSections>('cms/sections/publish', { version: this.data()!.version }),
      );
      this.saved.set(true);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}

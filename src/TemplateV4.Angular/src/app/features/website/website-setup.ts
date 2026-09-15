import { Component, OnInit, inject, signal } from '@angular/core';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { WorkspaceUi, protectUnload } from '../../shared/workspace';
import { WorkspaceApi } from '../../core/workspace-api';
import { WebsiteImageUpload } from './website-image';
import { BusinessDetails, WebsiteSettings } from '../../api/models';

@Component({
  selector: 'app-website-setup',
  imports: [WorkspaceUi, HlmTextareaImports, WebsiteImageUpload],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="websiteSetup" description="websiteSetupHelp" />
    @if (loading()) {
      <p role="status">{{ 'loading' | t }}</p>
    }
    @if (failed()) {
      <div hlmAlert variant="destructive" role="alert">
        <p hlmAlertDescription>{{ 'websiteFailure' | t }}</p>
        <button hlmBtn variant="outline" (click)="load()">{{ 'retry' | t }}</button>
      </div>
    }
    @if (settings(); as site) {
      <p role="status">{{ (site.enabled ? 'websiteEnabled' : 'websiteDisabled') | t }}</p>
      <ol class="mb-6 flex flex-wrap gap-6" [attr.aria-label]="'websiteSetup' | t">
        <li [attr.aria-current]="step() === 1 ? 'step' : null">{{ 'websiteStepBusiness' | t }}</li>
        <li [attr.aria-current]="step() === 2 ? 'step' : null">{{ 'websiteStepBrand' | t }}</li>
        <li [attr.aria-current]="step() === 3 ? 'step' : null">{{ 'websiteStepReview' | t }}</li>
      </ol>
      @if (step() < 3) {
        <form #form="ngForm" (ngSubmit)="form.valid && next()">
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>
                {{ (step() === 1 ? 'websiteStepBusiness' : 'websiteStepBrand') | t }}
              </h2>
            </div>
            <div hlmCardContent class="grid gap-6">
              <fieldset hlmFieldSet [disabled]="busy()" class="grid gap-4 sm:grid-cols-2">
                @for (field of currentFields(); track field.key) {
                  <div hlmField>
                    <label hlmFieldLabel [for]="field.key">{{ field.label | t }}</label
                    ><input
                      hlmInput
                      [id]="field.key"
                      [name]="field.key"
                      [type]="field.type"
                      [(ngModel)]="details[field.key]"
                      required
                      [maxlength]="field.max"
                      [pattern]="field.key === 'primaryColor' ? '#[0-9a-fA-F]{6}' : '.*'"
                    />
                  </div>
                }
                @if (step() === 1) {
                  <div hlmField>
                    <label hlmFieldLabel for="description">{{ 'websiteDescription' | t }}</label
                    ><textarea
                      hlmTextarea
                      id="description"
                      name="description"
                      [(ngModel)]="details.description"
                      required
                      maxlength="1000"
                      rows="4"
                    ></textarea>
                  </div>
                } @else {
                  <div hlmField>
                    <label hlmFieldLabel for="seoDescription">{{
                      'websiteSeoDescription' | t
                    }}</label
                    ><textarea
                      hlmTextarea
                      id="seoDescription"
                      name="seoDescription"
                      [(ngModel)]="details.seoDescription"
                      required
                      maxlength="500"
                      rows="4"
                    ></textarea>
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="recipient">{{ 'websiteRecipient' | t }}</label
                    ><input
                      hlmInput
                      id="recipient"
                      name="recipient"
                      type="email"
                      email
                      [(ngModel)]="recipient"
                      required
                      maxlength="254"
                    />
                  </div>
                }
              </fieldset>
              @if (step() === 2) {
                <app-website-image
                  controlId="website-logo-upload"
                  (uploaded)="details.logoUrl = $event"
                />
              }
              <div class="flex gap-3">
                @if (step() === 2) {
                  <button
                    hlmBtn
                    variant="outline"
                    type="button"
                    [disabled]="busy()"
                    (click)="step.set(1)"
                  >
                    {{ 'websiteBack' | t }}
                  </button>
                }
                <button hlmBtn type="submit" [disabled]="busy() || form.invalid">
                  {{ (step() === 1 ? 'websiteNext' : 'websiteSave') | t }}
                </button>
              </div>
            </div>
          </section>
        </form>
      }
      @if (site.configured && step() === 3) {
        <section hlmCard class="mt-6">
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'websitePreview' | t }}</h2>
            <p hlmCardDescription>{{ 'websitePreviewHelp' | t }}</p>
          </div>
          <div hlmCardContent>
            <div class="website-preview" [style.border-color]="site.details.primaryColor">
              <img [src]="site.details.logoUrl" [alt]="site.details.name" width="64" height="64" />
              <p>{{ site.details.name }}</p>
              <h2>{{ site.details.name }} — {{ 'websiteHero' | t }}</h2>
              <p>{{ site.details.description }}</p>
              <p>{{ site.details.email }} · {{ site.details.phone }}</p>
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <button hlmBtn variant="outline" [disabled]="busy()" (click)="step.set(1)">
                {{ 'websiteEdit' | t }}</button
              ><button hlmBtn [disabled]="busy() || dirty()" (click)="toggle()">
                {{ (site.enabled ? 'websiteDisable' : 'websiteEnable') | t }}
              </button>
              @if (site.enabled) {
                <a
                  hlmBtn
                  variant="outline"
                  [href]="site.details.publicUrl"
                  target="_blank"
                  rel="noopener"
                  >{{ 'websiteOpen' | t }}</a
                >
              }
            </div>
          </div>
        </section>
      }
    }
    @if (saved()) {
      <p role="status">{{ 'websiteChanged' | t }}</p>
    }`,
  styles: `
    .website-preview {
      border: 2px solid;
      border-radius: 1rem;
      padding: 2rem;
    }
    .website-preview img {
      object-fit: contain;
    }
  `,
})
export class WebsiteSetupPage implements OnInit {
  private readonly api = inject(WorkspaceApi);
  readonly settings = signal<WebsiteSettings | null>(null);
  readonly busy = signal(false);
  readonly failed = signal(false);
  readonly saved = signal(false);
  readonly loading = signal(true);
  details = {} as BusinessDetails;
  recipient = '';
  private baseline = '';
  readonly step = signal(1);
  currentFields() {
    const business = ['name', 'email', 'phone', 'address'];
    return this.fields.filter((field) => business.includes(field.key) === (this.step() === 1));
  }
  async next() {
    if (this.step() === 1) this.step.set(2);
    else await this.save();
  }
  readonly fields: { key: keyof BusinessDetails; label: string; type: string; max: number }[] = [
    { key: 'name', label: 'websiteName', type: 'text', max: 120 },
    { key: 'logoUrl', label: 'websiteLogo', type: 'text', max: 2048 },
    { key: 'primaryColor', label: 'websiteColor', type: 'text', max: 7 },
    { key: 'email', label: 'websiteEmail', type: 'email', max: 254 },
    { key: 'phone', label: 'websitePhone', type: 'tel', max: 60 },
    { key: 'address', label: 'websiteAddress', type: 'text', max: 500 },
    { key: 'publicUrl', label: 'websitePublicUrl', type: 'url', max: 2048 },
    { key: 'adminUrl', label: 'websiteAdminUrl', type: 'url', max: 2048 },
    { key: 'seoTitle', label: 'websiteSeoTitle', type: 'text', max: 200 },
  ];
  ngOnInit() {
    void this.load();
  }
  private accept(site: WebsiteSettings) {
    this.settings.set(site);
    this.details = { ...site.details };
    this.recipient = site.notificationEmail;
    this.baseline = JSON.stringify([this.details, this.recipient]);
    this.step.set(site.configured ? 3 : 1);
  }
  dirty() {
    return !!this.baseline && JSON.stringify([this.details, this.recipient]) !== this.baseline;
  }
  hasUnsavedChanges() {
    return this.dirty();
  }
  beforeUnload(event: BeforeUnloadEvent) {
    protectUnload(event, this.dirty());
  }
  async load() {
    this.loading.set(true);
    this.failed.set(false);
    try {
      this.accept(await this.api.get<WebsiteSettings>('website'));
    } catch {
      this.failed.set(true);
    } finally {
      this.loading.set(false);
    }
  }
  async save() {
    this.busy.set(true);
    this.failed.set(false);
    this.saved.set(false);
    try {
      this.accept(
        await this.api.post<WebsiteSettings>('website', {
          version: this.settings()!.version,
          details: this.details,
          notificationEmail: this.recipient,
        }),
      );
      this.saved.set(true);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
  async toggle() {
    this.busy.set(true);
    this.failed.set(false);
    try {
      this.accept(
        await this.api.post<WebsiteSettings>('website/enabled', {
          version: this.settings()!.version,
          enabled: !this.settings()!.enabled,
        }),
      );
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}

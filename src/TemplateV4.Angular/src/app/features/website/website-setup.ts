import { Component, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { BusinessDetails, WebsiteSettings } from '../../api/models';
import { WorkspaceApi } from '../../core/workspace-api';
import { Translate } from '../../core/i18n';
import { protectUnload } from '../../shared/confirmation';
import { AuthLayout } from '../identity/authentication/auth-layout';
import { WebsiteImageUpload } from './website-image';

@Component({
  selector: 'app-website-setup',
  imports: [
    FormsModule,
    HlmAlertImports,
    HlmButtonImports,
    HlmFieldImports,
    HlmInputImports,
    HlmSpinnerImports,
    AuthLayout,
    Translate,
    WebsiteImageUpload,
  ],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `
    <app-auth-layout>
      <div hlmFieldGroup>
        <div class="auth-heading">
          <h1 class="auth-title">{{ 'websiteSetup' | t }}</h1>
          <p class="auth-description">{{ 'websiteSetupHelp' | t }}</p>
        </div>

        @if (loading()) {
          <p role="status" class="flex items-center gap-2"><hlm-spinner />{{ 'loading' | t }}</p>
        } @else if (failed() && !settings()) {
          <div hlmAlert variant="destructive" role="alert">
            <p hlmAlertDescription>{{ 'websiteFailure' | t }}</p>
            <button hlmBtn variant="outline" (click)="load()">{{ 'retry' | t }}</button>
          </div>
        } @else {
          @if (failed()) {
            <div hlmAlert variant="destructive" role="alert">
              <p hlmAlertDescription>{{ 'websiteFailure' | t }}</p>
            </div>
          }

          <form hlmFieldGroup class="auth-fields" #form="ngForm" (ngSubmit)="form.valid && save()">
            <div hlmField>
              <label hlmFieldLabel for="website-name">{{ 'websiteName' | t }}</label>
              <input
                hlmInput
                id="website-name"
                name="name"
                autocomplete="organization"
                [(ngModel)]="name"
                #nameControl="ngModel"
                required
                maxlength="120"
              />
              @if (nameControl.invalid && nameControl.touched) {
                <hlm-field-error>{{ 'websiteNameRequired' | t }}</hlm-field-error>
              }
            </div>

            <app-website-image
              #logoUpload
              controlId="website-logo-upload"
              [value]="logoUrl"
              (uploaded)="logoUrl = $event"
            />

            <button hlmBtn type="submit" [disabled]="busy() || logoUpload.busy() || form.invalid">
              @if (busy()) {
                <hlm-spinner />
              }
              {{ 'websiteSave' | t }}
            </button>
          </form>
        }
      </div>
    </app-auth-layout>
  `,
})
export class WebsiteSetupPage implements OnInit {
  private readonly api = inject(WorkspaceApi);
  private readonly router = inject(Router);
  private readonly logoUpload = viewChild(WebsiteImageUpload);
  readonly settings = signal<WebsiteSettings | null>(null);
  readonly busy = signal(false);
  readonly failed = signal(false);
  readonly loading = signal(true);
  name = '';
  logoUrl = '';
  private baseline = '';

  ngOnInit() {
    void this.load();
  }

  private accept(site: WebsiteSettings) {
    this.settings.set(site);
    this.name = site.details.name;
    this.logoUrl = site.details.logoUrl;
    this.baseline = JSON.stringify([this.name, this.logoUrl]);
  }

  dirty() {
    return !!this.baseline && JSON.stringify([this.name, this.logoUrl]) !== this.baseline;
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
    if (this.busy() || this.logoUpload()?.busy()) return;
    this.busy.set(true);
    this.failed.set(false);
    try {
      this.accept(
        await this.api.post<WebsiteSettings>('website', {
          version: this.settings()!.version,
          details: this.details(),
        }),
      );
      await this.router.navigateByUrl('/dashboard');
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }

  private details(): BusinessDetails {
    return {
      name: this.name.trim(),
      logoUrl: this.logoUrl,
      description: '',
      primaryColor: '',
      email: '',
      phone: '',
      address: '',
      publicUrl: '',
      adminUrl: '',
      seoTitle: '',
      seoDescription: '',
    };
  }
}

import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { WorkspaceUi, Resource, protectUnload } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { Notifications } from '../core/notifications';
import { SupportOptions } from '../api/models';

@Component({
  selector: 'app-support-new',
  imports: [HlmSelectImports, WorkspaceUi, HlmTextareaImports, HlmDrawerImports],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `@if (!embedded()) {
      <app-page-header title="supportTicketDetails" description="supportNewHelp" />
    }
    <form class="flex min-h-0 flex-1 flex-col" #form="ngForm" (ngSubmit)="form.valid && save()">
      <div hlmDrawerBody class="min-h-0 flex-1 overflow-y-auto">
        <app-page-state [state]="options.state()" (retry)="load()">
          <div class="grid gap-4">
            <div hlmField>
              <label hlmFieldLabel for="subject">{{ 'supportSubject' | t }}</label
              ><input
                hlmInput
                id="subject"
                name="subject"
                [(ngModel)]="subject"
                required
                maxlength="180"
                #subjectField="ngModel"
              />
              @if (subjectField.invalid && subjectField.touched) {
                <hlm-field-error>{{ 'supportRequired' | t }}</hlm-field-error>
              }
            </div>
            <div hlmField>
              <label hlmFieldLabel for="category">{{ 'supportCategory' | t }}</label
              ><hlm-select
                [value]="category || undefined"
                [itemToString]="categoryLabel"
                (valueChange)="category = $event ?? ''"
              >
                <hlm-select-trigger buttonId="category" class="w-full">
                  <hlm-select-value [placeholder]="'supportChooseCategory' | t" />
                </hlm-select-trigger>
                <hlm-select-content *hlmSelectPortal [ariaLabel]="'supportCategory' | t">
                  @for (c of options.value()?.categories ?? []; track c.id) {
                    @if (c.active) {
                      <hlm-select-item [value]="c.id">{{ c.name }}</hlm-select-item>
                    }
                  }
                </hlm-select-content>
              </hlm-select>
            </div>
            <div hlmField>
              <label hlmFieldLabel for="description">{{ 'supportDescription' | t }}</label
              ><textarea
                hlmTextarea
                id="description"
                name="description"
                [(ngModel)]="description"
                required
                maxlength="10000"
                rows="8"
                #bodyField="ngModel"
              ></textarea>
              @if (bodyField.invalid && bodyField.touched) {
                <hlm-field-error>{{ 'supportRequired' | t }}</hlm-field-error>
              }
            </div>
          </div>
        </app-page-state>
      </div>
      <hlm-drawer-footer>
        <button
          hlmBtn
          type="submit"
          [disabled]="
            busy() ||
            options.state() !== 'ready' ||
            !form.valid ||
            !category ||
            !subject.trim() ||
            !description.trim()
          "
        >
          @if (busy()) {
            <hlm-spinner />
          }
          {{ 'supportSubmit' | t }}
        </button>
      </hlm-drawer-footer>
    </form>`,
})
export class SupportNewPage {
  readonly embedded = input(false);
  readonly api = inject(WorkspaceApi);
  readonly router = inject(Router);
  readonly toast = inject(Notifications);
  readonly options = new Resource<SupportOptions>();
  readonly busy = signal(false);
  subject = '';
  description = '';
  category = '';
  readonly categoryLabel = (id: string) =>
    this.options.value()?.categories.find((category) => category.id === id)?.name ?? '';
  constructor() {
    void this.load();
  }
  load() {
    return this.options.load((signal) => this.api.get('support/options', {}, signal));
  }
  hasUnsavedChanges() {
    return !!(this.subject || this.description || this.category);
  }
  beforeUnload(e: BeforeUnloadEvent) {
    protectUnload(e, this.hasUnsavedChanges());
  }
  async save() {
    if (this.busy() || !this.category) return;
    this.busy.set(true);
    try {
      const id = await this.api.post<string>('support/', {
        subject: this.subject,
        description: this.description,
        categoryId: this.category,
      });
      this.subject = '';
      this.description = '';
      this.category = '';
      this.toast.success('supportCreated');
      await this.router.navigate(['/support', id]);
    } catch {
      /* Central error UI retains the draft. */
    } finally {
      this.busy.set(false);
    }
  }
}

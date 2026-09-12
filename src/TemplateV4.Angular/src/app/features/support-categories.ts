import { Component, inject, signal } from '@angular/core';
import { WorkspaceUi, Resource, Confirmations, protectUnload } from '../shared/workspace';
import { WorkspaceApi } from '../core/workspace-api';
import { Notifications } from '../core/notifications';
import { SupportOptions, SupportCategory } from '../api/models';

@Component({
  selector: 'app-support-categories',
  imports: [WorkspaceUi],
  host: { '(window:beforeunload)': 'beforeUnload($event)' },
  template: `<app-page-header title="supportCategories" description="supportCategoriesHelp"
      ><a hlmBtn variant="outline" routerLink="/support">{{ 'support' | t }}</a></app-page-header
    >
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()"
      ><div class="grid gap-6 lg:grid-cols-2">
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'supportCategories' | t }}</h2>
            <p hlmCardDescription>{{ 'supportCategoryLimit' | t }}</p>
          </div>
          <div hlmCardContent class="grid gap-2">
            @for (c of data.value()?.categories ?? []; track c.id) {
              <button hlmBtn variant="outline" [disabled]="busy()" (click)="edit(c)">
                {{ c.name }} · {{ (c.active ? 'enabled' : 'disabled') | t }}
              </button>
            }
          </div>
        </section>
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>
              {{ (selected ? 'supportEditCategory' : 'supportAddCategory') | t }}
            </h2>
            <p hlmCardDescription>{{ 'supportCategoryRetain' | t }}</p>
          </div>
          <form #form="ngForm" (ngSubmit)="form.valid && save()">
            <div hlmCardContent class="grid gap-4">
              <div hlmField>
                <label hlmFieldLabel for="category-name">{{ 'name' | t }}</label
                ><input
                  hlmInput
                  id="category-name"
                  name="name"
                  [(ngModel)]="name"
                  maxlength="80"
                  required
                />
              </div>
              <label hlmFieldLabel for="category-active"
                ><div hlmField orientation="horizontal">
                  <hlm-checkbox id="category-active" name="active" [(ngModel)]="active" />
                  <div hlmFieldContent>
                    <span hlmFieldTitle>{{ 'enabled' | t }}</span>
                    <p hlmFieldDescription>{{ 'supportCategoryRetain' | t }}</p>
                  </div>
                </div></label
              >
            </div>
            <div hlmCardFooter class="flex gap-2">
              <button hlmBtn type="submit" [disabled]="busy() || !form.valid || !name.trim()">
                {{ 'save' | t }}</button
              ><button hlmBtn variant="outline" type="button" (click)="clear()" [disabled]="busy()">
                {{ 'cancel' | t }}
              </button>
            </div>
          </form>
        </section>
      </div></app-page-state
    >`,
})
export class SupportCategoriesPage {
  readonly api = inject(WorkspaceApi);
  readonly confirm = inject(Confirmations);
  readonly toast = inject(Notifications);
  readonly data = new Resource<SupportOptions>();
  readonly busy = signal(false);
  selected: SupportCategory | null = null;
  name = '';
  active = true;
  constructor() {
    void this.load();
  }
  load() {
    return this.data.load((signal) => this.api.get('support/options', {}, signal));
  }
  async edit(c: SupportCategory) {
    if (this.hasUnsavedChanges() && !(await this.confirm.ask('unsavedTitle', 'unsavedHelp')))
      return;
    this.selected = c;
    this.name = c.name;
    this.active = c.active;
  }
  clear() {
    this.selected = null;
    this.name = '';
    this.active = true;
  }
  hasUnsavedChanges() {
    return this.selected
      ? this.name !== this.selected.name || this.active !== this.selected.active
      : !!this.name;
  }
  beforeUnload(e: BeforeUnloadEvent) {
    protectUnload(e, this.hasUnsavedChanges());
  }
  async save() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post('support/categories', {
        id: this.selected?.id ?? null,
        name: this.name,
        active: this.active,
        version: this.selected?.version ?? '00000000-0000-0000-0000-000000000000',
      });
      this.clear();
      this.toast.success('supportSaved');
      await this.load();
    } catch {
      /* Central errors retain the draft. */
    } finally {
      this.busy.set(false);
    }
  }
}

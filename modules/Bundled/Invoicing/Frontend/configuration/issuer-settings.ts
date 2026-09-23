import { BusinessDraft } from '../../../../../src/TemplateV4.Angular/src/app/shared/business-draft';
import { Component, inject, signal } from '@angular/core';
import { CustomerInfo, IssuerSettings } from '../../../../../src/TemplateV4.Angular/src/app/api/models';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { Resource, WorkspaceUi } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
@Component({
  selector: 'app-issuer-settings',
  imports: [WorkspaceUi],
  template: ` <app-page-header title="issuerSettings" description="invoicingHelp"
      ><a hlmBtn variant="outline" [routerLink]="['/organisation', 'invoicing']">{{
        'invoicing' | t
      }}</a></app-page-header
    >
    <app-page-state [state]="state.state()" [refreshError]="state.refreshError()" (retry)="load()">
      @if (draft; as draft) {
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ 'issuerSettings' | t }}</h2>
          </div>
          <form hlmCardContent class="grid gap-4" (ngSubmit)="save()" #form="ngForm">
            <fieldset [disabled]="busy() || !canConfigure()" class="grid gap-4">
              @for (field of fields; track field.key) {
                <div hlmField>
                  <label hlmFieldLabel [for]="'issuer-' + field.key">{{ field.label | t }}</label
                  ><input
                    hlmInput
                    [id]="'issuer-' + field.key"
                    [name]="field.key"
                    [(ngModel)]="draft[field.key]"
                    [required]="
                      field.key === 'name' ||
                      field.key === 'address' ||
                      field.key === 'numberPrefix'
                    "
                  />
                </div>
              }
              <label hlmFieldLabel for="issuer-vat"
                ><div hlmField orientation="horizontal">
                  <hlm-checkbox
                    inputId="issuer-vat"
                    name="vatRegistered"
                    [(ngModel)]="draft.vatRegistered"
                  /><span>{{ 'vatRegistered' | t }}</span>
                </div></label
              >
              @if (draft.vatRegistered) {
                <div hlmField>
                  <label hlmFieldLabel for="issuer-vat-number">{{ 'vatNumber' | t }}</label
                  ><input
                    hlmInput
                    id="issuer-vat-number"
                    name="vatNumber"
                    [(ngModel)]="draft.vatNumber"
                    pattern="4[0-9]{9}"
                    required
                  />
                </div>
              }
              <button hlmBtn [disabled]="busy() || form.invalid || !canConfigure()">
                {{ 'save' | t }}
              </button>
            </fieldset>
          </form>
        </section>
      }
    </app-page-state>`,
})
export class IssuerSettingsPage extends BusinessDraft {
  protected draftValue() {
    return this.draft;
  }
  private readonly api = inject(WorkspaceApi);
  readonly state = new Resource<IssuerSettings>();
  readonly busy = signal(false);
  readonly canConfigure = signal(false);
  draft: IssuerSettings | null = null;
  readonly fields = [
    { key: 'name', label: 'issuerName' },
    { key: 'address', label: 'issuerAddress' },
    { key: 'contact', label: 'contact' },
    { key: 'paymentInstructions', label: 'paymentInstructions' },
    { key: 'numberPrefix', label: 'numberPrefix' },
  ] as const;
  constructor() {
    super();
    void this.load();
  }
  async load() {
    await this.state.load(async (signal) => {
      const [settings, home] = await Promise.all([
        this.api.get<IssuerSettings>(`organisation/invoicing/settings`, {}, signal),
        this.api.get<CustomerInfo>('organisation/', {}, signal),
      ]);
      this.canConfigure.set(home.canManage);
      this.draft = structuredClone(settings);
      this.markSaved();
      return settings;
    });
  }
  async save() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.api.post(`organisation/invoicing/settings`, this.draft);
      await this.load();
    } finally {
      this.busy.set(false);
    }
  }
}

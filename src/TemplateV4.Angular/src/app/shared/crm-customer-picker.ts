import { Component, effect, inject, input, model, signal } from '@angular/core';
import { CrmDetail, CrmRecord, PageOfCrmRecord } from '../api/models';
import { WorkspaceApi } from '../core/workspace-api';
import { Resource, WorkspaceUi } from './workspace';
import { BusinessSelect } from './business-select';

@Component({
  selector: 'app-crm-customer-picker',
  imports: [WorkspaceUi, BusinessSelect],
  template: `<div class="grid gap-3">
    <div hlmField>
      <label hlmFieldLabel [for]="controlId() + '-search'">{{ 'customerSearch' | t }}</label>
      <input
        hlmInput
        [id]="controlId() + '-search'"
        type="search"
        [ngModel]="search()"
        (ngModelChange)="search.set($event)"
        [ngModelOptions]="{ standalone: true }"
      />
    </div>
    @if (fixedKind() === null) {
      <app-business-select
        [controlId]="controlId()"
        [label]="label()"
        [options]="kindOptions"
        [value]="kind()"
        (valueChange)="kind.set($event)"
        [allowEmpty]="false"
      />
    }
    <app-page-state [state]="data.state()" [refreshError]="data.refreshError()" (retry)="load()" skeleton="picker">
      <app-business-select
        [controlId]="controlId() + '-value'"
        [label]="label()"
        [options]="options()"
        [(value)]="value"
      />
      <app-list-pager
        [total]="data.value()?.total ?? 0"
        [page]="page()"
        [size]="10"
        (pageChange)="page.set($event)"
      />
    </app-page-state>
  </div>`,
})
export class CrmCustomerPicker {
  readonly controlId = input.required<string>();
  readonly label = input('billTo');
  readonly fixedKind = input<string | null>(null);
  readonly value = model('');
  readonly kind = signal('0');
  readonly search = signal('');
  readonly page = signal(1);
  readonly data = new Resource<PageOfCrmRecord>();
  private readonly api = inject(WorkspaceApi);
  readonly selected = signal<CrmRecord | null>(null);
  readonly kindOptions = [
    { id: '0', label: 'contacts' },
    { id: '1', label: 'companies' },
  ];
  constructor() {
    effect((cleanup) => {
      this.fixedKind();
      this.kind();
      this.search();
      this.page();
      const timeout = setTimeout(() => void this.load(), 300);
      cleanup(() => clearTimeout(timeout));
    });
    effect(() => {
      const value = this.value();
      this.selected.set(null);
      if (value)
        void this.api
          .get<CrmDetail>(`organisation/crm/${value}`)
          .then((x) => {
            if (this.value() === value) this.selected.set(x.record);
          })
          .catch(() => {
            /* Missing or revoked selections remain unavailable. */
          });
    });
    effect(() => {
      this.search();
      this.kind();
      this.page.set(1);
    });
  }
  options() {
    const values = this.data.value()?.items ?? [];
    const current = this.selected();
    return [
      ...(current && !values.some((x) => x.id === current.id) ? [current] : []),
      ...values,
    ].map((x) => ({ id: x.id, label: x.data.name, retired: x.archived }));
  }
  async load() {
    await this.data.load((signal) =>
      this.api.get(
        `organisation/crm`,
        {
          kind: this.fixedKind() ?? this.kind(),
          search: this.search(),
          pageNumber: this.page(),
          pageSize: 10,
        },
        signal,
      ),
    );
  }
}

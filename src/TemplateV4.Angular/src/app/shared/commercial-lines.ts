import { Component, model, output } from '@angular/core';
import { CommercialLine } from '../api/models';
import { WorkspaceUi } from './workspace';
import { BusinessSelect } from './business-select';

@Component({
  selector: 'app-commercial-lines',
  imports: [WorkspaceUi, BusinessSelect],
  template: ` <div class="grid gap-4">
    @for (line of lines(); track $index; let index = $index) {
      <fieldset class="grid gap-4 rounded-lg border p-4">
        <div hlmField>
          <label hlmFieldLabel [for]="'line-description-' + index">{{
            'lineDescription' | t
          }}</label
          ><input
            hlmInput
            [id]="'line-description-' + index"
            [ngModel]="line.description"
            [ngModelOptions]="{ standalone: true }"
            (ngModelChange)="line.description = $event; changed.emit()"
            maxlength="1000"
            required
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <app-business-select
            [controlId]="'line-category-' + index"
            label="category"
            [options]="categories"
            [allowEmpty]="false"
            [value]="'' + line.category"
            (valueChange)="line.category = number($event); changed.emit()"
          />
          <div hlmField>
            <label hlmFieldLabel [for]="'line-quantity-' + index">{{ 'quantity' | t }}</label
            ><input
              hlmInput
              [id]="'line-quantity-' + index"
              type="number"
              min="0.0001"
              step="0.0001"
              max="1000000"
              [ngModel]="line.quantity"
              [ngModelOptions]="{ standalone: true }"
              (ngModelChange)="line.quantity = $event; changed.emit()"
              required
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel [for]="'line-unit-' + index">{{ 'unitPrice' | t }}</label
            ><input
              hlmInput
              [id]="'line-unit-' + index"
              type="number"
              min="0"
              step="0.01"
              max="1000000000"
              [ngModel]="line.unitPrice"
              [ngModelOptions]="{ standalone: true }"
              (ngModelChange)="line.unitPrice = $event; changed.emit()"
              required
            />
          </div>
          <app-business-select
            [controlId]="'line-tax-' + index"
            label="taxTreatment"
            [options]="taxes"
            [allowEmpty]="false"
            [value]="'' + line.taxTreatment"
            (valueChange)="
              line.taxTreatment = number($event);
              line.taxRate = number($event) === 0 ? 15 : 0;
              changed.emit()
            "
          />
          <div hlmField>
            <label hlmFieldLabel [for]="'line-rate-' + index">{{ 'taxRate' | t }}</label
            ><input
              hlmInput
              [id]="'line-rate-' + index"
              type="number"
              min="0"
              max="100"
              step="0.01"
              [disabled]="line.taxTreatment !== 0"
              [ngModel]="line.taxRate"
              [ngModelOptions]="{ standalone: true }"
              (ngModelChange)="line.taxRate = $event; changed.emit()"
            />
          </div>
          <button
            hlmBtn
            type="button"
            variant="outline"
            [disabled]="lines().length === 1"
            (click)="remove(index)"
          >
            {{ 'remove' | t }}
          </button>
        </div>
      </fieldset>
    }
    <button hlmBtn type="button" variant="outline" (click)="add()">{{ 'addLine' | t }}</button>
  </div>`,
})
export class CommercialLines {
  readonly lines = model<CommercialLine[]>([
    { description: '', category: 1, quantity: 1, unitPrice: 0, taxTreatment: 3, taxRate: 0 },
  ]);
  readonly changed = output<void>();
  readonly categories = [
    { id: '0', label: 'governmentCharge' },
    { id: '1', label: 'serviceFee' },
    { id: '2', label: 'extra' },
  ];
  readonly taxes = [
    { id: '0', label: 'standardTax' },
    { id: '1', label: 'zeroTax' },
    { id: '2', label: 'exemptTax' },
    { id: '3', label: 'outsideTax' },
  ];
  number(value: string) {
    return Number(value);
  }
  add() {
    this.lines.update((lines) => [
      ...lines,
      { description: '', category: 1, quantity: 1, unitPrice: 0, taxTreatment: 3, taxRate: 0 },
    ]);
    this.changed.emit();
  }
  remove(index: number) {
    this.lines.update((lines) => lines.filter((_, i) => i !== index));
    this.changed.emit();
  }
}

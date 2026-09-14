import { Component, inject, input, model } from '@angular/core';
import { HlmDatePickerImports } from '@spartan-ng/helm/date-picker';
import { WorkspaceUi } from './workspace';
import { I18n } from '../core/i18n';

@Component({
  selector: 'app-business-date',
  imports: [WorkspaceUi, HlmDatePickerImports],
  template: `<div hlmField>
    <label hlmFieldLabel [for]="controlId()">{{ label() | t }}</label>
    <hlm-date-picker
      [ngModel]="date()"
      [ngModelOptions]="{ standalone: true }"
      (ngModelChange)="change($event)"
      [formatDate]="formatDate"
      [autoCloseOnSelect]="true"
    >
      <hlm-date-picker-trigger [buttonId]="controlId()">{{
        value() || (label() | t)
      }}</hlm-date-picker-trigger>
    </hlm-date-picker>
  </div>`,
})
export class BusinessDate {
  readonly controlId = input.required<string>();
  readonly label = input.required<string>();
  readonly value = model<string | null>(null);
  private readonly i18n = inject(I18n);
  date() {
    const value = this.value();
    if (!value) return undefined;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  change(date: Date | null) {
    this.value.set(
      date
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
        : null,
    );
  }
  readonly formatDate = (date: Date) =>
    new Intl.DateTimeFormat(this.i18n.culture(), { dateStyle: 'medium' }).format(date);
}

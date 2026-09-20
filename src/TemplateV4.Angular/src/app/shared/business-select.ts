import { Component, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { I18n, Translate } from '../core/i18n';

export interface BusinessOption {
  id: string;
  label: string;
  retired?: boolean;
}
@Component({
  selector: 'app-business-select',
  imports: [FormsModule, HlmSelectImports, HlmFieldImports, Translate],
  template: `<div hlmField>
    <label hlmFieldLabel [for]="controlId()">{{ label() | t }}</label>
    <hlm-select
      [ngModel]="value()"
      [ngModelOptions]="{ standalone: true }"
      (ngModelChange)="value.set($event)"
      [disabled]="disabled()"
      [itemToString]="optionLabel"
    >
      <hlm-select-trigger [buttonId]="controlId()"><hlm-select-value /></hlm-select-trigger>
      <hlm-select-content *hlmSelectPortal>
        @if (allowEmpty()) {
          <hlm-select-item value="">{{ 'none' | t }}</hlm-select-item>
        }
        @for (option of options(); track option.id) {
          @if (!option.retired || value() === option.id) {
            <hlm-select-item [value]="option.id">{{ option.label | t }}</hlm-select-item>
          }
        }
      </hlm-select-content>
    </hlm-select>
  </div>`,
})
export class BusinessSelect {
  private readonly i18n = inject(I18n);
  readonly controlId = input.required<string>();
  readonly label = input.required<string>();
  readonly options = input<readonly BusinessOption[]>([]);
  readonly value = model('');
  readonly allowEmpty = input(true);
  readonly disabled = input(false);
  readonly optionLabel = (value: string) =>
    this.i18n.text(
      this.options().find((option) => option.id === value)?.label ?? (value === '' ? 'none' : value),
    );
}

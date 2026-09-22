import { Component, inject, input, output } from '@angular/core';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { I18n, Translate } from '../../core/i18n';

@Component({
  selector: 'app-dashboard-choice',
  imports: [HlmSelectImports, HlmFieldImports, Translate],
  template: `<div hlmField>
    <label hlmFieldLabel [for]="id()">{{ label() | t }}</label>
    <hlm-select
      [value]="value()"
      [disabled]="disabled()"
      [itemToString]="display"
      (valueChange)="choose($event)"
    >
      <hlm-select-trigger [buttonId]="id()" class="w-full"><hlm-select-value /></hlm-select-trigger>
      <hlm-select-content *hlmSelectPortal [ariaLabel]="label() | t">
        @for (option of options(); track option.value) {
          <hlm-select-item [value]="option.value">{{ option.label | t }}</hlm-select-item>
        }
      </hlm-select-content>
    </hlm-select>
  </div>`,
})
export class DashboardChoice {
  readonly id = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly disabled = input(false);
  readonly options = input.required<{ value: string; label: string }[]>();
  readonly valueChange = output<string>();
  private readonly i18n = inject(I18n);
  readonly display = (value: string) =>
    this.i18n.text(this.options().find((x) => x.value === value)?.label ?? value);
  choose(value: string | null | undefined) {
    if (value) this.valueChange.emit(value);
  }
}

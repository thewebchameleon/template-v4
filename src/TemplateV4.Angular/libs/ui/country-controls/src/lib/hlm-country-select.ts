import { Component, computed, forwardRef, input, signal } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import type { CountryCode } from 'libphonenumber-js';
import { countryFlagUrl, createCountryOptions, filterCountries } from './country-options';
import type { CountryOption } from './country-options';

@Component({
  selector: 'hlm-country-select',
  imports: [HlmAutocompleteImports, HlmInputGroupImports, NgIcon],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HlmCountrySelect),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => HlmCountrySelect),
      multi: true,
    },
    provideIcons({ lucideX }),
  ],
  template: `
    <hlm-autocomplete
      [search]="search()"
      [value]="selected()"
      [disabled]="disabled() || formDisabled()"
      [itemToString]="countryLabel"
      [isItemEqualToValue]="sameCountry"
      (valueChange)="select($event)"
      (searchChange)="changeSearch($event)"
      (closed)="closeAutocomplete()"
    >
      <hlm-autocomplete-input
        [inputId]="inputId()"
        [placeholder]="placeholder()"
        [showSearch]="false"
        [readonly]="selected() !== null && !searchActive()"
        class="w-full"
        (click)="startSearch($event)"
      >
        @if (displayedFlag(); as country) {
          <hlm-input-group-addon>
            <img
              [src]="flagUrl(country)"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              class="h-4 w-6 rounded-xs object-cover"
            />
          </hlm-input-group-addon>
        }
        @if (search()) {
          <hlm-input-group-addon align="inline-end">
            <button
              hlmInputGroupButton
              type="button"
              size="icon-xs"
              variant="ghost"
              [disabled]="disabled() || formDisabled()"
              [attr.aria-label]="clearLabel()"
              (click)="clear($event)"
            >
              <ng-icon name="lucideX" />
            </button>
          </hlm-input-group-addon>
        }
      </hlm-autocomplete-input>
      <hlm-autocomplete-content *hlmAutocompletePortal>
        <hlm-autocomplete-empty>{{ emptyLabel() }}</hlm-autocomplete-empty>
        <div hlmAutocompleteList>
          @for (country of filteredCountries(); track country.code) {
            <hlm-autocomplete-item [value]="country">
              <img
                [src]="flagUrl(country)"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                class="h-4 w-6 rounded-xs object-cover"
              />
              <span class="truncate">
                {{ country.name }} · {{ country.code }} · +{{ country.callingCode }}
              </span>
            </hlm-autocomplete-item>
          }
        </div>
      </hlm-autocomplete-content>
    </hlm-autocomplete>
  `,
})
export class HlmCountrySelect implements ControlValueAccessor, Validator {
  readonly inputId = input.required<string>();
  readonly placeholder = input.required<string>();
  readonly emptyLabel = input.required<string>();
  readonly clearLabel = input.required<string>();
  readonly locale = input('en');
  readonly flagBaseUrl = input('assets/flags/4x3');
  readonly disabled = input(false);
  readonly value = signal<CountryCode | null>('ZA');
  readonly search = signal('');
  readonly formDisabled = signal(false);
  readonly searchActive = signal(false);
  readonly countries = computed(() => createCountryOptions(this.locale()));
  readonly filteredCountries = computed(() => filterCountries(this.countries(), this.search()));
  private readonly labels = computed(
    () => new Map(this.countries().map((country) => [country.code, country])),
  );
  readonly selected = computed(() => {
    const code = this.value();
    return code ? (this.labels().get(code) ?? null) : null;
  });
  readonly countryLabel = (country: CountryOption | null) =>
    country ? `${country.name} (${country.code}, +${country.callingCode})` : '';
  readonly displayedFlag = computed(() => {
    const country = this.selected();
    const search = this.search().trim();
    return country && (!search || search === this.countryLabel(country)) ? country : null;
  });
  readonly sameCountry = (country: CountryOption, value: CountryOption | null | undefined) =>
    country.code === value?.code;
  readonly flagUrl = (country: CountryOption) => countryFlagUrl(country, this.flagBaseUrl());
  private onChange: (value: CountryCode | null) => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;
  onTouched: () => void = () => undefined;

  writeValue(value: CountryCode | null | undefined) {
    this.searchActive.set(false);
    this.value.set(value ?? null);
    const country = this.labels().get(value ?? 'ZA');
    this.search.set(value && country ? this.countryLabel(country) : '');
  }

  registerOnChange(onChange: (value: CountryCode | null) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  registerOnValidatorChange(onValidatorChange: () => void) {
    this.onValidatorChange = onValidatorChange;
  }

  setDisabledState(disabled: boolean) {
    this.formDisabled.set(disabled);
  }

  validate(): ValidationErrors | null {
    return this.selected() || !this.search().trim() ? null : { country: true };
  }

  changeSearch(value: string) {
    const selected = this.selected();
    if (selected && this.searchActive() && value !== this.countryLabel(selected)) {
      this.value.set(null);
      this.onChange(null);
    }
    this.search.set(value);
    this.onValidatorChange();
  }

  startSearch(event: MouseEvent) {
    this.searchActive.set(true);
    const input = (event.currentTarget as HTMLElement).querySelector('input');
    const selectValue = this.selected() !== null;
    queueMicrotask(() => (selectValue ? input?.select() : input?.focus()));
  }

  select(country: CountryOption | null | undefined) {
    if (!country) return;
    this.searchActive.set(false);
    if (country.code !== this.value()) {
      this.value.set(country.code);
      this.search.set(this.countryLabel(country));
      this.onChange(country.code);
    }
    this.onTouched();
    this.onValidatorChange();
  }

  clear(event: MouseEvent) {
    event.preventDefault();
    this.searchActive.set(false);
    this.value.set(null);
    this.search.set('');
    this.onChange(null);
    this.onValidatorChange();
  }

  closeAutocomplete() {
    this.searchActive.set(false);
    this.onTouched();
  }
}

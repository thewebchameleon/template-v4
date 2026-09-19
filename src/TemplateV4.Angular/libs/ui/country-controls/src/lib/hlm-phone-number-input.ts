import { Component, computed, Directive, effect, forwardRef, input, signal } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgControl,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import {
  getCountryCallingCode,
  parsePhoneNumberFromString,
  type CountryCode,
} from 'libphonenumber-js';
import { countryFlagUrl, createCountryOptions, filterCountries } from './country-options';
import type { CountryOption } from './country-options';

@Directive({
  selector: '[hlmIsolatedNgControl]',
  providers: [{ provide: NgControl, useValue: null }],
})
class HlmIsolatedNgControl {}

@Component({
  selector: 'hlm-phone-number-input',
  imports: [
    HlmAutocompleteImports,
    HlmInputGroupImports,
    HlmInputImports,
    HlmIsolatedNgControl,
    NgIcon,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => HlmPhoneNumberInput),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => HlmPhoneNumberInput),
      multi: true,
    },
    provideIcons({ lucideX }),
  ],
  template: `
    <label class="sr-only" [for]="countryInputId()">{{ countryAriaLabel() }}</label>
    <div class="flex w-full">
      <hlm-autocomplete
        hlmIsolatedNgControl
        class="w-32 shrink-0"
        [search]="search()"
        [value]="selected()"
        [disabled]="disabled() || formDisabled()"
        [itemToString]="diallingLabel"
        [isItemEqualToValue]="sameCountry"
        (valueChange)="selectCountry($event)"
        (searchChange)="changeSearch($event)"
        (closed)="closeCountryAutocomplete()"
      >
        <hlm-autocomplete-input
          [inputId]="countryInputId()"
          [placeholder]="countryPlaceholder()"
          [showSearch]="false"
          [readonly]="selected() !== null && !countrySearchActive()"
          class="w-full rounded-e-none border-e-0"
          (click)="startCountrySearch($event)"
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
                (click)="clearCountry($event)"
              >
                <ng-icon name="lucideX" />
              </button>
            </hlm-input-group-addon>
          }
        </hlm-autocomplete-input>
        <hlm-autocomplete-content *hlmAutocompletePortal class="min-w-72">
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
      <input
        hlmInput
        class="-ms-px rounded-s-none"
        [id]="inputId()"
        [value]="nationalNumber()"
        [disabled]="disabled() || formDisabled()"
        type="tel"
        inputmode="tel"
        autocomplete="tel-national"
        maxlength="30"
        (input)="changeNumber($event)"
        (blur)="onTouched()"
      />
    </div>
  `,
})
export class HlmPhoneNumberInput implements ControlValueAccessor, Validator {
  readonly inputId = input.required<string>();
  readonly countryInputId = input.required<string>();
  readonly countryAriaLabel = input.required<string>();
  readonly countryPlaceholder = input.required<string>();
  readonly emptyLabel = input.required<string>();
  readonly clearLabel = input.required<string>();
  readonly locale = input('en');
  readonly flagBaseUrl = input('assets/flags/4x3');
  readonly disabled = input(false);
  readonly defaultCountry = input<string | null>(null);
  readonly country = signal<CountryCode | null>(null);
  readonly search = signal('');
  readonly nationalNumber = signal('');
  readonly formDisabled = signal(false);
  readonly countryManuallySelected = signal(false);
  readonly hasExistingPhone = signal(false);
  readonly countrySearchActive = signal(false);
  readonly countries = computed(() => createCountryOptions(this.locale()));
  readonly filteredCountries = computed(() => filterCountries(this.countries(), this.search()));
  private readonly labels = computed(
    () => new Map(this.countries().map((country) => [country.code, country])),
  );
  readonly selected = computed(() => {
    const code = this.country();
    return code ? (this.labels().get(code) ?? null) : null;
  });
  readonly diallingLabel = (country: CountryOption | null) =>
    country ? `+${country.callingCode}` : '';
  readonly displayedFlag = computed(() => {
    const country = this.selected();
    const search = this.search().trim();
    return country && (!search || search === this.diallingLabel(country)) ? country : null;
  });
  readonly sameCountry = (country: CountryOption, value: CountryOption | null | undefined) =>
    country.code === value?.code;
  readonly flagUrl = (country: CountryOption) => countryFlagUrl(country, this.flagBaseUrl());
  private onChange: (value: string | null) => void = () => undefined;
  private onValidatorChange: () => void = () => undefined;
  onTouched: () => void = () => undefined;

  constructor() {
    effect(() => {
      const defaultCountry = this.defaultCountry();
      const country = defaultCountry ? this.labels().get(defaultCountry as CountryCode) : undefined;
      const currentCountry = this.country();
      if (
        !country ||
        currentCountry === country.code ||
        this.hasExistingPhone() ||
        this.countryManuallySelected() ||
        this.nationalNumber().trim()
      )
        return;
      this.applyCountry(country);
    });
  }

  writeValue(value: string | null | undefined) {
    const phone = value ? parsePhoneNumberFromString(value) : undefined;
    this.countrySearchActive.set(false);
    this.hasExistingPhone.set(Boolean(value));
    this.countryManuallySelected.set(false);
    this.country.set(phone?.country ?? null);
    const country = phone?.country ? this.labels().get(phone.country) : undefined;
    this.search.set(country ? this.diallingLabel(country) : '');
    this.nationalNumber.set(phone?.nationalNumber ?? '');
  }

  registerOnChange(onChange: (value: string | null) => void) {
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
    const hasCountry = this.country() !== null;
    const hasCountrySearch = this.search().trim().length > 0;
    const hasNumber = this.nationalNumber().trim().length > 0;
    if (!hasCountry && !hasCountrySearch && !hasNumber) return null;
    if (hasCountry && !hasNumber && !this.countryManuallySelected()) return null;
    return hasCountry && hasNumber && this.normalized() ? null : { phone: true };
  }

  changeSearch(value: string) {
    const selected = this.selected();
    if (selected && this.countrySearchActive() && value !== this.diallingLabel(selected)) {
      this.countryManuallySelected.set(true);
      this.country.set(null);
    }
    this.search.set(value);
    this.onValidatorChange();
  }

  startCountrySearch(event: MouseEvent) {
    this.countrySearchActive.set(true);
    const input = (event.currentTarget as HTMLElement).querySelector('input');
    const selectValue = this.selected() !== null;
    queueMicrotask(() => (selectValue ? input?.select() : input?.focus()));
  }

  selectCountry(country: CountryOption | null | undefined) {
    if (!country) return;
    this.countrySearchActive.set(false);
    this.countryManuallySelected.set(true);
    if (country.code !== this.country()) this.applyCountry(country);
    if (this.nationalNumber().trim()) this.publish();
    else this.onValidatorChange();
    this.onTouched();
  }

  clearCountry(event: MouseEvent) {
    event.preventDefault();
    this.countrySearchActive.set(false);
    this.countryManuallySelected.set(true);
    this.country.set(null);
    this.search.set('');
    this.publish();
  }

  changeNumber(event: Event) {
    this.nationalNumber.set((event.target as HTMLInputElement).value);
    this.publish();
  }

  closeCountryAutocomplete() {
    this.countrySearchActive.set(false);
    this.onTouched();
  }

  private applyCountry(country: CountryOption) {
    this.country.set(country.code);
    this.search.set(this.diallingLabel(country));
    this.onValidatorChange();
  }

  private publish() {
    this.onChange(this.nationalNumber().trim() ? this.normalized() : null);
    this.onValidatorChange();
  }

  private normalized() {
    const country = this.country();
    if (!country) return null;
    const phone = parsePhoneNumberFromString(this.nationalNumber(), country);
    return phone?.isValid() && phone.countryCallingCode === getCountryCallingCode(country)
      ? phone.number
      : null;
  }
}

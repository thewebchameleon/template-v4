import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import type { CountryCode } from 'libphonenumber-js';

export interface CountryOption {
  code: CountryCode;
  name: string;
  callingCode: string;
}

export function createCountryOptions(locale: string): CountryOption[] {
  const names = new Intl.DisplayNames([locale], { type: 'region' });
  const collator = new Intl.Collator(locale);
  return getCountries()
    .map((code): CountryOption => ({
      code,
      name: names.of(code) ?? code,
      callingCode: getCountryCallingCode(code),
    }))
    .sort((left, right) => collator.compare(left.name, right.name));
}

export function filterCountries(countries: readonly CountryOption[], value: string) {
  const terms = value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}+]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
  if (!terms.length) return countries;
  return countries.filter((country) => {
    const haystack =
      `${country.name} ${country.code} +${country.callingCode} ${country.callingCode}`.toLocaleLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function countryFlagUrl(country: CountryOption, baseUrl: string) {
  return `${baseUrl.replace(/\/$/, '')}/${country.code.toLowerCase()}.svg`;
}

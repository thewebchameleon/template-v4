import { Runtime } from './runtime';
import { Injectable, Pipe, PipeTransform, inject, signal } from '@angular/core';
import { dictionary } from './translations';
@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly runtime = inject(Runtime);
  readonly culture = signal(
    this.runtime.supportedCultures.find(
      (c) => c.toLowerCase() === navigator.language.toLowerCase(),
    ) ?? this.runtime.defaultCulture,
  );
  constructor() {
    document.documentElement.lang = this.culture();
  }
  text(key: string): string {
    return dictionary[key]?.[this.culture() === 'af-ZA' ? 1 : 0] ?? key;
  }
  set(culture: string) {
    this.culture.set(
      this.runtime.supportedCultures.includes(culture) ? culture : this.runtime.defaultCulture,
    );
    document.documentElement.lang = this.culture();
  }
  private readonly dates = new Map<string, Intl.DateTimeFormat>();
  private readonly numbers = new Map<string, Intl.NumberFormat>();
  date(value: string) {
    const culture = this.culture();
    if (!this.dates.has(culture))
      this.dates.set(
        culture,
        new Intl.DateTimeFormat(culture, { dateStyle: 'medium', timeStyle: 'short' }),
      );
    return this.dates.get(culture)!.format(new Date(value));
  }
  number(value: number) {
    const culture = this.culture();
    if (!this.numbers.has(culture)) this.numbers.set(culture, new Intl.NumberFormat(culture));
    return this.numbers.get(culture)!.format(value);
  }
  currency(value: number, currency = 'ZAR') {
    return new Intl.NumberFormat(this.culture(), { style: 'currency', currency }).format(value);
  }
}
@Pipe({ name: 't', pure: false })
export class Translate implements PipeTransform {
  private readonly i18n = inject(I18n);
  transform(key: string) {
    return this.i18n.text(key);
  }
}

import { Component, inject } from '@angular/core';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { Auth } from './auth';
import { I18n, Translate } from './i18n';
import { Runtime } from './runtime';
import { Theme } from './theme';

@Component({
  selector: 'app-preferences',
  imports: [HlmSelectImports, Translate],
  template: `
    <div class="preferences">
      <label class="sr-only" for="theme">{{ 'theme' | t }}</label>
      <hlm-select
        [value]="theme.preference()"
        [itemToString]="themeLabel"
        (valueChange)="theme.set($event)"
      >
        <hlm-select-trigger buttonId="theme" class="w-40">
          <hlm-select-value />
        </hlm-select-trigger>
        <hlm-select-content *hlmSelectPortal [ariaLabel]="'theme' | t">
          <hlm-select-item value="system">{{ 'themeSystem' | t }}</hlm-select-item>
          <hlm-select-item value="light">{{ 'themeLight' | t }}</hlm-select-item>
          <hlm-select-item value="dark">{{ 'themeDark' | t }}</hlm-select-item>
        </hlm-select-content>
      </hlm-select>

      <label class="sr-only" for="language">{{ 'culture' | t }}</label>
      <hlm-select
        [value]="i18n.culture()"
        [itemToString]="cultureLabel"
        (valueChange)="language($event)"
      >
        <hlm-select-trigger buttonId="language" class="w-32">
          <hlm-select-value />
        </hlm-select-trigger>
        <hlm-select-content *hlmSelectPortal [ariaLabel]="'culture' | t">
          @for (culture of runtime.supportedCultures; track culture) {
            <hlm-select-item [value]="culture">{{ cultureLabel(culture) }}</hlm-select-item>
          }
        </hlm-select-content>
      </hlm-select>
    </div>
  `,
})
export class Preferences {
  private readonly auth = inject(Auth);
  readonly runtime = inject(Runtime);
  readonly i18n = inject(I18n);
  readonly theme = inject(Theme);

  readonly themeLabel = (preference: string) =>
    this.i18n.text(
      preference === 'light' ? 'themeLight' : preference === 'dark' ? 'themeDark' : 'themeSystem',
    );

  readonly cultureLabel = (culture: string) => (culture === 'af-ZA' ? 'Afrikaans' : 'English');

  async language(culture: string | null | undefined) {
    if (!culture) return;
    if (this.auth.access()) await this.auth.action('culture', { culture });
    this.i18n.set(culture);
  }
}

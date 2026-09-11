import { Component, inject, input, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAccessibility,
  lucideALargeSmall,
  lucideContrast,
  lucideLanguages,
  lucideRows3,
  lucideSunMoon,
} from '@ng-icons/lucide';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { Auth } from './auth';
import { I18n, Translate } from './i18n';
import { Runtime } from './runtime';
import { Theme } from './theme';
import { UiPreferences } from './ui-preferences';

@Component({
  selector: 'app-preferences',
  imports: [NgIcon, HlmFieldImports, HlmSelectImports, HlmToggleGroupImports, Translate],
  providers: [
    provideIcons({
      lucideAccessibility,
      lucideALargeSmall,
      lucideContrast,
      lucideLanguages,
      lucideRows3,
      lucideSunMoon,
    }),
  ],
  template: `
    @if (!expanded()) {
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
    } @else {
      <div class="flex flex-col gap-5">
        <div hlmField>
          <span hlmFieldLabel>
            <ng-icon name="lucideSunMoon" aria-hidden="true" />
            {{ 'theme' | t }}
          </span>
          <hlm-toggle-group
            type="single"
            variant="outline"
            class="grid w-full grid-cols-3"
            [value]="theme.preference()"
            (valueChange)="theme.set(singleValue($event))"
          >
            <button hlmToggleGroupItem value="system">{{ 'system' | t }}</button>
            <button hlmToggleGroupItem value="light">{{ 'light' | t }}</button>
            <button hlmToggleGroupItem value="dark">{{ 'dark' | t }}</button>
          </hlm-toggle-group>
        </div>

        <div hlmField>
          <label hlmFieldLabel for="settings-language">
            <ng-icon name="lucideLanguages" aria-hidden="true" />
            {{ 'culture' | t }}
          </label>
          <hlm-select
            class="w-full"
            [value]="i18n.culture()"
            [itemToString]="cultureLabel"
            (valueChange)="language($event)"
          >
            <hlm-select-trigger buttonId="settings-language" class="w-full">
              <hlm-select-value />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal [ariaLabel]="'culture' | t">
              @for (culture of runtime.supportedCultures; track culture) {
                <hlm-select-item [value]="culture">{{ cultureLabel(culture) }}</hlm-select-item>
              }
            </hlm-select-content>
          </hlm-select>
        </div>

        <div hlmField>
          <span hlmFieldLabel>
            <ng-icon name="lucideALargeSmall" aria-hidden="true" />
            {{ 'textSize' | t }}
          </span>
          <hlm-toggle-group
            type="single"
            variant="outline"
            class="grid w-full grid-cols-3"
            [value]="ui.textSize()"
            (valueChange)="ui.setTextSize(singleValue($event))"
          >
            <button hlmToggleGroupItem value="default">{{ 'default' | t }}</button>
            <button hlmToggleGroupItem value="large">{{ 'large' | t }}</button>
            <button hlmToggleGroupItem value="extra-large">{{ 'extraLarge' | t }}</button>
          </hlm-toggle-group>
        </div>

        <div hlmField>
          <span hlmFieldLabel>
            <ng-icon name="lucideContrast" aria-hidden="true" />
            {{ 'contrast' | t }}
          </span>
          <hlm-toggle-group
            type="single"
            variant="outline"
            class="grid w-full grid-cols-2"
            [value]="ui.contrast()"
            (valueChange)="ui.setContrast(singleValue($event))"
          >
            <button hlmToggleGroupItem value="standard">{{ 'standard' | t }}</button>
            <button hlmToggleGroupItem value="high">{{ 'high' | t }}</button>
          </hlm-toggle-group>
        </div>

        <div hlmField>
          <span hlmFieldLabel>
            <ng-icon name="lucideAccessibility" aria-hidden="true" />
            {{ 'motion' | t }}
          </span>
          <hlm-toggle-group
            type="single"
            variant="outline"
            class="grid w-full grid-cols-2"
            [value]="ui.motion()"
            (valueChange)="ui.setMotion(singleValue($event))"
          >
            <button hlmToggleGroupItem value="system">{{ 'system' | t }}</button>
            <button hlmToggleGroupItem value="reduced">{{ 'reduced' | t }}</button>
          </hlm-toggle-group>
          <p hlmFieldDescription>{{ 'motionHelp' | t }}</p>
        </div>

        <div hlmField>
          <span hlmFieldLabel>
            <ng-icon name="lucideRows3" aria-hidden="true" />
            {{ 'interfaceDensity' | t }}
          </span>
          <hlm-toggle-group
            type="single"
            variant="outline"
            class="grid w-full grid-cols-2"
            [value]="ui.density()"
            (valueChange)="ui.setDensity(singleValue($event))"
          >
            <button hlmToggleGroupItem value="comfortable">{{ 'comfortable' | t }}</button>
            <button hlmToggleGroupItem value="compact">{{ 'compact' | t }}</button>
          </hlm-toggle-group>
        </div>
      </div>
    }
  `,
})
export class Preferences {
  readonly expanded = input(false);
  private readonly auth = inject(Auth);
  readonly runtime = inject(Runtime);
  readonly i18n = inject(I18n);
  readonly theme = inject(Theme);
  readonly ui = inject(UiPreferences);
  readonly sidebar = inject(HlmSidebarService);
  readonly resetting = signal(false);

  readonly themeLabel = (preference: string) =>
    this.i18n.text(
      preference === 'light' ? 'themeLight' : preference === 'dark' ? 'themeDark' : 'themeSystem',
    );

  readonly cultureLabel = (culture: string) => (culture === 'af-ZA' ? 'Afrikaans' : 'English');

  readonly singleValue = (value: string | string[] | null | undefined) =>
    Array.isArray(value) ? value[0] : value;

  async language(culture: string | null | undefined) {
    if (!culture) return;
    if (this.auth.access()) await this.auth.action('culture', { culture });
    this.i18n.set(culture);
  }

  async reset() {
    if (this.resetting()) return;
    this.resetting.set(true);
    try {
      this.theme.set('system');
      this.ui.reset();
      this.sidebar.reset();
      await this.language(this.runtime.defaultCulture);
    } finally {
      this.resetting.set(false);
    }
  }
}

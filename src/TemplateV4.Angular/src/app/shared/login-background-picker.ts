import { DOCUMENT } from '@angular/common';
import { Component, NgZone, computed, effect, inject, input, model, signal } from '@angular/core';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { HlmScrollAreaImports } from '@spartan-ng/helm/scroll-area';
import { NgScrollbar } from 'ngx-scrollbar';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBlend, lucidePalette } from '@ng-icons/lucide';
import { I18n, Translate } from '../core/i18n';
import {
  GRADIENT_TYPES,
  LOGIN_BACKGROUNDS,
  loginBackground,
  recolorBackground,
} from '../core/login-backgrounds';
import { PlatformAppearanceTheme } from '../core/platform-appearance';
import { LoginBackgroundArtwork } from './login-background';

@Component({
  selector: 'app-login-background-picker',
  imports: [
    HlmDrawerImports,
    HlmButtonImports,
    HlmBadgeImports,
    HlmCheckboxImports,
    HlmInputImports,
    HlmFieldImports,
    HlmSelectImports,
    HlmSwitchImports,
    HlmScrollAreaImports,
    NgScrollbar,
    NgIcon,
    Translate,
    LoginBackgroundArtwork,
  ],
  providers: [provideIcons({ lucideBlend, lucidePalette })],
  styles: `
    .presets {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }
    .preset {
      position: relative;
      display: grid;
      gap: 0.5rem;
      min-width: 0;
      cursor: pointer;
    }
    .preset input {
      position: absolute;
      opacity: 0;
      inset: 0;
      width: 100%;
      height: 100%;
      margin: 0;
      z-index: 1;
      cursor: inherit;
    }
    .thumbnail {
      display: block;
      aspect-ratio: 16 / 10;
      overflow: hidden;
      border: 2px solid var(--border);
      border-radius: var(--radius);
    }
    .thumbnail img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .preset input:checked + .thumbnail {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px var(--primary);
    }
    .preset input:focus-visible + .thumbnail {
      outline: 3px solid var(--ring);
      outline-offset: 4px;
    }
    .preset:has(input:disabled) {
      opacity: 0.6;
      cursor: default;
    }
    .name {
      font-size: var(--text-sm);
      font-weight: var(--font-weight-medium);
    }
    .preview {
      display: grid;
      overflow: hidden;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--background);
    }
    .control-preview {
      display: grid;
      align-content: center;
      gap: 1rem;
      padding: 2rem;
      min-width: 0;
    }
    .preview-artwork {
      min-height: 22rem;
      position: relative;
    }
    .preview-artwork app-login-background {
      position: absolute;
      inset: 0;
    }
    @media (min-width: 40rem) {
      .presets {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
      .preview {
        grid-template-columns: 1fr 1fr;
      }
    }
  `,
  template: `
    <section class="grid gap-4" [attr.aria-label]="'loginBackground' | t">
      <h4 class="font-semibold">{{ 'loginPreview' | t }}</h4>
      <div class="preview" data-testid="login-preview">
        <div class="control-preview">
          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h5 class="text-xl font-semibold">{{ 'themeControlPreview' | t }}</h5>
              <span hlmBadge>{{ 'previewActive' | t }}</span>
              <span hlmBadge variant="secondary">{{ 'previewNew' | t }}</span>
            </div>
            <p class="text-sm text-muted-foreground">{{ 'themeControlPreviewHelp' | t }}</p>
          </div>
          <div hlmField>
            <label hlmFieldLabel for="preview-name">{{ 'previewName' | t }}</label>
            <input
              hlmInput
              id="preview-name"
              type="text"
              [placeholder]="'previewNamePlaceholder' | t"
            />
          </div>
          <div hlmField>
            <label hlmFieldLabel for="preview-role">{{ 'previewRole' | t }}</label>
            <hlm-select value="administrator" [itemToString]="roleLabel">
              <hlm-select-trigger buttonId="preview-role" class="w-full">
                <hlm-select-value />
              </hlm-select-trigger>
              <hlm-select-content *hlmSelectPortal [ariaLabel]="'previewRole' | t">
                <hlm-select-item value="administrator">{{
                  'previewAdministrator' | t
                }}</hlm-select-item>
                <hlm-select-item value="member">{{ 'previewMember' | t }}</hlm-select-item>
              </hlm-select-content>
            </hlm-select>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <label hlmFieldLabel for="preview-updates" class="cursor-pointer">
              <div hlmField orientation="horizontal">
                <hlm-checkbox inputId="preview-updates" checked />
                <span hlmFieldTitle>{{ 'previewUpdates' | t }}</span>
              </div>
            </label>
            <label hlmFieldLabel for="preview-enabled" class="cursor-pointer">
              <div hlmField orientation="horizontal">
                <hlm-switch inputId="preview-enabled" checked />
                <span hlmFieldTitle>{{ 'previewEnabled' | t }}</span>
              </div>
            </label>
          </div>
          <div class="flex flex-wrap gap-2">
            <button hlmBtn type="button">{{ 'previewPrimaryAction' | t }}</button>
            <button hlmBtn variant="secondary" type="button">
              {{ 'previewSecondaryAction' | t }}
            </button>
            <button hlmBtn variant="outline" type="button">
              {{ 'previewOutlineAction' | t }}
            </button>
          </div>
        </div>
        <div class="preview-artwork">
          <app-login-background [value]="value()" />
          <div class="absolute top-3 right-3 flex gap-2">
            <hlm-drawer
              direction="right"
              [state]="typeState()"
              (stateChanged)="typeState.set($event)"
            >
              <button
                hlmBtn
                variant="secondary"
                size="icon-sm"
                type="button"
                hlmDrawerTrigger
                [disabled]="disabled()"
                [attr.aria-label]="('gradientType' | t) + ': ' + (selectedType().label | t)"
                [title]="('gradientType' | t) + ': ' + (selectedType().label | t)"
                data-testid="choose-gradient-type"
              >
                <ng-icon name="lucideBlend" aria-hidden="true" />
              </button>
              <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-xl">
                <hlm-drawer-header>
                  <h2 hlmDrawerTitle>{{ 'gradientType' | t }}</h2>
                  <p hlmDrawerDescription>{{ 'gradientDrawerHelp' | t }}</p>
                </hlm-drawer-header>
                <ng-scrollbar hlm hlmDrawerBody orientation="vertical" class="min-h-0 flex-1">
                  <fieldset hlmFieldSet [disabled]="disabled()" data-testid="gradient-types">
                    <legend hlmFieldLegend>{{ 'gradientType' | t }}</legend>
                    <div class="presets">
                      @for (item of types(); track item.id) {
                        <label class="preset">
                          <input
                            type="radio"
                            name="loginBackgroundType"
                            [value]="item.id"
                            [checked]="type() === item.id"
                            (click)="selectType(item.id)"
                          />
                          <span
                            class="thumbnail"
                            aria-hidden="true"
                            [style.background]="item.fallback"
                          >
                            @if (item.thumbnailUrl; as thumbnailUrl) {
                              <img alt="" [src]="thumbnailUrl" />
                            }
                          </span>
                          <span class="name">{{ item.label | t }}</span>
                        </label>
                      }
                    </div>
                  </fieldset>
                </ng-scrollbar>
              </hlm-drawer-content>
            </hlm-drawer>
            <hlm-drawer
              direction="right"
              [state]="presetState()"
              (stateChanged)="presetState.set($event)"
            >
              <button
                hlmBtn
                variant="secondary"
                size="icon-sm"
                type="button"
                hlmDrawerTrigger
                [disabled]="disabled()"
                [attr.aria-label]="('gradientColorPreset' | t) + ': ' + selectedPreset().name"
                [title]="('gradientColorPreset' | t) + ': ' + selectedPreset().name"
                data-testid="choose-gradient-preset"
              >
                <ng-icon name="lucidePalette" aria-hidden="true" />
              </button>
              <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-xl">
                <hlm-drawer-header>
                  <h2 hlmDrawerTitle>{{ 'gradientColorPreset' | t }}</h2>
                  <p hlmDrawerDescription>{{ 'gradientDrawerHelp' | t }}</p>
                </hlm-drawer-header>
                <ng-scrollbar hlm hlmDrawerBody orientation="vertical" class="min-h-0 flex-1">
                  <fieldset hlmFieldSet [disabled]="disabled()" data-testid="gradient-presets">
                    <legend hlmFieldLegend>{{ 'gradientColorPreset' | t }}</legend>
                    <div class="presets">
                      @for (preset of presets(); track preset.id) {
                        <label class="preset">
                          <input
                            type="radio"
                            name="loginBackground"
                            [value]="preset.id"
                            [checked]="value() === preset.id"
                            (click)="selectColorPreset(preset.id)"
                          />
                          <span class="thumbnail" aria-hidden="true"
                            ><app-login-background [value]="preset.id" [thumbnail]="true"
                          /></span>
                          <span class="name">{{ preset.name }}</span>
                        </label>
                      }
                    </div>
                  </fieldset>
                </ng-scrollbar>
              </hlm-drawer-content>
            </hlm-drawer>
          </div>
        </div>
      </div>
      <p class="text-sm text-muted-foreground">{{ 'loginBackgroundPreviewHelp' | t }}</p>
    </section>
  `,
})
export class LoginBackgroundPicker {
  private readonly i18n = inject(I18n);
  private readonly appearance = inject(PlatformAppearanceTheme);
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly typeThumbnails = signal<Readonly<Record<string, string>>>({});
  readonly roleLabel = (value: unknown) =>
    this.i18n.text(value === 'member' ? 'previewMember' : 'previewAdministrator');
  readonly value = model<string>('blue-sky');
  readonly disabled = input(false);
  readonly typeState = signal<'open' | 'closed'>('closed');
  readonly presetState = signal<'open' | 'closed'>('closed');
  readonly selectedPreset = computed(() => loginBackground(this.value()));
  readonly selectedType = computed(() => GRADIENT_TYPES.find((type) => type.id === this.type())!);
  readonly types = computed(() => {
    const primaryColor = this.appearance.primaryColor();
    const thumbnails = this.typeThumbnails();
    return GRADIENT_TYPES.map((type) => {
      const preview = LOGIN_BACKGROUNDS.find((preset) => preset.type === type.id)!;
      const recolored = recolorBackground(preview, primaryColor);
      return {
        ...type,
        preview: preview.id,
        fallback: `linear-gradient(180deg, ${recolored.stops.join(', ')})`,
        thumbnailUrl: thumbnails[type.id],
      };
    });
  });
  readonly type = computed(() => loginBackground(this.value()).type);
  readonly presets = computed(() =>
    LOGIN_BACKGROUNDS.filter((preset) => preset.type === this.type()),
  );

  constructor() {
    effect((onCleanup) => {
      const primaryColor = this.appearance.primaryColor();
      const window = this.document.defaultView;
      this.typeThumbnails.set({});
      if (!window) return;

      let cancelled = false;
      let idleHandle: number | undefined;
      let timeoutHandle: number | undefined;
      const cancelScheduledWork = () => {
        if (idleHandle !== undefined && window.cancelIdleCallback)
          window.cancelIdleCallback(idleHandle);
        if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
      };
      onCleanup(() => {
        cancelled = true;
        cancelScheduledWork();
      });

      this.zone.runOutsideAngular(() => {
        void import('./gradient-renderer').then(({ GradientRenderer }) => {
          if (cancelled) return;
          let index = 0;
          const renderNext = () => {
            if (cancelled || index >= GRADIENT_TYPES.length) return;
            const type = GRADIENT_TYPES[index++];
            const preset = LOGIN_BACKGROUNDS.find((candidate) => candidate.type === type.id)!;
            const canvas = this.document.createElement('canvas');
            const renderer = new GradientRenderer(canvas);
            try {
              renderer.render(recolorBackground(preset, primaryColor), 20.75, 240, 150);
              const thumbnailUrl = canvas.toDataURL('image/webp', 0.8);
              this.typeThumbnails.update((thumbnails) => ({
                ...thumbnails,
                [type.id]: thumbnailUrl,
              }));
            } catch {
              // The CSS fallback remains usable when canvas rendering is unavailable.
            } finally {
              renderer.destroy();
              canvas.width = canvas.height = 0;
            }
            scheduleNext();
          };
          const scheduleNext = () => {
            if (cancelled || index >= GRADIENT_TYPES.length) return;
            if (window.requestIdleCallback) {
              idleHandle = window.requestIdleCallback(renderNext, { timeout: 1000 });
            } else {
              timeoutHandle = window.setTimeout(renderNext, 0);
            }
          };
          scheduleNext();
        });
      });
    });
  }

  selectType(value: unknown) {
    if (this.disabled()) return;
    this.typeState.set('closed');
    if (value === this.type()) return;
    const first = LOGIN_BACKGROUNDS.find((preset) => preset.type === value);
    if (first) this.value.set(first.id);
  }
  selectColorPreset(value: string) {
    if (this.disabled()) return;
    this.value.set(value);
    this.presetState.set('closed');
  }
}

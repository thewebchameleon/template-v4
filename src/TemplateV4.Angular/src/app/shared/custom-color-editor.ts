import { Component, computed, input, output, signal } from '@angular/core';
import { HlmDrawerImports } from '@spartan-ng/helm/drawer';
import { HlmSliderImports } from '@spartan-ng/helm/slider';
import { WorkspaceUi } from './workspace';
import { CustomBrandColor } from '../api/models';
import { DEFAULT_PRIMARY_COLOR, validPrimaryColor } from '../core/brand-palette';
import { hexToHsv, hsvToHex, HsvColor } from '../core/color-picker';

@Component({
  selector: 'app-custom-color-editor',
  imports: [WorkspaceUi, HlmDrawerImports, HlmSliderImports],
  template: ` <hlm-drawer direction="right" [state]="state()" (stateChanged)="stateChanged($event)">
    @if (item(); as color) {
      <button
        hlmBtn
        variant="outline"
        size="icon-sm"
        type="button"
        hlmDrawerTrigger
        [disabled]="disabled()"
        [attr.aria-label]="('editCustomColor' | t) + ': ' + color.name"
        [title]="('editCustomColor' | t) + ': ' + color.name"
      >
        <ng-icon name="lucidePencil" aria-hidden="true" />
      </button>
    } @else {
      <button
        hlmBtn
        variant="outline"
        type="button"
        hlmDrawerTrigger
        [disabled]="disabled()"
        [attr.aria-label]="'addCustomColor' | t"
      >
        {{ 'addCustomColor' | t }}
      </button>
    }
    <hlm-drawer-content *hlmDrawerPortal class="overflow-hidden sm:max-w-md">
      <hlm-drawer-header>
        <h2 hlmDrawerTitle>{{ (item() ? 'editCustomColor' : 'addCustomColor') | t }}</h2>
        <p hlmDrawerDescription>{{ 'customPickerHelp' | t }}</p>
      </hlm-drawer-header>
      <div
        hlmDrawerBody
        class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pb-1"
        (pointerdown)="$event.stopPropagation()"
      >
        <div hlmField>
          <label hlmFieldLabel [for]="uid + '-name'">{{ 'customColorName' | t }}</label>
          <input
            hlmInput
            [id]="uid + '-name'"
            [ngModel]="name()"
            (ngModelChange)="name.set($event)"
            [ngModelOptions]="{ standalone: true }"
            maxlength="40"
            autocomplete="off"
            [attr.aria-invalid]="!validName()"
            [attr.aria-describedby]="uid + '-name-help'"
          />
          <p hlmFieldDescription [id]="uid + '-name-help'">{{ 'customColorNameHelp' | t }}</p>
          @if (name() && !validName()) {
            <hlm-field-error forceShow>{{ 'customColorNameInvalid' | t }}</hlm-field-error>
          }
        </div>
        <div
          class="color-plane"
          [style.background-color]="hueColor()"
          aria-hidden="true"
          (pointerdown)="startDrag($event)"
          (pointermove)="drag($event)"
          (pointerup)="endDrag($event)"
          (pointercancel)="endDrag($event)"
        >
          <span class="color-point" [style.left.%]="hsv().s" [style.top.%]="100 - hsv().v"></span>
        </div>
        @for (axis of axes; track axis.key) {
          <div class="grid gap-2 rounded-lg border border-border/70 bg-muted/30 px-3 py-3">
            <div
              class="flex items-center justify-between gap-3 text-sm font-medium leading-none"
              [id]="uid + '-' + axis.key"
            >
              <span>{{ axis.label | t }}</span>
              <span class="text-muted-foreground tabular-nums" aria-hidden="true">
                {{ rounded(hsv()[axis.key]) }}{{ axis.key === 'h' ? '°' : '%' }}
              </span>
            </div>
            <hlm-slider
              class="py-1.5"
              [value]="[hsv()[axis.key]]"
              [min]="0"
              [max]="axis.max"
              [step]="1"
              [aria-labelledby]="uid + '-' + axis.key"
              (valueChange)="setAxis(axis.key, $event)"
            />
          </div>
        }
        <div hlmField>
          <label hlmFieldLabel [for]="uid + '-hex'">{{ 'customHexColor' | t }}</label>
          <div class="flex items-center gap-2">
            <span
              class="size-8 shrink-0 rounded-md border border-border"
              [style.background-color]="displayColor()"
              aria-hidden="true"
            ></span>
            <input
              hlmInput
              [id]="uid + '-hex'"
              [ngModel]="hex()"
              (ngModelChange)="setHex($event)"
              [ngModelOptions]="{ standalone: true }"
              maxlength="7"
              spellcheck="false"
              autocomplete="off"
              [attr.aria-invalid]="!validHex()"
              [attr.aria-describedby]="uid + '-hex-help'"
            />
          </div>
          <p hlmFieldDescription [id]="uid + '-hex-help'">{{ 'primaryColorHelp' | t }}</p>
          @if (!validHex()) {
            <hlm-field-error forceShow>{{ 'primaryColorInvalid' | t }}</hlm-field-error>
          }
        </div>
      </div>
      <hlm-drawer-footer>
        <button
          hlmBtn
          type="button"
          [disabled]="!validHex() || !validName() || disabled()"
          (click)="apply()"
        >
          {{ 'useCustomColor' | t }}
        </button>
      </hlm-drawer-footer>
    </hlm-drawer-content>
  </hlm-drawer>`,
  styles: `
    .color-plane {
      position: relative;
      height: 8rem;
      border-radius: var(--radius);
      touch-action: none;
      cursor: crosshair;
      background-image:
        linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent);
    }
    .color-point {
      position: absolute;
      width: 0.75rem;
      height: 0.75rem;
      border: 2px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 0 1px #000;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }
  `,
})
export class CustomColorEditor {
  readonly item = input<CustomBrandColor | null>(null);
  readonly initialColor = input(DEFAULT_PRIMARY_COLOR);
  readonly usedNames = input<string[]>([]);
  readonly disabled = input(false);
  readonly changed = output<{ name: string; color: string }>();
  readonly preview = output<string | null>();
  readonly uid = 'color-editor-' + crypto.randomUUID();
  readonly state = signal<'open' | 'closed'>('closed');
  readonly name = signal('');
  readonly hex = signal(DEFAULT_PRIMARY_COLOR);
  readonly hsv = signal(hexToHsv(DEFAULT_PRIMARY_COLOR));
  readonly validHex = computed(() => validPrimaryColor(this.hex()));
  readonly validName = computed(() => {
    const name = this.name().trim();
    return (
      name.length > 0 &&
      name.length <= 40 &&
      !Array.from(name).some((character) => {
        const code = character.charCodeAt(0);
        return code < 32 || (code >= 127 && code <= 159);
      }) &&
      !this.usedNames().some((used) => used.toLowerCase() === name.toLowerCase())
    );
  });
  readonly displayColor = computed(() => hsvToHex(this.hsv()));
  readonly hueColor = computed(() => hsvToHex({ h: this.hsv().h, s: 100, v: 100 }));
  readonly axes: { key: keyof HsvColor; label: string; max: number }[] = [
    { key: 'h', label: 'colorHue', max: 360 },
    { key: 's', label: 'colorSaturation', max: 100 },
    { key: 'v', label: 'colorBrightness', max: 100 },
  ];
  readonly rounded = Math.round;
  stateChanged(state: 'open' | 'closed') {
    this.state.set(state);
    if (state === 'open') {
      this.name.set(this.item()?.name ?? '');
      this.setHex(this.item()?.color ?? this.initialColor());
    } else this.preview.emit(null);
  }
  setHex(value: string) {
    this.hex.set(value);
    if (validPrimaryColor(value)) {
      const next = hexToHsv(value);
      // Hue remains useful when moving away from a gray or black color.
      if (!next.s) next.h = this.hsv().h;
      this.hsv.set(next);
      this.preview.emit(value.toUpperCase());
    }
  }
  setAxis(axis: keyof HsvColor, values: number[]) {
    if (values[0] === undefined) return;
    this.update({ ...this.hsv(), [axis]: values[0] });
  }
  private update(value: HsvColor) {
    this.hsv.set(value);
    this.hex.set(hsvToHex(value));
    this.preview.emit(this.hex());
  }
  startDrag(event: PointerEvent) {
    if (event.button !== 0) return;
    const target = event.currentTarget as HTMLElement;
    target.setPointerCapture(event.pointerId);
    this.drag(event);
  }
  drag(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement;
    if (!target.hasPointerCapture(event.pointerId)) return;
    const box = target.getBoundingClientRect();
    if (!box.width || !box.height) return;
    this.update({
      h: this.hsv().h,
      s: Math.max(0, Math.min(100, ((event.clientX - box.left) / box.width) * 100)),
      v: Math.max(0, Math.min(100, 100 - ((event.clientY - box.top) / box.height) * 100)),
    });
  }
  endDrag(event: PointerEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target.hasPointerCapture(event.pointerId)) target.releasePointerCapture(event.pointerId);
  }
  apply() {
    if (!this.validName() || !this.validHex() || this.disabled()) return;
    this.changed.emit({ name: this.name().trim(), color: this.hex().toUpperCase() });
    this.close();
  }
  close() {
    this.state.set('closed');
    this.preview.emit(null);
  }
}

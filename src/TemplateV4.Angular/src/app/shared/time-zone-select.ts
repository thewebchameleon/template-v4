import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { HlmSelectImports } from '@spartan-ng/helm/select';

interface TimeZoneOption {
  id: string;
  label: string;
}

interface TimeZoneGroup {
  offset: string;
  offsetMinutes: number;
  zones: TimeZoneOption[];
}

@Component({
  selector: 'app-time-zone-select',
  imports: [HlmSelectImports],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeZoneSelect),
      multi: true,
    },
  ],
  template: `
    <hlm-select
      [value]="value()"
      [disabled]="disabled() || formDisabled()"
      [itemToString]="timeZoneLabel"
      (valueChange)="select($event)"
      (closed)="onTouched()"
    >
      <hlm-select-trigger [buttonId]="buttonId()" class="w-full">
        <hlm-select-value />
      </hlm-select-trigger>
      <hlm-select-content *hlmSelectPortal [ariaLabel]="ariaLabel()">
        @for (group of groups(); track group.offset) {
          <hlm-select-group>
            <hlm-select-label>{{ group.offset }}</hlm-select-label>
            @for (zone of group.zones; track zone.id) {
              <hlm-select-item [value]="zone.id">{{ zone.label }}</hlm-select-item>
            }
          </hlm-select-group>
        }
      </hlm-select-content>
    </hlm-select>
  `,
})
export class TimeZoneSelect implements ControlValueAccessor {
  readonly timeZones = input.required<readonly string[]>();
  readonly buttonId = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly disabled = input(false);
  readonly value = signal('');
  readonly formDisabled = signal(false);
  readonly groups = computed(() => this.groupTimeZones(this.timeZones()));
  private readonly labels = computed(
    () =>
      new Map(this.groups().flatMap((group) => group.zones.map((zone) => [zone.id, zone.label]))),
  );
  readonly timeZoneLabel = (zone: string) => this.labels().get(zone) ?? zone;
  private onChange: (value: string) => void = () => undefined;
  onTouched: () => void = () => undefined;

  writeValue(value: string | null | undefined) {
    this.value.set(value ?? '');
  }

  registerOnChange(onChange: (value: string) => void) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: () => void) {
    this.onTouched = onTouched;
  }

  setDisabledState(disabled: boolean) {
    this.formDisabled.set(disabled);
  }

  select(value: string | string[] | null | undefined) {
    if (typeof value !== 'string' || value === this.value()) return;
    this.value.set(value);
    this.onChange(value);
  }

  private groupTimeZones(zones: readonly string[]): TimeZoneGroup[] {
    const now = new Date();
    const grouped = new Map<number, TimeZoneGroup>();
    for (const id of zones) {
      const { label: offset, minutes: offsetMinutes } = this.currentOffset(id, now);
      const group = grouped.get(offsetMinutes) ?? { offset, offsetMinutes, zones: [] };
      group.zones.push({ id, label: `(${offset}) ${id}` });
      grouped.set(offsetMinutes, group);
    }
    return [...grouped.values()]
      .sort((a, b) => a.offsetMinutes - b.offsetMinutes)
      .map((group) => ({
        ...group,
        zones: group.zones.sort((a, b) => a.id.localeCompare(b.id)),
      }));
  }

  private currentOffset(zone: string, date: Date) {
    const value =
      new Intl.DateTimeFormat('en', {
        timeZone: zone,
        timeZoneName: 'longOffset',
      })
        .formatToParts(date)
        .find((part) => part.type === 'timeZoneName')?.value ?? 'GMT';
    const match = /^GMT(?:([+-])(\d{1,2})(?::(\d{2}))?)?$/.exec(value);
    if (!match?.[1]) return { label: 'GMT+00:00', minutes: 0 };
    const direction = match[1] === '-' ? -1 : 1;
    const hours = Number(match[2]);
    const minutes = Number(match[3] ?? 0);
    return {
      label: `GMT${match[1]}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
      minutes: direction * (hours * 60 + minutes),
    };
  }
}

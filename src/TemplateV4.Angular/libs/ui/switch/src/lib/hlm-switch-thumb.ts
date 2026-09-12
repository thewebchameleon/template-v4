import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: 'brn-switch-thumb[hlm],[hlmSwitchThumb]',
  host: { 'data-slot': 'switch-thumb' },
})
export class HlmSwitchThumb {
  constructor() {
    classes(
      () =>
        'bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground rounded-full group-data-[size=default]/switch:size-[1rem] group-data-[size=sm]/switch:size-[0.75rem] shrink-0 data-unchecked:translate-x-0 data-checked:ltr:translate-x-full data-checked:rtl:-translate-x-full pointer-events-none block ring-0 transition-transform',
    );
  }
}

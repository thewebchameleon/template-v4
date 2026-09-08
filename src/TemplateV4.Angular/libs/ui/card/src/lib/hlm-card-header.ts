import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: '[hlmCardHeader],hlm-card-header',
  host: { 'data-slot': 'card-header' },
})
export class HlmCardHeader {
  constructor() {
    classes(
      () =>
        'group/card-header @container/card-header grid auto-rows-min items-start gap-1 ps-(--panel-header-padding-inline) pe-[var(--panel-header-padding-end,var(--panel-header-padding-inline))] pt-[var(--panel-header-padding-top,var(--panel-header-padding-block))] pb-(--panel-header-padding-block) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto]',
    );
  }
}

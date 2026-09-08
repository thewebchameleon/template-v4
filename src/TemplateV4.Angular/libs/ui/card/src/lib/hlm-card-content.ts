import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: '[hlmCardContent]',
  host: { 'data-slot': 'card-content' },
})
export class HlmCardContent {
  constructor() {
    classes(
      () =>
        'rounded-(--panel-content-radius) bg-card px-(--card-spacing) pt-[var(--panel-content-padding-top,var(--card-spacing))] pb-(--card-spacing) shadow-xs ring-1 ring-foreground/10 [&:has(+_[data-slot=card-footer])]:rounded-b-none',
    );
  }
}

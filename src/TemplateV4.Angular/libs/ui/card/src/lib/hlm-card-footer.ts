import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: '[hlmCardFooter],hlm-card-footer',
  host: { 'data-slot': 'card-footer' },
})
export class HlmCardFooter {
  constructor() {
    classes(
      () =>
        'flex items-center rounded-(--panel-content-radius) bg-card px-(--card-spacing) pb-(--card-spacing) pt-4 shadow-xs ring-1 ring-foreground/10 group-has-[>_[data-slot=card-content]]/card:-mt-px group-has-[>_[data-slot=card-content]]/card:rounded-t-none',
    );
  }
}

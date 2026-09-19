import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';
import { provideScrollbarOptions } from 'ngx-scrollbar';

@Directive({
  selector: 'ng-scrollbar[hlm],ng-scrollbar[hlmScrollbar]',
  providers: [provideScrollbarOptions({ visibility: 'hover' })],
  host: {
    'data-slot': 'scroll-area',
    '[style.--scrollbar-thumb-color]': '"color-mix(in oklab, var(--foreground) 35%, transparent)"',
    '[style.--scrollbar-thumb-hover-color]':
      '"color-mix(in oklab, var(--foreground) 50%, transparent)"',
    '[style.--scrollbar-track-color]': '"transparent"',
    '[style.--scrollbar-track-thickness]': '"0.625rem"',
  },
})
export class HlmScrollArea {
  constructor() {
    classes(
      () => 'rounded-md [--scrollbar-track-offset:1.5px] [--scrollbar-thumb-shape:9999px] block',
    );
  }
}

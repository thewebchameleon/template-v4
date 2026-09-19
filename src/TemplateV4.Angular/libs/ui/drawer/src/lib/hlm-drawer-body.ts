import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: '[hlmDrawerBody]',
  host: {
    'data-slot': 'drawer-body',
    '[style.--_viewport-padding-block-start]': '"var(--drawer-body-padding-block-start, 0px)"',
    '[style.--_viewport-padding-block-end]': '"var(--drawer-body-padding-block-end, 0px)"',
    '[style.--_viewport-padding-inline-start]': '"var(--drawer-body-padding-inline, 0px)"',
    '[style.--_viewport-padding-inline-end]': '"var(--drawer-body-padding-inline, 0px)"',
  },
})
export class HlmDrawerBody {
  constructor() {
    classes(
      () =>
        'group-data-[vaul-drawer-direction=right]/drawer-content:rounded-(--panel-content-radius) group-data-[vaul-drawer-direction=right]/drawer-content:bg-card group-data-[vaul-drawer-direction=right]/drawer-content:px-(--panel-header-padding-inline) group-data-[vaul-drawer-direction=right]/drawer-content:pt-(--panel-header-padding-inline) group-data-[vaul-drawer-direction=right]/drawer-content:pb-(--card-spacing) group-data-[vaul-drawer-direction=right]/drawer-content:shadow-xs group-data-[vaul-drawer-direction=right]/drawer-content:ring-1 group-data-[vaul-drawer-direction=right]/drawer-content:ring-foreground/10 group-data-[vaul-drawer-direction=right]/drawer-content:[&:has(+_[data-slot=drawer-footer])]:rounded-b-none',
    );
  }
}

import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: '[hlmDrawerFooter],hlm-drawer-footer',
  host: { 'data-slot': 'drawer-footer' },
})
export class HlmDrawerFooter {
  constructor() {
    classes(
      () =>
        'gap-2 p-4 mt-auto flex flex-col group-data-[vaul-drawer-direction=right]/drawer-content:rounded-(--panel-content-radius) group-data-[vaul-drawer-direction=right]/drawer-content:rounded-t-none group-data-[vaul-drawer-direction=right]/drawer-content:bg-card group-data-[vaul-drawer-direction=right]/drawer-content:px-(--panel-header-padding-inline) group-data-[vaul-drawer-direction=right]/drawer-content:py-4 group-data-[vaul-drawer-direction=right]/drawer-content:shadow-xs group-data-[vaul-drawer-direction=right]/drawer-content:ring-1 group-data-[vaul-drawer-direction=right]/drawer-content:ring-foreground/10 group-data-[vaul-drawer-direction=right]/drawer-content:-mt-px',
    );
  }
}

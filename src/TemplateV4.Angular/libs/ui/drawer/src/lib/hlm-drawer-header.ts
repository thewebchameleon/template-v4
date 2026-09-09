import { Directive } from '@angular/core';
import { classes } from '@spartan-ng/helm/utils';

@Directive({
  selector: '[hlmDrawerHeader],hlm-drawer-header',
  host: { 'data-slot': 'drawer-header' },
})
export class HlmDrawerHeader {
  constructor() {
    classes(
      () =>
        'bg-muted border-border gap-0.5 border-b p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-start flex flex-col group-data-[vaul-drawer-direction=right]/drawer-content:border-b-0 group-data-[vaul-drawer-direction=right]/drawer-content:bg-transparent group-data-[vaul-drawer-direction=right]/drawer-content:ps-(--panel-header-padding-inline) group-data-[vaul-drawer-direction=right]/drawer-content:pe-(--panel-header-padding-inline) group-data-[vaul-drawer-direction=right]/drawer-content:pt-(--panel-header-padding-block) group-data-[vaul-drawer-direction=right]/drawer-content:pb-(--panel-header-padding-block)',
    );
  }
}

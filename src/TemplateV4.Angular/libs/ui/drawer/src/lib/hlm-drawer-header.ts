import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { classes } from '@spartan-ng/helm/utils';
import { HlmDrawer } from './hlm-drawer';

@Component({
  selector: '[hlmDrawerHeader],hlm-drawer-header',
  imports: [HlmButton, NgIcon],
  providers: [provideIcons({ lucideX })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'data-slot': 'drawer-header' },
  template: `
    <ng-content />
    <button
      hlmBtn
      type="button"
      variant="ghost"
      size="icon-lg"
      class="absolute top-(--panel-inset) end-(--panel-inset) size-14 rounded-full"
      [disabled]="drawer.closePending()"
      [attr.aria-label]="drawer.closeLabel()"
      [title]="drawer.closeLabel()"
      (click)="drawer.requestClose()"
    >
      <ng-icon name="lucideX" class="text-3xl" aria-hidden="true" />
    </button>
  `,
})
export class HlmDrawerHeader {
  protected readonly drawer = inject(HlmDrawer);

  constructor() {
    classes(
      () =>
        'bg-muted border-border relative gap-0.5 border-b p-4 pe-20 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-start flex flex-col group-data-[vaul-drawer-direction=right]/drawer-content:border-b-0 group-data-[vaul-drawer-direction=right]/drawer-content:bg-transparent group-data-[vaul-drawer-direction=right]/drawer-content:ps-(--panel-header-padding-inline) group-data-[vaul-drawer-direction=right]/drawer-content:pe-20 group-data-[vaul-drawer-direction=right]/drawer-content:pt-(--panel-header-padding-block) group-data-[vaul-drawer-direction=right]/drawer-content:pb-(--panel-header-padding-block)',
    );
  }
}

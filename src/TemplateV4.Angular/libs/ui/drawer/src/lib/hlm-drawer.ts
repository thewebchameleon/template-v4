import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { BrnDialog, provideBrnDialogDefaultOptions } from '@spartan-ng/brain/dialog';
import { BrnDrawer } from '@spartan-ng/brain/drawer';
import { HlmDrawerOverlay } from './hlm-drawer-overlay';

@Component({
  selector: 'hlm-drawer',
  exportAs: 'hlmDrawer',
  imports: [HlmDrawerOverlay],
  providers: [
    {
      provide: BrnDialog,
      useExisting: forwardRef(() => HlmDrawer),
    },
    {
      provide: BrnDrawer,
      useExisting: forwardRef(() => HlmDrawer),
    },
    provideBrnDialogDefaultOptions({
      // add custom options here
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <hlm-drawer-overlay />
    <ng-content />
  `,
})
export class HlmDrawer extends BrnDrawer {
  public readonly closeLabel = input('Close');
  public readonly closeGuard = input<(() => boolean | Promise<boolean>) | null>(null);
  public readonly closePending = signal(false);

  public async requestClose(): Promise<void> {
    if (this.closePending()) return;
    const guard = this.closeGuard();
    if (!guard) {
      if (!this.disableClose()) this.close();
      return;
    }

    this.closePending.set(true);
    try {
      if (await guard()) this.close();
    } finally {
      this.closePending.set(false);
    }
  }
}

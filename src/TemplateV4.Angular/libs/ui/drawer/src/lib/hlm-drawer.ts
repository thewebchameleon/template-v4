import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { BrnDialog, provideBrnDialogDefaultOptions } from '@spartan-ng/brain/dialog';
import { BrnDrawer } from '@spartan-ng/brain/drawer';
import { HlmModalState } from '@spartan-ng/helm/utils';
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
      closeOnOutsidePointerEvents: false,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': '_handleDocumentClick($event)',
  },
  template: `
    <hlm-drawer-overlay />
    <ng-content />
  `,
})
export class HlmDrawer extends BrnDrawer {
  private readonly _modalState = inject(HlmModalState);

  public readonly closeLabel = input('Close');
  public readonly closeGuard = input<(() => boolean | Promise<boolean>) | null>(null);
  public readonly closePending = signal(false);

  public override close(result?: unknown): void {
    if (this._modalState.hasOpenModal()) return;

    super.close(result);
  }

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

  protected _handleDocumentClick(event: MouseEvent): void {
    const target = event.target as Element | null;
    if (!target?.classList.contains('hlm-drawer-backdrop')) return;

    void this.requestClose();
  }
}

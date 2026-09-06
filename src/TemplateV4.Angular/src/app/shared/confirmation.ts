import { Component, Injectable, inject, signal } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Translate } from '../core/i18n';
@Injectable({ providedIn: 'root' })
export class Confirmations {
  readonly current = signal<{
    title: string;
    description: string;
    detail: string;
    destructive: boolean;
  } | null>(null);
  private resolve: ((value: boolean) => void) | null = null;
  ask(title: string, description: string, detail = '', destructive = false) {
    this.finish(false);
    this.current.set({ title, description, detail, destructive });
    return new Promise<boolean>((resolve) => (this.resolve = resolve));
  }
  finish(value: boolean) {
    this.resolve?.(value);
    this.resolve = null;
    this.current.set(null);
  }
}
@Component({
  selector: 'app-confirmation',
  imports: [HlmDialogImports, HlmButtonImports, Translate],
  template: ` <hlm-dialog
    [state]="confirm.current() ? 'open' : 'closed'"
    (stateChanged)="$event === 'closed' && confirm.finish(false)"
  >
    <hlm-dialog-content *hlmDialogPortal [showCloseButton]="false"
      ><hlm-dialog-header
        ><h2 hlmDialogTitle>{{ confirm.current()?.title ?? '' | t }}</h2>
        <p hlmDialogDescription>
          {{ confirm.current()?.description ?? '' | t }}
        </p></hlm-dialog-header
      >
      @if (confirm.current()?.detail) {
        <p class="break-words font-medium">{{ confirm.current()?.detail }}</p>
      }
      <hlm-dialog-footer
        ><button hlmBtn variant="outline" (click)="confirm.finish(false)">{{ 'cancel' | t }}</button
        ><button
          hlmBtn
          [variant]="confirm.current()?.destructive ? 'destructive' : 'default'"
          (click)="confirm.finish(true)"
        >
          {{ 'confirm' | t }}
        </button></hlm-dialog-footer
      >
    </hlm-dialog-content></hlm-dialog
  >`,
})
export class Confirmation {
  readonly confirm = inject(Confirmations);
}
export interface UnsavedPage {
  hasUnsavedChanges(): boolean;
}
export const unsavedGuard: CanDeactivateFn<UnsavedPage> = (component) =>
  !component.hasUnsavedChanges() || inject(Confirmations).ask('unsavedTitle', 'unsavedHelp');
export function protectUnload(event: BeforeUnloadEvent, dirty: boolean) {
  if (dirty) {
    event.preventDefault();
    event.returnValue = '';
  }
}

import { Component, Injectable, inject, signal } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { Translate } from '../core/i18n';
@Injectable({ providedIn: 'root' })
export class Confirmations {
  readonly current = signal<{
    title: string;
    description: string;
    detail: string;
    destructive: boolean;
    actionLabel: string;
  } | null>(null);
  private resolve: ((value: boolean) => void) | null = null;
  ask(
    title: string,
    description: string,
    detail = '',
    destructive = false,
    actionLabel = 'confirm',
  ) {
    this.finish(false);
    this.current.set({ title, description, detail, destructive, actionLabel });
    return new Promise<boolean>((resolve) => (this.resolve = resolve));
  }
  finish(value: boolean) {
    const resolve = this.resolve;
    this.resolve = null;
    this.current.set(null);
    resolve?.(value);
  }
}
@Component({
  selector: 'app-confirmation',
  imports: [HlmAlertDialogImports, Translate],
  template: ` <hlm-alert-dialog
    [state]="confirm.current() ? 'open' : 'closed'"
    (stateChanged)="$event === 'closed' && confirm.finish(false)"
  >
    <hlm-alert-dialog-content *hlmAlertDialogPortal
      ><hlm-alert-dialog-header
        ><h2 hlmAlertDialogTitle>{{ confirm.current()?.title ?? '' | t }}</h2>
        <p hlmAlertDialogDescription>
          {{ confirm.current()?.description ?? '' | t }}
          @if (confirm.current()?.detail) {
            <span class="block break-words">{{ confirm.current()?.detail }}</span>
          }
        </p></hlm-alert-dialog-header
      ><hlm-alert-dialog-footer
        ><button hlmAlertDialogCancel (click)="confirm.finish(false)">{{ 'cancel' | t }}</button
        ><button
          hlmAlertDialogAction
          [variant]="confirm.current()?.destructive ? 'destructive' : 'default'"
          (click)="confirm.finish(true)"
        >
          {{ confirm.current()?.actionLabel ?? 'confirm' | t }}
        </button></hlm-alert-dialog-footer
      >
    </hlm-alert-dialog-content></hlm-alert-dialog
  >`,
})
export class Confirmation {
  readonly confirm = inject(Confirmations);
}
export interface UnsavedPage {
  hasUnsavedChanges(): boolean;
}
export const unsavedGuard: CanDeactivateFn<UnsavedPage> = (component) =>
  !component.hasUnsavedChanges() ||
  inject(Confirmations).ask('unsavedTitle', 'unsavedHelp', '', true, 'discardChanges');
export function protectUnload(event: BeforeUnloadEvent, dirty: boolean) {
  if (dirty) {
    event.preventDefault();
    event.returnValue = '';
  }
}

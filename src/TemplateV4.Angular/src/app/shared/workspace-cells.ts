import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Translate } from '../core/i18n';

export interface RowAction {
  label: string;
  run: () => void;
  disabled?: boolean;
  destructive?: boolean;
}
@Component({
  selector: 'app-row-actions',
  imports: [HlmButtonImports, Translate],
  template: `<div class="flex flex-wrap gap-1">
    @for (action of actions(); track action.label) {
      <button
        hlmBtn
        [variant]="action.destructive ? 'outline' : 'ghost'"
        size="sm"
        [disabled]="action.disabled"
        (click)="action.run()"
      >
        {{ action.label | t }}
      </button>
    }
  </div>`,
})
export class RowActions {
  readonly actions = input.required<RowAction[]>();
}
@Component({
  selector: 'app-record-identity',
  imports: [RouterLink],
  template: `<div class="max-w-72 whitespace-normal break-words font-medium">
      @if (link()) {
        <a class="workspace-link" [routerLink]="link()" [queryParams]="params()">{{ label() }}</a>
      } @else {
        {{ label() }}
      }
    </div>
    @if (description()) {
      <div class="workspace-meta max-w-72 whitespace-normal break-words">{{ description() }}</div>
    }`,
})
export class RecordIdentity {
  readonly label = input.required<string>();
  readonly description = input('');
  readonly link = input<string | null>(null);
  readonly params = input<Record<string, string>>({});
}
@Component({
  selector: 'app-record-status',
  imports: [HlmBadgeImports, Translate],
  template: `<span hlmBadge [variant]="danger() ? 'destructive' : 'secondary'">{{
    value() | t
  }}</span>`,
})
export class RecordStatus {
  readonly value = input.required<string>();
  readonly danger = input(false);
}

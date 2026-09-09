import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
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
  template: `<div class="flex flex-wrap justify-end gap-1">
    @for (action of actions(); track action.label) {
      <button
        hlmBtn
        [variant]="action.destructive ? 'destructive' : 'secondary'"
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
  template: `<div
      class="whitespace-normal break-words font-medium"
      [class.max-w-72]="constrainWidth()"
    >
      @if (link()) {
        <a
          class="workspace-link"
          [routerLink]="link()"
          [queryParams]="params()"
          [queryParamsHandling]="merge() ? 'merge' : 'replace'"
          >{{ label() }}</a
        >
      } @else {
        {{ label() }}
      }
    </div>
    @if (description()) {
      <div class="workspace-meta whitespace-normal break-words" [class.max-w-72]="constrainWidth()">
        {{ description() }}
      </div>
    }`,
})
export class RecordIdentity {
  readonly label = input.required<string>();
  readonly description = input('');
  readonly constrainWidth = input(true);
  readonly link = input<string | null>(null);
  readonly params = input<Record<string, string>>({});
  readonly merge = input(false);
}
@Component({
  selector: 'app-record-user-identity',
  imports: [HlmAvatarImports],
  template: `<div class="flex min-w-48 items-center gap-3">
    <hlm-avatar>
      <span hlmAvatarFallback>{{ initials() }}</span>
    </hlm-avatar>
    <div class="min-w-0">
      <div class="truncate font-medium">{{ username() }}</div>
      <div class="workspace-meta truncate">{{ displayName() }}</div>
    </div>
  </div>`,
})
export class RecordUserIdentity {
  readonly username = input.required<string>();
  readonly displayName = input.required<string>();
  protected initials() {
    return this.displayName()
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }
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

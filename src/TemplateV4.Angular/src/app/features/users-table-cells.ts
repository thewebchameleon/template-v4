import { Component, input, type Signal } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { UserDto as User } from '../api/models/user-dto';
import { Translate } from '../core/i18n';
import { RouterLink } from '@angular/router';

export interface UserTableRow {
  user: User;
  busy: Signal<boolean>;
  canManage: boolean;
  isCurrentUser: boolean;
  roleDrafts: Map<string, string[]>;
  invitation: (cancel: boolean) => void;
  toggle: () => void;
  selectRoles: (roles: unknown) => void;
  changeRole: () => void;
}

@Component({
  selector: 'app-user-identity-cell',
  imports: [RouterLink],
  template: `
    <a routerLink="/audit" [queryParams]="{ subjectId: user().id }" class="workspace-link">{{
      user().displayName
    }}</a>
    <div class="text-sm text-muted-foreground">{{ user().email }}</div>
  `,
})
export class UserIdentityCell {
  readonly user = input.required<User>();
}

@Component({
  selector: 'app-user-status-cell',
  imports: [HlmBadgeImports, Translate],
  template: `
    <span hlmBadge [variant]="user().disabled ? 'outline' : 'secondary'">
      {{ statusKey() | t }}
    </span>
  `,
})
export class UserStatusCell {
  readonly user = input.required<User>();

  protected statusKey() {
    return this.user().status === 'Invited'
      ? 'invited'
      : this.user().disabled
        ? 'disabled'
        : 'active';
  }
}

@Component({
  selector: 'app-user-actions-cell',
  imports: [HlmButtonImports, HlmFieldImports, HlmToggleGroupImports, Translate],
  template: `
    @if (row().canManage && !row().isCurrentUser) {
      <div class="flex min-w-56 flex-col items-stretch gap-2">
        @if (row().user.status === 'Invited') {
          <button
            hlmBtn
            variant="outline"
            [disabled]="row().busy()"
            (click)="row().invitation(false)"
          >
            {{ 'resendInvitation' | t }}
          </button>
          <button
            hlmBtn
            variant="destructive"
            [disabled]="row().busy()"
            (click)="row().invitation(true)"
          >
            {{ 'cancelInvitation' | t }}
          </button>
        }
        <button hlmBtn variant="ghost" size="sm" [disabled]="row().busy()" (click)="row().toggle()">
          {{ (row().user.disabled ? 'enable' : 'disable') | t }}
        </button>
        <fieldset hlmFieldSet>
          <legend hlmFieldLegend class="sr-only">{{ 'role' | t }}</legend>
          <hlm-toggle-group
            type="multiple"
            variant="outline"
            [nullable]="false"
            [attr.aria-label]="('role' | t) + ': ' + row().user.displayName"
            [value]="row().roleDrafts.get(row().user.id) ?? row().user.roles"
            [disabled]="row().busy()"
            (valueChange)="row().selectRoles($event)"
          >
            <button hlmToggleGroupItem value="Reader">{{ 'reader' | t }}</button>
            <button hlmToggleGroupItem value="Administrator">{{ 'administrator' | t }}</button>
          </hlm-toggle-group>
        </fieldset>
        <button
          hlmBtn
          variant="outline"
          [disabled]="row().busy() || !row().roleDrafts.has(row().user.id)"
          (click)="row().changeRole()"
        >
          {{ 'save' | t }}
        </button>
      </div>
    }
  `,
})
export class UserActionsCell {
  readonly row = input.required<UserTableRow>();
}

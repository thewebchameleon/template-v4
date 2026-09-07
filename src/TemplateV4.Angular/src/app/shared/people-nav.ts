import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Auth } from '../core/auth';
import { Translate } from '../core/i18n';
@Component({
  selector: 'app-people-nav',
  imports: [RouterLink, RouterLinkActive, HlmButtonImports, Translate],
  template: `<nav class="mb-6 flex flex-wrap gap-2" [attr.aria-label]="'people' | t">
    <a
      hlmBtn
      variant="ghost"
      routerLink="/users"
      routerLinkActive="bg-muted"
      [routerLinkActiveOptions]="{ exact: true }"
      ariaCurrentWhenActive="page"
      >{{ 'users' | t }}</a
    >
    @if (auth.has('users.manage')) {
      <a
        hlmBtn
        variant="ghost"
        routerLink="/users/invitations"
        routerLinkActive="bg-muted"
        ariaCurrentWhenActive="page"
        >{{ 'invitations' | t }}</a
      >
    }
  </nav>`,
})
export class PeopleNav {
  readonly auth = inject(Auth);
}

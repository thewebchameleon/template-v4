import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Auth } from '../core/auth';
import { WorkspaceUi } from '../shared/workspace';
@Component({
  selector: 'app-unavailable',
  imports: [WorkspaceUi],
  template: ` @if (forbidden) {
      <app-page-header title="accessRestricted" description="accessRestrictedHelp" /><a
        hlmBtn
        [routerLink]="auth.access() ? auth.landing() : '/login'"
        >{{ (auth.access() ? 'backToWorkspace' : 'signIn') | t }}</a
      >
    } @else {
      <app-page-header title="pageNotFound" description="pageNotFoundHelp" /><a
        hlmBtn
        [routerLink]="auth.access() ? auth.landing() : '/login'"
        >{{ (auth.access() ? 'backToWorkspace' : 'signIn') | t }}</a
      >
    }`,
})
export class UnavailablePage {
  readonly auth = inject(Auth);
  readonly forbidden = inject(ActivatedRoute).snapshot.data['forbidden'] === true;
}

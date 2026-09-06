import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceUi } from '../shared/workspace';
@Component({
  selector: 'app-unavailable',
  imports: [WorkspaceUi],
  template: ` @if (forbidden) {
      <app-page-header title="accessRestricted" description="accessRestrictedHelp" /><a
        hlmBtn
        routerLink="/profile"
        >{{ 'profile' | t }}</a
      >
    } @else {
      <app-page-header title="pageNotFound" description="pageNotFoundHelp" /><a
        hlmBtn
        routerLink="/profile"
        >{{ 'profile' | t }}</a
      >
    }`,
})
export class UnavailablePage {
  readonly forbidden = inject(ActivatedRoute).snapshot.data['forbidden'] === true;
}

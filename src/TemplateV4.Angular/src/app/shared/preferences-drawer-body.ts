import { Component, viewChild } from '@angular/core';
import { HlmDrawerBody } from '@spartan-ng/helm/drawer';
import { HlmScrollArea } from '@spartan-ng/helm/scroll-area';
import { NgScrollbar } from 'ngx-scrollbar';
import { Preferences } from '../core/preferences';

@Component({
  selector: 'app-preferences-drawer-body',
  imports: [HlmDrawerBody, HlmScrollArea, NgScrollbar, Preferences],
  template: `
    <ng-scrollbar hlm hlmDrawerBody orientation="vertical" class="min-h-0 flex-1">
      <app-preferences [expanded]="true" />
    </ng-scrollbar>
  `,
})
export class PreferencesDrawerBody {
  private readonly preferences = viewChild.required(Preferences);

  resetting() {
    return this.preferences().resetting();
  }

  reset() {
    return this.preferences().reset();
  }
}

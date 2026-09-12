import { Component, inject, input, output, viewChild } from '@angular/core';
import { BrnTabs } from '@spartan-ng/brain/tabs';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { Auth } from '../core/auth';
import { Translate } from '../core/i18n';
@Component({
  selector: 'app-people-nav',
  imports: [HlmTabsImports, Translate],
  template: `<nav class="mb-6" [attr.aria-label]="'people' | t">
    <hlm-tabs [tab]="section()" (tabActivated)="requestSection($event)">
      <hlm-tabs-list class="flex-wrap">
        @if (auth.has('users.read')) {
          <button hlmTabsTrigger="users">{{ 'users' | t }}</button>
        }
        @if (auth.has('users.manage')) {
          <button hlmTabsTrigger="invitations">{{ 'invitations' | t }}</button>
        }
        @if (auth.has('roles.manage')) {
          <button hlmTabsTrigger="roles">{{ 'roles' | t }}</button>
        }
        @if (auth.has('settings.manage')) {
          <button hlmTabsTrigger="security">{{ 'security' | t }}</button>
        }
      </hlm-tabs-list>
    </hlm-tabs>
  </nav>`,
})
export class PeopleNav {
  readonly auth = inject(Auth);
  readonly section = input.required<string>();
  readonly sectionChange = output<string>();
  private readonly tabs = viewChild.required(BrnTabs);

  requestSection(section: string) {
    // Keep selection on the current page until its navigation is confirmed.
    this.tabs().setActiveTab(this.section());
    this.sectionChange.emit(section);
  }
}

import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { WorkspaceUi } from '../shared/workspace';

@Component({
  selector: 'app-notification-centre',
  imports: [WorkspaceUi, RouterOutlet],
  template: `
    <app-page-header title="notificationCentre" description="notificationIntro" />
    <hlm-tabs [tab]="tab()" (tabActivated)="select($event)" class="mb-5">
      <hlm-tabs-list [attr.aria-label]="'notificationCentre' | t">
        <button hlmTabsTrigger="inbox">{{ 'inbox' | t }}</button>
        <button hlmTabsTrigger="preferences">{{ 'notificationPreferences' | t }}</button>
      </hlm-tabs-list>
    </hlm-tabs>
    <router-outlet />
  `,
})
export class NotificationCentrePage {
  private readonly router = inject(Router);
  readonly tab = signal<'inbox' | 'preferences'>('inbox');

  constructor() {
    this.syncTab();
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.syncTab());
  }

  select(value: unknown) {
    if (value === 'inbox') void this.router.navigateByUrl('/notifications');
    if (value === 'preferences') void this.router.navigateByUrl('/notifications/preferences');
  }

  private syncTab() {
    this.tab.set(
      this.router.url.split(/[?#]/, 1)[0] === '/notifications/preferences'
        ? 'preferences'
        : 'inbox',
    );
  }
}

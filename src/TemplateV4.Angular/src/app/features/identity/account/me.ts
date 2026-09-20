import { Component, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BrnTabs } from '@spartan-ng/brain/tabs';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { filter } from 'rxjs';
import { CustomerInfo } from '../../../api/models';
import { Translate } from '../../../core/i18n';
import { WorkspaceApi } from '../../../core/workspace-api';
import { ProfileSummaryCard } from '../../../shared/profile-summary-card';
import { PageHeader, Resource } from '../../../shared/workspace';
import { CurrentProfile } from './current-profile';

type MeSection = 'profile' | 'security' | 'sessions' | 'action-items' | 'notifications' | 'privacy';

@Component({
  selector: 'app-me',
  imports: [PageHeader, ProfileSummaryCard, RouterOutlet, HlmTabsImports, Translate],
  template: `
    <div class="grid gap-6">
      <div>
        <app-page-header [title]="header().title" [description]="header().description" />
        <app-profile-summary-card [profile]="profile()" [organisation]="organisation.value()" />
      </div>
      <nav class="min-w-0 overflow-x-auto overflow-y-hidden" [attr.aria-label]="'account' | t">
        <hlm-tabs [tab]="section()" (tabActivated)="selectSection($event)">
          <hlm-tabs-list class="justify-start">
            <button hlmTabsTrigger="profile">{{ 'accountMenuProfile' | t }}</button>
            <button hlmTabsTrigger="security">{{ 'security' | t }}</button>
            <button hlmTabsTrigger="sessions">{{ 'accountMenuSessions' | t }}</button>
            <button hlmTabsTrigger="action-items">{{ 'actionItems' | t }}</button>
            <button hlmTabsTrigger="notifications">{{ 'notificationCentre' | t }}</button>
            <button hlmTabsTrigger="privacy">{{ 'privacyAndData' | t }}</button>
          </hlm-tabs-list>
        </hlm-tabs>
      </nav>
      <router-outlet class="contents" />
    </div>
  `,
})
export class MePage {
  private readonly api = inject(WorkspaceApi);
  private readonly currentProfile = inject(CurrentProfile);
  private readonly router = inject(Router);
  readonly profile = this.currentProfile.value;
  readonly organisation = new Resource<CustomerInfo>();
  readonly header = signal({ title: 'account', description: 'accountIntro' });
  readonly section = signal<MeSection>('profile');
  private readonly tabs = viewChild.required(BrnTabs);

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.updatePage());
    void this.organisation.load((signal) => this.api.get('organisation', {}, signal));
  }

  selectSection(section: string) {
    this.tabs().setActiveTab(this.section());
    if (this.isSection(section)) void this.router.navigateByUrl(`/me/${section}`);
  }

  private updatePage() {
    let route: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let title = 'account';
    let description = 'accountIntro';
    while (route) {
      title = route.data['pageTitle'] ?? title;
      description = route.data['pageDescription'] ?? description;
      route = route.firstChild;
    }
    this.header.set({ title, description });
    const section = this.router.url.split(/[?#]/, 1)[0].split('/')[2];
    if (this.isSection(section)) this.section.set(section);
  }

  private isSection(value: string | undefined): value is MeSection {
    return (
      value === 'profile' ||
      value === 'security' ||
      value === 'sessions' ||
      value === 'action-items' ||
      value === 'notifications' ||
      value === 'privacy'
    );
  }
}

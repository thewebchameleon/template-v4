import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../core/auth';
import { Features } from '../core/features';
import { UnreadNotifications } from '../core/unread-notifications';
import { AdministrationNavigation } from '../core/administration';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { Translate } from '../core/i18n';
import { PageHeader } from '../shared/workspace';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, HlmCardImports, HlmButtonImports, Translate, PageHeader],
  template: `
    <app-page-header eyebrow="workspace" title="dashboard" description="dashboardActionsHelp" />
    <div class="grid gap-6 md:grid-cols-2">
      <section hlmCard>
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'account' | t }}</h2>
          <p hlmCardDescription>{{ 'dashboardAccountHelp' | t }}</p>
        </div>
        <div hlmCardContent class="flex flex-wrap gap-2">
          <a hlmBtn routerLink="/me">{{ 'account' | t }}</a>
          <a hlmBtn variant="outline" routerLink="/security">{{ 'security' | t }}</a>
        </div>
      </section>
      <section hlmCard>
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'notificationCentre' | t }}</h2>
          <p hlmCardDescription>{{ 'dashboardUnread' | t }}: {{ unread.count() }}</p>
        </div>
        <div hlmCardContent>
          <a hlmBtn variant="outline" routerLink="/notifications">{{ 'inbox' | t }}</a>
        </div>
      </section>
      @for (action of actions(); track action.path) {
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle>{{ action.label | t }}</h2>
            <p hlmCardDescription>{{ action.help | t }}</p>
          </div>
          <div hlmCardContent>
            <a hlmBtn variant="outline" [routerLink]="action.path">{{ action.label | t }}</a>
          </div>
        </section>
      }
    </div>
  `,
})
export class DashboardPage {
  readonly auth = inject(Auth);
  readonly features = inject(Features);
  readonly unread = inject(UnreadNotifications);
  readonly administration = inject(AdministrationNavigation);
  readonly actions = computed(() => [
    ...(this.features.enabled('files')
      ? [{ path: '/files', label: 'files', help: 'dashboardFilesHelp' }]
      : []),
    ...(this.features.moduleEnabled('organizations')
      ? [{ path: '/organizations', label: 'organizations', help: 'dashboardTeamsHelp' }]
      : []),
    ...(this.features.moduleEnabled('support')
      ? [{ path: '/support', label: 'support', help: 'dashboardSupportHelp' }]
      : []),
    ...(this.administration.links().length
      ? [{ path: '/administration', label: 'administration', help: 'dashboardAdministrationHelp' }]
      : []),
  ]);
}

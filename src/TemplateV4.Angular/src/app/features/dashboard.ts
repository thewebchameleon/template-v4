import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideChartColumn,
  lucideCheckCheck,
  lucideClock3,
  lucideFolderOpen,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { Translate } from '../core/i18n';
import { PageHeader } from '../shared/workspace';

@Component({
  selector: 'app-dashboard',
  imports: [NgIcon, HlmCardImports, HlmBadgeImports, HlmEmptyImports, Translate, PageHeader],
  providers: [
    provideIcons({
      lucideActivity,
      lucideChartColumn,
      lucideCheckCheck,
      lucideClock3,
      lucideFolderOpen,
    }),
  ],
  template: `
    <app-page-header eyebrow="workspace" title="dashboard" description="dashboardIntro">
      <span hlmBadge variant="secondary">{{ 'dashboardPlaceholder' | t }}</span>
    </app-page-header>

    <div class="workspace-stats">
      @for (stat of stats; track stat.label) {
        <section hlmCard>
          <div hlmCardHeader>
            <h2 hlmCardTitle class="flex items-center gap-2">
              <ng-icon [name]="stat.icon" aria-hidden="true" />
              {{ stat.label | t }}
            </h2>
          </div>
          <div hlmCardContent>
            <p class="workspace-stat-value" aria-hidden="true">—</p>
            <p class="workspace-stat-note">{{ 'dashboardMetricPlaceholder' | t }}</p>
          </div>
        </section>
      }
    </div>

    <div class="workspace-columns">
      <section hlmCard>
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'dashboardOverview' | t }}</h2>
          <p hlmCardDescription>{{ 'dashboardOverviewHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <div hlmEmpty class="min-h-64">
            <div hlmEmptyHeader>
              <div hlmEmptyMedia variant="icon">
                <ng-icon name="lucideChartColumn" aria-hidden="true" />
              </div>
              <p hlmEmptyTitle>{{ 'dashboardChartPlaceholder' | t }}</p>
              <p hlmEmptyDescription>{{ 'dashboardChartHelp' | t }}</p>
            </div>
          </div>
        </div>
      </section>
      <section hlmCard>
        <div hlmCardHeader>
          <h2 hlmCardTitle>{{ 'dashboardRecentActivity' | t }}</h2>
          <p hlmCardDescription>{{ 'dashboardRecentActivityHelp' | t }}</p>
        </div>
        <div hlmCardContent>
          <div hlmEmpty class="min-h-64">
            <div hlmEmptyHeader>
              <div hlmEmptyMedia variant="icon">
                <ng-icon name="lucideActivity" aria-hidden="true" />
              </div>
              <p hlmEmptyTitle>{{ 'dashboardActivityPlaceholder' | t }}</p>
              <p hlmEmptyDescription>{{ 'dashboardActivityHelp' | t }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class DashboardPage {
  readonly stats = [
    { label: 'dashboardProjects', icon: 'lucideFolderOpen' },
    { label: 'dashboardInProgress', icon: 'lucideActivity' },
    { label: 'dashboardCompleted', icon: 'lucideCheckCheck' },
    { label: 'dashboardUpcoming', icon: 'lucideClock3' },
  ];
}

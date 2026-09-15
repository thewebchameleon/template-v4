import { Component, OnInit, inject } from '@angular/core';
import { I18n } from '../../core/i18n';
import { WorkspaceUi, Resource } from '../../shared/workspace';
import { WorkspaceApi } from '../../core/workspace-api';
import { UpdateSummary } from '../../api/models';

@Component({
  selector: 'app-updates',
  imports: [WorkspaceUi],
  template: `
    <app-page-header title="releaseUpdates" description="releaseUpdatesHelp" />
    <app-page-state
      [state]="data.state()"
      [refreshing]="data.refreshing()"
      [refreshError]="data.refreshError()"
      (retry)="reload()"
    >
      @if (data.value(); as summary) {
        <div class="grid gap-4">
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'releaseCheckStatus' | t }}</h2>
              <p hlmCardDescription>{{ 'releaseManualDeployment' | t }}</p>
            </div>
            <div hlmCardContent class="grid gap-3" aria-live="polite">
              <p>{{ 'releaseFeed_' + summary.status | t }}</p>
              @if (summary.succeededAt) {
                <p>{{ 'releaseLastChecked' | t }}: {{ i18n.date(summary.succeededAt) }}</p>
              }
              <button
                hlmBtn
                variant="outline"
                type="button"
                [disabled]="data.refreshing()"
                (click)="reload()"
              >
                {{ 'refresh' | t }}
              </button>
            </div>
          </section>
          @for (component of summary.components; track component.id) {
            <section hlmCard>
              <div hlmCardHeader>
                <h2 hlmCardTitle>
                  {{
                    component.id === 'foundation' ? ('releaseFoundation' | t) : (component.id | t)
                  }}
                </h2>
                <p hlmCardDescription>
                  {{ 'releaseInstalled' | t }}: {{ component.installedVersion }}
                </p>
              </div>
              <div hlmCardContent class="grid gap-3">
                @if (summary.enabled && summary.succeededAt) {
                  <span hlmBadge variant="secondary">{{
                    'releaseComponent_' + component.status | t
                  }}</span>
                }
                @if (component.availableVersion) {
                  <p>{{ 'releaseAvailable' | t }}: {{ component.availableVersion }}</p>
                  @if (component.breaking) {
                    <div hlmAlert>
                      <h3 hlmAlertTitle>{{ 'releaseBreaking' | t }}</h3>
                      <p hlmAlertDescription>{{ 'releaseBreakingHelp' | t }}</p>
                    </div>
                  }
                  @if (component.requirements.length) {
                    <div hlmAlert>
                      <h3 hlmAlertTitle>{{ 'releaseRequirements' | t }}</h3>
                      <div hlmAlertDescription>
                        <ul>
                          @for (requirement of component.requirements; track requirement) {
                            <li>{{ requirement }}</li>
                          }
                        </ul>
                      </div>
                    </div>
                  }
                  @if (component.migrationNotes) {
                    <h3 class="font-semibold">{{ 'releaseMigrationNotes' | t }}</h3>
                    <p class="whitespace-pre-wrap break-words">{{ component.migrationNotes }}</p>
                  }
                  @if (component.notesUrl) {
                    <a
                      hlmBtn
                      variant="link"
                      [href]="component.notesUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      >{{ 'releaseNotes' | t }}</a
                    >
                  }
                }
              </div>
            </section>
          }
        </div>
      }
    </app-page-state>
  `,
})
export class UpdatesPage implements OnInit {
  readonly i18n = inject(I18n);
  private readonly api = inject(WorkspaceApi);
  readonly data = new Resource<UpdateSummary>();
  ngOnInit() {
    void this.reload();
  }
  reload() {
    return this.data.load((signal) => this.api.get<UpdateSummary>('updates', {}, signal));
  }
}

import { Component, OnInit, inject } from '@angular/core';

import { UpdateSummary } from '../../api/models';
import { I18n } from '../../core/i18n';
import { WorkspaceApi } from '../../core/workspace-api';
import { Resource, WorkspaceUi } from '../../shared/workspace';

@Component({
  selector: 'app-deployment-health',
  imports: [WorkspaceUi],
  template: `
    <section id="deployment-health" hlmCard class="mb-6 scroll-mt-6">
      <div hlmCardHeader>
        <h2 hlmCardTitle>{{ 'deploymentHealth' | t }}</h2>
        <p hlmCardDescription>{{ 'deploymentHealthHelp' | t }}</p>
      </div>

      <div hlmCardContent>
        <app-page-state
          [state]="data.state()"
          [refreshing]="data.refreshing()"
          [refreshError]="data.refreshError()"
          (retry)="reload()"
        >
          @if (data.value(); as summary) {
            <div class="grid gap-4" aria-live="polite">
              <div class="grid gap-1 text-sm">
                <p>{{ 'releaseFeed_' + summary.status | t }}</p>
                @if (summary.succeededAt) {
                  <p class="text-muted-foreground">
                    {{ 'releaseLastChecked' | t }}: {{ i18n.date(summary.succeededAt) }}
                  </p>
                }
                <p class="text-muted-foreground">{{ 'releaseManualDeployment' | t }}</p>
              </div>

              <div class="divide-y rounded-md border">
                @for (component of summary.components; track component.id) {
                  <article class="grid gap-3 p-4">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div class="grid gap-1">
                        <h3 class="font-semibold">
                          {{
                            component.id === 'foundation'
                              ? ('releaseFoundation' | t)
                              : (component.id | t)
                          }}
                        </h3>
                        <p class="text-sm text-muted-foreground">
                          {{ 'releaseInstalled' | t }}: {{ component.installedVersion }}
                        </p>
                      </div>

                      @if (summary.enabled && summary.succeededAt) {
                        <span hlmBadge variant="secondary">{{
                          'releaseComponent_' + component.status | t
                        }}</span>
                      }
                    </div>

                    @if (component.availableVersion) {
                      <p>{{ 'releaseAvailable' | t }}: {{ component.availableVersion }}</p>

                      @if (component.breaking) {
                        <div hlmAlert>
                          <h4 hlmAlertTitle>{{ 'releaseBreaking' | t }}</h4>
                          <p hlmAlertDescription>{{ 'releaseBreakingHelp' | t }}</p>
                        </div>
                      }

                      @if (component.requirements.length) {
                        <div hlmAlert>
                          <h4 hlmAlertTitle>{{ 'releaseRequirements' | t }}</h4>
                          <div hlmAlertDescription>
                            <ul class="list-disc pl-5">
                              @for (requirement of component.requirements; track requirement) {
                                <li>
                                  {{
                                    requirement === 'license.update-required'
                                      ? ('releaseLicenseRequired' | t)
                                      : requirement
                                  }}
                                </li>
                              }
                            </ul>
                          </div>
                        </div>
                      }

                      @if (component.migrationNotes) {
                        <div class="grid gap-1">
                          <h4 class="font-semibold">{{ 'releaseMigrationNotes' | t }}</h4>
                          <p class="whitespace-pre-wrap break-words">
                            {{ component.migrationNotes }}
                          </p>
                        </div>
                      }

                      @if (component.notesUrl) {
                        <a
                          hlmBtn
                          variant="link"
                          class="justify-self-start"
                          [href]="component.notesUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          >{{ 'releaseNotes' | t }}</a
                        >
                      }
                    }
                  </article>
                }
              </div>
            </div>
          }
        </app-page-state>
      </div>
    </section>
  `,
})
export class DeploymentHealth implements OnInit {
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

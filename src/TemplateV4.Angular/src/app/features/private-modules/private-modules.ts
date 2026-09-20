import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlatformAppearanceTheme } from '../../core/platform-appearance';
import { WorkspaceApi } from '../../core/workspace-api';
import { WorkspaceUi, Resource, workspaceIcons } from '../../shared/workspace';
import { BusinessSelect } from '../../shared/business-select';

interface RegistrationStatus {
  configured: boolean;
  serviceUrl?: string;
  appId?: string;
  environmentId?: string;
  environment: string;
  installedModules: { id: string; version: string }[];
}

interface RegistrationResult {
  environmentVariables: string[];
}

@Component({
  selector: 'app-private-modules',
  imports: [WorkspaceUi, FormsModule, BusinessSelect],
  providers: [workspaceIcons],
  template: `
    <app-page-header
      eyebrow="administration"
      title="privateModules"
      description="privateModulesIntro"
    />

    @if (registration(); as result) {
      <section hlmAlert class="mb-6" aria-live="polite">
        <h2 hlmAlertTitle>{{ 'privateModuleInstallConfig' | t }}</h2>
        <p hlmAlertDescription>{{ 'privateModuleInstallConfigHelp' | t }}</p>
        <pre class="mt-3 overflow-auto rounded-md bg-muted p-3 text-sm select-all">{{
          result.environmentVariables.join(
            '
'
          )
        }}</pre>
        <button hlmBtn type="button" variant="outline" class="mt-3" (click)="copy(result)">
          {{ 'copy' | t }}
        </button>
      </section>
    }

    <app-page-state
      [state]="status.state()"
      [refreshError]="status.refreshError()"
      (retry)="load()"
    >
      @if (status.value(); as value) {
        <div class="workspace-columns">
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>
                {{ (value.configured ? 'privateModuleConfigured' : 'privateModuleRegister') | t }}
              </h2>
              <p hlmCardDescription>
                {{
                  (value.configured ? 'privateModuleConfiguredHelp' : 'privateModuleRegisterHelp')
                    | t
                }}
              </p>
            </div>
            @if (!value.configured) {
              <form hlmCardContent class="grid gap-4" (ngSubmit)="register()">
                <div class="grid items-start gap-4 sm:grid-cols-3">
                  <div hlmField>
                    <label hlmFieldLabel for="private-module-name">{{
                      'privateModuleAppName' | t
                    }}</label>
                    <input
                      hlmInput
                      id="private-module-name"
                      name="name"
                      [value]="name()"
                      readonly
                    />
                    @if (!name()) {
                      <p hlmFieldDescription>
                        <a hlmBtn variant="link" size="text" routerLink="/administration/branding">
                          {{ 'privateModuleUpdateBranding' | t }}
                        </a>
                      </p>
                    }
                  </div>
                  <div hlmField>
                    <label hlmFieldLabel for="private-module-url">{{
                      'privateModuleUrl' | t
                    }}</label>
                    <input
                      hlmInput
                      id="private-module-url"
                      name="url"
                      type="url"
                      [(ngModel)]="url"
                      required
                      maxlength="1500"
                    />
                  </div>
                  <app-business-select
                    controlId="private-module-environment"
                    label="privateModuleEnvironment"
                    [options]="environments"
                    [(value)]="environment"
                    [allowEmpty]="false"
                  />
                </div>
                @if (failed()) {
                  <p class="text-destructive" role="alert">
                    {{ 'privateModuleRegistrationFailed' | t }}
                  </p>
                }
                <button hlmBtn type="submit" [disabled]="busy() || !name() || !url">
                  {{ 'privateModuleRegister' | t }}
                </button>
              </form>
            } @else {
              <div hlmCardContent class="grid gap-2 text-sm">
                <p>
                  <strong>{{ 'privateModuleEnvironment' | t }}:</strong> {{ value.environment | t }}
                </p>
                <p class="break-all"><strong>App ID:</strong> {{ value.appId }}</p>
                <p class="break-all"><strong>Environment ID:</strong> {{ value.environmentId }}</p>
              </div>
            }
          </section>
          <section hlmCard>
            <div hlmCardHeader>
              <h2 hlmCardTitle>{{ 'privateModuleInstalled' | t }}</h2>
            </div>
            <div hlmCardContent>
              @if (value.installedModules.length) {
                <ul class="grid gap-2">
                  @for (module of value.installedModules; track module.id) {
                    <li>
                      {{ module.id }}
                      <span class="text-muted-foreground">{{ module.version }}</span>
                    </li>
                  }
                </ul>
              } @else {
                <p class="text-muted-foreground">{{ 'privateModuleNone' | t }}</p>
              }
            </div>
          </section>
        </div>
      }
    </app-page-state>
  `,
})
export class PrivateModulesPage {
  readonly api = inject(WorkspaceApi);
  readonly status = new Resource<RegistrationStatus>();
  readonly busy = signal(false);
  readonly failed = signal(false);
  readonly registration = signal<RegistrationResult | null>(null);
  readonly appearance = inject(PlatformAppearanceTheme);
  readonly name = computed(() => this.appearance.organisationName().trim());
  environment = 'production';
  readonly environments = [
    { id: 'development', label: 'development' },
    { id: 'staging', label: 'staging' },
    { id: 'production', label: 'production' },
  ];
  url = window.location.origin;
  constructor() {
    void this.load();
  }
  load() {
    return this.status.load((signal) =>
      this.api.get<RegistrationStatus>('private-modules', {}, signal),
    );
  }
  async register() {
    if (this.busy()) return;
    this.busy.set(true);
    this.failed.set(false);
    this.registration.set(null);
    try {
      this.registration.set(
        await this.api.post<RegistrationResult>('private-modules/register', {
          name: this.name(),
          environment: this.environment,
          url: this.url,
        }),
      );
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
  copy(value: RegistrationResult) {
    return navigator.clipboard.writeText(value.environmentVariables.join('\n'));
  }
}

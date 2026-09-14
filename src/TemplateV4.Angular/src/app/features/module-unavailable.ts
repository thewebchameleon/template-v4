import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Features } from '../core/features';
import { WorkspaceUi } from '../shared/workspace';

@Component({
  selector: 'app-module-unavailable',
  imports: [WorkspaceUi],
  template: `<app-page-header
      [title]="failed() ? 'capabilityLoadFailed' : 'capabilityUnavailable'"
      description="capabilityLoadHelp"
    />
    <div hlmAlert>
      <p hlmAlertDescription>{{ 'capabilityLoadHelp' | t }}</p>
    </div>
    <div class="mt-4 flex gap-3">
      <button hlmBtn [disabled]="busy()" (click)="retry()">{{ 'retry' | t }}</button>
      <a hlmBtn variant="outline" routerLink="/dashboard">{{ 'dashboard' | t }}</a>
    </div>`,
})
export class ModuleUnavailablePage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly features = inject(Features);
  readonly busy = signal(false);
  readonly failed = signal(this.route.snapshot.queryParamMap.get('reason') === 'error');
  async retry() {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.features.load();
      this.failed.set(this.features.state() === 'error');
      if (this.failed()) return;
      const requested = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
      const safe =
        requested.startsWith('/') &&
        !requested.startsWith('//') &&
        !requested.includes('\\') &&
        !requested.startsWith('/module-unavailable');
      await this.router.navigateByUrl(safe ? requested : '/dashboard');
    } finally {
      this.busy.set(false);
    }
  }
}

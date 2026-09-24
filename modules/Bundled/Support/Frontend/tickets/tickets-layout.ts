import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { Auth } from '../../../../../src/TemplateV4.Angular/src/app/core/auth';
import { ListQuery, WorkspaceUi } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';

@Component({
  selector: 'app-support-tickets-layout',
  imports: [RouterOutlet, WorkspaceUi],
  template: `@if (auth.has('support.agent') || auth.has('support.admin')) {
    <hlm-tabs
      class="mb-6"
      [tab]="selectedTab()"
      (tabActivated)="selectTab($event)"
    >
      <hlm-tabs-list [attr.aria-label]="'supportView' | t">
        <button hlmTabsTrigger="false">{{ 'supportMine' | t }}</button>
        <button hlmTabsTrigger="true">{{ 'supportQueue' | t }}</button>
      </hlm-tabs-list>
    </hlm-tabs>
  }
  <router-outlet />`,
})
export class SupportTicketsLayout {
  readonly auth = inject(Auth);
  readonly query = new ListQuery();
  private readonly router = inject(Router);
  private readonly rememberedTab = signal(sessionStorage.getItem('support.tickets.tab') === 'true' ? 'true' : 'false');
  readonly selectedTab = computed(() => this.query.text('queue', this.rememberedTab()));

  constructor() {
    effect(() => {
      const queue = this.query.text('queue');
      if (queue === 'true' || queue === 'false') {
        this.rememberedTab.set(queue);
        sessionStorage.setItem('support.tickets.tab', queue);
      }
    });
  }

  selectTab(queue: string) {
    void this.router.navigate(['/support/tickets'], {
      queryParams: { queue, page: 1 },
      queryParamsHandling: 'merge',
    });
  }
}

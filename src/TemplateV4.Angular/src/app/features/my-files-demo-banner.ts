import { Component, input } from '@angular/core';
import { WorkspaceUi } from '../shared/workspace';

@Component({
  selector: 'app-my-files-demo-banner',
  imports: [WorkspaceUi],
  template: `@if (enabled()) {
    <div
      hlmAlert
      class="mb-4 border-[color-mix(in_oklch,var(--warning),transparent_65%)] bg-[color-mix(in_oklch,var(--toast-warning-background),transparent_25%)] text-[var(--toast-warning-foreground)]"
      role="status"
    >
      <ng-icon
        name="lucideTriangleAlert"
        class="text-[var(--warning)]"
        size="20"
        aria-hidden="true"
      />
      <p hlmAlertDescription class="text-current">
        @if (minutes() === 60) {
          {{ 'myFilesDemoBannerHour' | t }}
        } @else {
          {{ 'myFilesDemoBannerStart' | t }} {{ minutes() }} {{ 'myFilesDemoBannerEnd' | t }}
        }
        {{ 'myFilesDemoFolderHelp' | t }}
      </p>
    </div>
  }`,
})
export class MyFilesDemoBanner {
  readonly enabled = input(false);
  readonly minutes = input(60);
}

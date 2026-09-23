import { Component, input } from '@angular/core';
import { WorkspaceUi } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';

@Component({
  selector: 'app-file-storage-demo-banner',
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
          {{ 'fileStorageDemoBannerHour' | t }}
        } @else {
          {{ 'fileStorageDemoBannerStart' | t }} {{ minutes() }}
          {{ 'fileStorageDemoBannerEnd' | t }}
        }
        {{ 'fileStorageDemoFolderHelp' | t }}
      </p>
    </div>
  }`,
})
export class FileStorageDemoBanner {
  readonly enabled = input(false);
  readonly minutes = input(60);
}

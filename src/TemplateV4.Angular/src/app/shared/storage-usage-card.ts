import { Component, computed, inject, input, output } from '@angular/core';
import { FilePage } from '../api/models';
import { I18n } from '../core/i18n';
import { WorkspaceUi } from './workspace';

@Component({
  selector: 'app-storage-usage-card',
  imports: [WorkspaceUi],
  host: { class: 'block min-w-0' },
  template: `<section hlmCard>
    <div hlmCardHeader>
      <h2 hlmCardTitle>{{ 'storageUsage' | t }}</h2>
      <p hlmCardDescription>{{ 'storageUsageHelp' | t }}</p>
    </div>
    <div hlmCardContent>
      @if (usage(); as value) {
        <p class="font-medium mb-3">
          {{ bytes(value.usedBytes) }} /
          {{ value.quotaBytes === -1 ? ('maxUploadNoLimit' | t) : bytes(value.quotaBytes) }}
        </p>
        <div
          class="file-storage-quota"
          [class.file-storage-quota-danger]="quotaReached(value)"
          role="img"
          [attr.aria-label]="
            ('storageUsage' | t) +
            ': ' +
            bytes(value.usedBytes) +
            ' / ' +
            (value.quotaBytes === -1 ? ('maxUploadNoLimit' | t) : bytes(value.quotaBytes))
          "
        >
          @for (segment of usageSegments(); track segment.category) {
            <span
              [attr.data-category]="segment.category"
              [style.width.%]="
                (100 * segment.bytes) /
                Math.max(value.usedBytes, value.quotaBytes > 0 ? value.quotaBytes : 0, 1)
              "
              [title]="('fileType.' + segment.category | t) + ': ' + bytes(segment.bytes)"
            ></span>
          }
        </div>
        <ul class="file-storage-quota-legend">
          @for (segment of usageSegments(); track segment.category) {
            <li>
              <span class="file-storage-swatch" [attr.data-category]="segment.category"></span
              ><span>{{ 'fileType.' + segment.category | t }}</span
              ><strong>{{ bytes(segment.bytes) }}</strong>
            </li>
          }
          <li>
            <span class="file-storage-swatch" data-category="remaining"></span
            ><span>{{ 'remainingStorage' | t }}</span
            ><strong>{{
              value.quotaBytes === -1
                ? ('maxUploadNoLimit' | t)
                : bytes(Math.max(0, value.quotaBytes - value.usedBytes))
            }}</strong>
          </li>
        </ul>
      }
      @if (usage(); as value) {
        @if (showQuotaAlert() && quotaReached(value)) {
          <div hlmAlert class="mt-4" role="status">
            <h3 hlmAlertTitle>{{ 'quotaReached' | t }}</h3>
            <p hlmAlertDescription>{{ 'quotaReachedHelp' | t }}</p>
          </div>
        }
      }
      <p class="workspace-meta mt-4">{{ 'fileStorageRetentionHelp' | t }}</p>
      <div class="mt-3 flex items-center justify-between gap-4">
        <a routerLink="/privacy" class="workspace-link text-sm">{{ 'privacyAndData' | t }}</a>
        @if (allowEmptyTrash()) {
          <button
            hlmBtn
            type="button"
            variant="link"
            class="h-auto p-0 text-sm text-destructive"
            [disabled]="emptyTrashBusy()"
            (click)="emptyTrash.emit()"
          >
            {{ 'emptyTrash' | t }}
          </button>
        }
      </div>
    </div>
  </section>`,
})
export class StorageUsageCard {
  readonly usage = input<Pick<FilePage, 'usedBytes' | 'quotaBytes' | 'usage'> | null>(null);
  readonly includeTrash = input(false);
  readonly showQuotaAlert = input(true);
  readonly allowEmptyTrash = input(false);
  readonly emptyTrashBusy = input(false);
  readonly emptyTrash = output<void>();
  readonly i18n = inject(I18n);
  readonly Math = Math;
  readonly usageSegments = computed(() => {
    const segments = this.usage()?.usage ?? [];
    return this.includeTrash() && !segments.some((segment) => segment.category === 'trash')
      ? [...segments, { category: 'trash', bytes: 0, count: 0 }]
      : segments;
  });

  quotaReached(value: Pick<FilePage, 'usedBytes' | 'quotaBytes'>) {
    return value.quotaBytes >= 0 && value.usedBytes >= value.quotaBytes;
  }

  bytes(value: number) {
    if (value < 1024) return this.i18n.number(value) + ' B';
    if (value < 1048576) return this.i18n.number(Math.round(value / 1024)) + ' KB';
    return this.i18n.number(Math.round((value / 1048576) * 10) / 10) + ' MB';
  }
}

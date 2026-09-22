import { Component, effect, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { WorkspaceUi } from '../../shared/workspace';
import { WorkspaceApi } from '../../core/workspace-api';
import { I18n } from '../../core/i18n';
import { DashboardCard, DashboardCardData } from '../../api/models';

@Component({
  selector: 'app-dashboard-card',
  imports: [WorkspaceUi],
  template: `
    @if (loading()) {
      <hlm-spinner [attr.aria-label]="'loading' | t" />
    } @else if (failed()) {
      <div hlmAlert>
        <p hlmAlertDescription>{{ 'dashLoadFailed' | t }}</p>
      </div>
    } @else if (data(); as result) {
      @switch (card().format) {
        @case ('metric') {
          <p class="text-4xl font-semibold tracking-tight break-words">
            {{ number(result.value, result.unit) }}
          </p>
        }
        @case ('chart') {
          @if (!result.points.length) {
            <p class="text-muted-foreground">{{ 'dashNoData' | t }}</p>
          }
          <div class="grid gap-3">
            @for (point of result.points; track point.label) {
              <div>
                <div class="flex justify-between gap-3 text-sm">
                  <span>{{ label(point.label) }}</span
                  ><span>{{ number(point.value, result.unit) }}</span>
                </div>
                <div class="bg-muted mt-1 h-3 rounded-full" aria-hidden="true">
                  <div
                    class="bg-primary h-full rounded-full"
                    [style.width.%]="width(point.value)"
                  ></div>
                </div>
              </div>
            }
          </div>
        }
        @case ('list') {
          @if (!result.items.length) {
            <p class="text-muted-foreground">{{ 'dashNoData' | t }}</p>
          }
          <ul class="grid gap-3">
            @for (item of result.items; track $index) {
              <li class="min-w-0">
                <a
                  class="text-sm font-medium underline underline-offset-4 break-words"
                  [routerLink]="item.link"
                  >{{ item.label | t }}</a
                >
                <p class="text-muted-foreground text-sm break-words">{{ label(item.detail) }}</p>
              </li>
            }
          </ul>
          @if (result.value > result.items.length && result.unit === 'count') {
            <p class="text-muted-foreground mt-3 text-sm">
              {{ 'dashTotal' | t }}: {{ i18n.number(result.value) }}
            </p>
          }
        }
      }
    }
  `,
})
export class DashboardCardView {
  readonly card = input.required<DashboardCard>();
  readonly period = input.required<string>();
  readonly refresh = input(0);
  readonly unavailable = output<void>();
  readonly i18n = inject(I18n);
  private readonly api = inject(WorkspaceApi);
  readonly data = signal<DashboardCardData | null>(null);
  readonly loading = signal(true);
  readonly failed = signal(false);
  constructor() {
    effect((cleanup) => {
      const card = this.card();
      const period = card.period === 'inherit' ? this.period() : card.period;
      this.refresh();
      const controller = new AbortController();
      cleanup(() => controller.abort());
      this.data.set(null);
      this.loading.set(true);
      this.failed.set(false);
      void this.api
        .get<DashboardCardData>(
          'dashboards/card',
          {
            definitionId: card.definitionId,
            metric: card.metric,
            filter: card.filter,
            period,
            limit: card.size === 'large' ? 10 : 5,
          },
          controller.signal,
        )
        .then((data) => {
          if (!controller.signal.aborted) this.data.set(data);
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          if (error instanceof HttpErrorResponse && (error.status === 403 || error.status === 404))
            this.unavailable.emit();
          else this.failed.set(true);
        })
        .finally(() => {
          if (!controller.signal.aborted) this.loading.set(false);
        });
    });
  }
  number(value: number, unit: string) {
    return unit === 'ZAR'
      ? this.i18n.currency(value, unit)
      : `${this.i18n.number(value)}${unit === 'count' ? '' : ' ' + unit}`;
  }
  label(value: string) {
    const key = `dashOption_${value}`;
    const translated = this.i18n.text(key);
    return translated === key ? this.i18n.text(value) : translated;
  }
  width(value: number) {
    return (
      (Math.max(0, value) /
        Math.max(1, ...(this.data()?.points.map((p) => Math.abs(p.value)) ?? []))) *
      100
    );
  }
}

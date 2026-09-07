import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowDownToLine,
  lucideArrowLeft,
  lucideArrowUpFromLine,
  lucideBell,
  lucideCheck,
  lucideClock3,
  lucideFile,
  lucideFolderOpen,
  lucideHistory,
  lucideInbox,
  lucideMail,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideShieldCheck,
  lucideActivity,
  lucideTrash2,
  lucideArrowUpRight,
  lucideTriangleAlert,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmAlertImports } from '@spartan-ng/helm/alert';
import { HlmCheckboxImports } from '@spartan-ng/helm/checkbox';
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { I18n, Translate } from '../core/i18n';

export const workspaceIcons = provideIcons({
  lucideArrowDownToLine,
  lucideArrowLeft,
  lucideArrowUpFromLine,
  lucideBell,
  lucideCheck,
  lucideClock3,
  lucideFile,
  lucideFolderOpen,
  lucideHistory,
  lucideInbox,
  lucideMail,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideShieldCheck,
  lucideActivity,
  lucideTrash2,
  lucideArrowUpRight,
  lucideTriangleAlert,
});
export type LoadState = 'loading' | 'ready' | 'error' | 'forbidden';
export class Resource<T> {
  readonly value = signal<T | null>(null);
  readonly state = signal<LoadState>('loading');
  readonly refreshing = signal(false);
  readonly refreshError = signal(false);
  private controller?: AbortController;
  constructor() {
    inject(DestroyRef).onDestroy(() => this.controller?.abort());
  }
  async load(fetch: (signal: AbortSignal) => Promise<T>) {
    this.controller?.abort();
    const controller = (this.controller = new AbortController());
    this.refreshError.set(false);
    this.refreshing.set(this.value() !== null);
    if (this.value() === null) this.state.set('loading');
    try {
      const value = await fetch(controller.signal);
      if (!controller.signal.aborted) {
        this.value.set(value);
        this.state.set('ready');
        return true;
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        if (error instanceof HttpErrorResponse && error.status === 403) {
          this.value.set(null);
          this.state.set('forbidden');
        } else if (this.value() !== null) {
          this.refreshError.set(true);
          this.state.set('ready');
        } else this.state.set('error');
      }
    } finally {
      if (!controller.signal.aborted) this.refreshing.set(false);
    }
    return false;
  }
}
export class ListQuery {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly changes = this.route.queryParamMap.pipe(takeUntilDestroyed());
  connect(load: () => void) {
    this.changes.subscribe(load);
  }
  text(key: string, fallback = '') {
    return this.route.snapshot.queryParamMap.get(key) ?? fallback;
  }
  get page() {
    const n = Number(this.text('page', '1'));
    return Number.isInteger(n) && n > 0 && n <= 10000 ? n : 1;
  }
  direction(fallback: 'asc' | 'desc') {
    const value = this.text('direction', fallback);
    return value === 'asc' || value === 'desc' ? value : fallback;
  }
  clamp(total: number | undefined, size = 25) {
    if (total === undefined) return;
    const page = Math.max(1, Math.ceil(total / size));
    if (this.page > page)
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { page },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
  }
  set(values: Record<string, string | number | null>) {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: values,
      queryParamsHandling: 'merge',
    });
  }
}

export const DATA_TABLE_SEARCH_DEBOUNCE_MS = 300;

export class DebouncedSearch {
  readonly value = signal('');
  private readonly changes = new Subject<string>();

  constructor(
    private readonly query: ListQuery,
    private readonly key = 'search',
  ) {
    this.changes
      .pipe(
        debounceTime(DATA_TABLE_SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        takeUntilDestroyed(),
      )
      .subscribe((value) => {
        if (this.query.text(this.key) !== value)
          void this.query.set({ [this.key]: value || null, page: 1 });
      });
  }

  update(value: string) {
    this.value.set(value);
    this.changes.next(value);
  }

  sync(value: string) {
    this.update(value);
  }
}

@Component({
  selector: 'app-page-header',
  imports: [Translate],
  template: ` <header class="workspace-heading">
    <div class="min-w-0">
      <p class="workspace-eyebrow">{{ eyebrow() | t }}</p>
      <h1 class="page-title">{{ title() | t }}</h1>
      <p class="workspace-description">{{ description() | t }}</p>
    </div>
    <div class="workspace-heading-actions"><ng-content /></div>
  </header>`,
})
export class PageHeader {
  readonly eyebrow = input('workspace');
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}

@Component({
  selector: 'app-page-state',
  imports: [
    Translate,
    RouterLink,
    HlmSkeletonImports,
    HlmButtonImports,
    HlmEmptyImports,
    HlmAlertImports,
  ],
  template: ` @if (state() === 'loading') {
      <div class="workspace-skeleton" role="status" aria-live="polite">
        <span class="sr-only">{{ 'loading' | t }}</span>
        <div hlmSkeleton class="h-12 w-2/3"></div>
        <div hlmSkeleton class="h-48 w-full"></div>
        <div hlmSkeleton class="h-20 w-full"></div>
      </div>
    } @else if (state() === 'forbidden') {
      <div hlmEmpty>
        <div hlmEmptyHeader>
          <h2 hlmEmptyTitle>{{ 'accessRestricted' | t }}</h2>
          <p hlmEmptyDescription>{{ 'accessRestrictedHelp' | t }}</p>
        </div>
        <a hlmBtn variant="outline" routerLink="/me">{{ 'account' | t }}</a>
      </div>
    } @else if (state() === 'error') {
      <div hlmAlert variant="destructive">
        <h2 hlmAlertTitle>{{ 'loadFailed' | t }}</h2>
        <p hlmAlertDescription>{{ 'loadFailedHelp' | t }}</p>
        <button hlmBtn variant="outline" class="mt-4" (click)="retry.emit()">
          {{ 'retry' | t }}
        </button>
      </div>
    } @else {
      @if (refreshing()) {
        <p class="workspace-meta mb-3" role="status">{{ 'refreshing' | t }}</p>
      }
      @if (refreshError()) {
        <div hlmAlert role="alert" class="mb-4">
          <p hlmAlertDescription>{{ 'refreshFailed' | t }}</p>
          <button hlmBtn variant="outline" (click)="retry.emit()">{{ 'retry' | t }}</button>
        </div>
      }
      <ng-content />
    }`,
})
export class PageState {
  readonly refreshing = input(false);
  readonly refreshError = input(false);
  readonly state = input.required<LoadState>();
  readonly retry = output<void>();
}

@Component({
  selector: 'app-list-pager',
  imports: [Translate, HlmButtonImports],
  template: ` <nav class="workspace-pager" [attr.aria-label]="'pagination' | t">
    <span
      >{{ i18n.number(total()) }} {{ 'results' | t }} · {{ 'page' | t }} {{ i18n.number(page()) }} /
      {{ i18n.number(pages()) }}</span
    >
    <div class="flex gap-2">
      <button
        hlmBtn
        variant="outline"
        size="sm"
        [disabled]="page() <= 1 || busy()"
        (click)="pageChange.emit(page() - 1)"
      >
        {{ 'previous' | t }}</button
      ><button
        hlmBtn
        variant="outline"
        size="sm"
        [disabled]="page() >= pages() || busy()"
        (click)="pageChange.emit(page() + 1)"
      >
        {{ 'next' | t }}
      </button>
    </div>
  </nav>`,
})
export class ListPager {
  readonly i18n = inject(I18n);
  readonly total = input(0);
  readonly page = input(1);
  readonly size = input(25);
  readonly busy = input(false);
  readonly pageChange = output<number>();
  pages() {
    return Math.max(1, Math.ceil(this.total() / this.size()));
  }
}

export { Confirmation, Confirmations, unsavedGuard, protectUnload } from './confirmation';

export const WorkspaceUi = [
  PageHeader,
  PageState,
  ListPager,
  Translate,
  FormsModule,
  RouterLink,
  NgIcon,
  HlmButtonImports,
  HlmCardImports,
  HlmBadgeImports,
  HlmFieldImports,
  HlmInputImports,
  HlmEmptyImports,
  HlmAlertImports,
  HlmCheckboxImports,
  HlmSpinnerImports,
  HlmTabsImports,
  HlmSwitchImports,
] as const;

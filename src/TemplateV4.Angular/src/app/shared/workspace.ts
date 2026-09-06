import { Component, inject, input, output, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowDownToLine,
  lucideArrowUpFromLine,
  lucideBell,
  lucideCheck,
  lucideClock3,
  lucideFile,
  lucideFolderOpen,
  lucideHistory,
  lucideInbox,
  lucideMail,
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
import { HlmSpinnerImports } from '@spartan-ng/helm/spinner';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import { HlmSwitchImports } from '@spartan-ng/helm/switch';
import { I18n, Translate } from '../core/i18n';

export const workspaceIcons = provideIcons({
  lucideArrowDownToLine,
  lucideArrowUpFromLine,
  lucideBell,
  lucideCheck,
  lucideClock3,
  lucideFile,
  lucideFolderOpen,
  lucideHistory,
  lucideInbox,
  lucideMail,
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
  private sequence = 0;
  async load(fetch: () => Promise<T>) {
    const sequence = ++this.sequence;
    this.state.set('loading');
    try {
      const value = await fetch();
      if (sequence === this.sequence) {
        this.value.set(value);
        this.state.set('ready');
      }
    } catch (error) {
      if (sequence === this.sequence)
        this.state.set(
          error instanceof HttpErrorResponse && error.status === 403 ? 'forbidden' : 'error',
        );
    }
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
  set(values: Record<string, string | number | null>) {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: values,
      queryParamsHandling: 'merge',
    });
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
        <a hlmBtn variant="outline" routerLink="/profile">{{ 'profile' | t }}</a>
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
      <ng-content />
    }`,
})
export class PageState {
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
  HlmSpinnerImports,
  HlmToggleGroupImports,
  HlmSwitchImports,
] as const;

import { Location } from '@angular/common';
import { Component, computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft } from '@ng-icons/lucide';
import {
  ActivatedRouteSnapshot,
  NavigationEnd,
  NavigationStart,
  PRIMARY_OUTLET,
  Router,
} from '@angular/router';
import { HlmBreadcrumbImports } from '@spartan-ng/helm/breadcrumb';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { classes } from '@spartan-ng/helm/utils';
import { I18n, Translate } from '../core/i18n';

export interface BreadcrumbItem {
  readonly label: string;
  readonly link?: string;
}

export type BreadcrumbLabel =
  string | ((route: ActivatedRouteSnapshot) => string | null | undefined);

interface BreadcrumbHistoryEntry {
  readonly navigationId: number;
  page: BreadcrumbItem;
}

@Injectable({ providedIn: 'root' })
export class Breadcrumbs {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly customItems = signal<readonly BreadcrumbItem[] | null>(null);
  private readonly navigationVersion = signal(0);
  private readonly history: BreadcrumbHistoryEntry[] = [];
  private historyIndex = -1;
  private pendingNavigation: NavigationStart | null = null;

  readonly items = computed(() => {
    this.navigationVersion();
    return this.customItems() ?? this.routeItems(this.router.routerState.snapshot.root);
  });
  readonly previous = signal<BreadcrumbItem | null>(null);

  constructor() {
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.customItems.set(null);
        this.pendingNavigation = event;
      }

      if (event instanceof NavigationEnd) {
        this.navigationVersion.update((value) => value + 1);
        this.recordNavigation(event);
      }
    });
  }

  /** Replaces the route-derived trail until the next navigation starts. */
  set(items: readonly BreadcrumbItem[]) {
    this.customItems.set([...items]);
    this.updateCurrentHistoryPage();
  }

  /** Restores the active route's configured or automatically derived trail. */
  clear() {
    this.customItems.set(null);
    this.updateCurrentHistoryPage();
  }

  back() {
    this.location.back();
  }

  private routeItems(root: ActivatedRouteSnapshot): readonly BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [];
    const url: string[] = [];
    let route: ActivatedRouteSnapshot | undefined = root;

    while ((route = route.children.find((child) => child.outlet === PRIMARY_OUTLET))) {
      const segments = route.url.map((segment) => segment.path);
      url.push(...segments);

      const configured = route.data['breadcrumb'] as BreadcrumbLabel | false | undefined;
      if (configured === false) continue;

      const label =
        typeof configured === 'function'
          ? configured(route)
          : (configured ?? this.humanize(segments.at(-1)));

      if (label) items.push({ label, link: `/${url.join('/')}` });
    }

    return items;
  }

  private humanize(segment: string | undefined): string | null {
    if (!segment) return null;

    return decodeURIComponent(segment)
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  private recordNavigation(event: NavigationEnd) {
    const page = this.items().at(-1);
    if (!page) return;

    const restoredId = this.pendingNavigation?.restoredState?.navigationId;
    const restoredIndex =
      this.pendingNavigation?.navigationTrigger === 'popstate' && restoredId !== undefined
        ? this.history.findIndex((entry) => entry.navigationId === restoredId)
        : -1;

    if (restoredIndex >= 0) {
      this.historyIndex = restoredIndex;
      this.history[this.historyIndex].page = { ...page, link: event.urlAfterRedirects };
    } else {
      this.history.splice(this.historyIndex + 1);
      this.history.push({
        navigationId: event.id,
        page: { ...page, link: event.urlAfterRedirects },
      });
      this.historyIndex = this.history.length - 1;
    }

    this.previous.set(this.history[this.historyIndex - 1]?.page ?? null);
    this.pendingNavigation = null;
  }

  private updateCurrentHistoryPage() {
    const page = this.items().at(-1);
    const current = this.history[this.historyIndex];
    if (page && current) current.page = { ...page, link: this.router.url };
  }
}

@Component({
  selector: 'app-breadcrumbs',
  imports: [HlmBreadcrumbImports, HlmButtonImports, NgIcon, Translate],
  providers: [provideIcons({ lucideArrowLeft })],
  template: `
    <div class="flex min-w-0 items-center justify-between gap-4">
      <nav hlmBreadcrumb [attr.aria-label]="'breadcrumb' | t" class="min-w-0">
        <ol hlmBreadcrumbList class="hidden sm:flex">
          @for (item of breadcrumbs.items(); track $index; let last = $last) {
            @if (!$first) {
              <li hlmBreadcrumbSeparator></li>
            }
            <li hlmBreadcrumbItem>
              @if (last) {
                <span hlmBreadcrumbPage>{{ item.label | t }}</span>
              } @else {
                <a hlmBreadcrumbLink [link]="item.link">{{ item.label | t }}</a>
              }
            </li>
          }
        </ol>

        <ol hlmBreadcrumbList class="flex sm:hidden">
          @if (breadcrumbs.items().length > 1) {
            <li hlmBreadcrumbItem>
              <a hlmBreadcrumbLink [link]="breadcrumbs.items()[0].link">
                {{ breadcrumbs.items()[0].label | t }}
              </a>
            </li>
            <li hlmBreadcrumbSeparator></li>
          }
          @if (breadcrumbs.items().length > 2) {
            <li hlmBreadcrumbItem>
              <hlm-breadcrumb-ellipsis [srOnlyText]="'moreBreadcrumbs' | t" />
            </li>
            <li hlmBreadcrumbSeparator></li>
          }
          @if (breadcrumbs.items().at(-1); as current) {
            <li hlmBreadcrumbItem>
              <span hlmBreadcrumbPage>{{ current.label | t }}</span>
            </li>
          }
        </ol>
      </nav>

      @if (breadcrumbs.previous(); as previous) {
        <button
          hlmBtn
          variant="link"
          size="sm"
          type="button"
          class="min-w-0 shrink-0"
          [attr.aria-label]="backLabel()"
          (click)="breadcrumbs.back()"
        >
          <ng-icon name="lucideArrowLeft" size="1rem" />
          <span class="max-w-48 truncate">{{ 'backTo' | t }} {{ previous.label | t }}</span>
        </button>
      }
    </div>
  `,
})
export class AppBreadcrumbs {
  readonly breadcrumbs = inject(Breadcrumbs);
  private readonly i18n = inject(I18n);

  readonly backLabel = computed(() => {
    const previous = this.breadcrumbs.previous();
    return previous
      ? `${this.i18n.text('backTo')} ${this.i18n.text(previous.label)}`
      : this.i18n.text('back');
  });

  constructor() {
    classes(() => 'min-w-0 flex-1');
  }
}

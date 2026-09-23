import { Component, Injectable, effect, inject, signal, untracked } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideSettings } from '@ng-icons/lucide';
import { HlmSidebarImports, HlmSidebarService } from '@spartan-ng/helm/sidebar';
import { Auth } from '../../../../../src/TemplateV4.Angular/src/app/core/auth';
import { Translate } from '../../../../../src/TemplateV4.Angular/src/app/core/i18n';
import { WorkspaceApi } from '../../../../../src/TemplateV4.Angular/src/app/core/workspace-api';
import { ContentCollection } from '../../../../../src/TemplateV4.Angular/src/app/api/models';
import { Resource } from '../../../../../src/TemplateV4.Angular/src/app/shared/workspace';
import { SidebarSelectionIndicator } from '../../../../../src/TemplateV4.Angular/src/app/shared/sidebar-selection-indicator';

@Injectable({ providedIn: 'root' })
export class CmsCollectionNavigationState {
  readonly revision = signal(0);

  refresh(): void {
    this.revision.update((value) => value + 1);
  }
}

@Component({
  selector: 'app-cms-collection-navigation',
  imports: [
    RouterLink,
    RouterLinkActive,
    NgIcon,
    HlmSidebarImports,
    Translate,
    SidebarSelectionIndicator,
  ],
  providers: [provideIcons({ lucidePlus, lucideSettings })],
  template: `<nav
    hlmSidebarGroup
    appSidebarSelectionIndicator
    class="sidebar-submenu min-h-0"
    [attr.aria-label]="'cmsCollections' | t"
  >
    <div hlmSidebarGroupLabel>{{ 'cmsCollections' | t }}</div>
    @if (auth.has('cms.schema.manage')) {
      <button
        hlmSidebarGroupAction
        type="button"
        routerLink="/cms/collections/new"
        [attr.aria-label]="'cmsNewCollection' | t"
        (click)="closeMobile()"
      >
        <ng-icon name="lucidePlus" aria-hidden="true" />
      </button>
    }
    <ul hlmSidebarMenu>
      @for (collection of data.value(); track collection.key) {
        <li hlmSidebarMenuItem>
          @if (canRead(collection)) {
            <a
              hlmSidebarMenuButton
              [routerLink]="['/cms/collections', collection.key]"
              routerLinkActive
              #active="routerLinkActive"
              [isActive]="active.isActive"
              ariaCurrentWhenActive="page"
              closeMobileSidebarOnClick
            >
              <span>{{ collection.label }}</span>
            </a>
          } @else {
            <span class="flex h-8 min-w-0 items-center truncate px-2 pe-8 text-sm">{{ collection.label }}</span>
          }
          @if (canManage(collection)) {
            <button
              hlmSidebarMenuAction
              type="button"
              [routerLink]="['/cms/collections', collection.key, 'settings']"
              [attr.aria-label]="('cmsSchema' | t) + ': ' + collection.label"
              (click)="closeMobile()"
            >
              <ng-icon name="lucideSettings" aria-hidden="true" />
            </button>
          }
        </li>
      }
    </ul>
  </nav>`,
})
export class CmsCollectionNavigation {
  readonly auth = inject(Auth);
  private readonly api = inject(WorkspaceApi);
  private readonly sidebar = inject(HlmSidebarService);
  private readonly navigation = inject(CmsCollectionNavigationState);
  readonly data = new Resource<ContentCollection[]>();

  constructor() {
    effect(() => {
      this.navigation.revision();
      untracked(() => void this.load());
    });
  }

  canRead(collection: ContentCollection): boolean {
    return collection.actions.some((action) => action !== 'cms.schema.manage');
  }

  canManage(collection: ContentCollection): boolean {
    return collection.actions.includes('cms.schema.manage') || this.auth.has('roles.manage');
  }

  closeMobile(): void {
    this.sidebar.setOpenMobile(false);
  }

  load() {
    return this.data.load((signal) => this.api.get('cms/collections', {}, signal));
  }
}

import type { Routes } from '@angular/router';
import { cmsTranslations } from './cms-resolver';
import { destinationGuard, workspaceDestinations } from '../../../../src/TemplateV4.Angular/src/app/core/destinations';
import { authGuard } from '../../../../src/TemplateV4.Angular/src/app/core/auth';
import { unsavedGuard } from '../../../../src/TemplateV4.Angular/src/app/shared/confirmation';
export const routes: Routes = [{
    path: 'cms',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cms' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    loadComponent: () =>
      import('./collections/collections').then((m) => m.ContentCollectionsPage),
  },
{
    path: 'cms/new',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cmsNew' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    canDeactivate: [unsavedGuard],
    loadComponent: () =>
      import('./items/content-editor').then((m) => m.ContentEditorPage),
  },
{
    path: 'cms/sections',
    loadChildren: () =>
      import('./sections/sections-routes').then((m) => m.sectionsRoutes),
  },
{
    path: 'cms/collections/new',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cms' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    canDeactivate: [unsavedGuard],
    loadComponent: () =>
      import('./collections/collection-settings').then(
        (m) => m.ContentCollectionSettingsPage,
      ),
  },
{
    path: 'cms/collections/:key/settings',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cms' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    canDeactivate: [unsavedGuard],
    loadComponent: () =>
      import('./collections/collection-settings').then(
        (m) => m.ContentCollectionSettingsPage,
      ),
  },
{
    path: 'cms/collections/:key/items/new',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cms' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    canDeactivate: [unsavedGuard],
    loadComponent: () =>
      import('./items/content-editor').then((m) => m.ContentEditorPage),
  },
{
    path: 'cms/collections/:key/items/:id',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cms' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    canDeactivate: [unsavedGuard],
    loadComponent: () =>
      import('./items/content-editor').then((m) => m.ContentEditorPage),
  },
{
    path: 'cms/collections/:key',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cms' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    loadComponent: () =>
      import('./items/content-items').then((m) => m.ContentItemsPage),
  },
{
    path: 'cms/:id',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cms' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    canDeactivate: [unsavedGuard],
    loadComponent: () =>
      import('./items/content-editor').then((m) => m.ContentEditorPage),
  }];
export const administrationRoutes: Routes = [];

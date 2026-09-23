import type { Routes } from '@angular/router';
import { destinationGuard, workspaceDestinations, administrationDestinations } from '../../../../src/TemplateV4.Angular/src/app/core/destinations';
import { moduleSettingsTranslations } from '../../../../src/TemplateV4.Angular/src/app/features/modules/module-settings-resolver';
import { supportTranslations } from './support-resolver';
import { authGuard, permissionGuard } from '../../../../src/TemplateV4.Angular/src/app/core/auth';
import { unsavedGuard } from '../../../../src/TemplateV4.Angular/src/app/shared/confirmation';
export const routes: Routes = [{
    path: 'support',
    resolve: { supportTranslations },
    runGuardsAndResolvers: 'always',
    data: { breadcrumb: 'support' },
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tickets',
      },
      {
        path: 'tickets',
        data: { breadcrumb: 'supportTickets' },
        canActivate: [destinationGuard(workspaceDestinations.support)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./tickets/support').then((m) => m.SupportPage),
      },
      {
        path: 'tickets/new',
        data: { breadcrumb: 'supportNew' },
        canActivate: [destinationGuard(workspaceDestinations.support)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./tickets/create/support-new').then((m) => m.SupportNewPage),
      },
      {
        path: 'tickets/categories',
        data: { breadcrumb: 'supportCategories', permission: 'support.admin' },
        canActivate: [destinationGuard(workspaceDestinations.support), permissionGuard],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./categories/support-categories').then(
            (m) => m.SupportCategoriesPage,
          ),
      },
      {
        path: 'tickets/:id',
        data: { breadcrumb: 'supportTicketDetails' },
        canActivate: [destinationGuard(workspaceDestinations.support)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./tickets/detail/support-detail').then(
            (m) => m.SupportDetailPage,
          ),
      },
      {
        path: 'contact',
        data: { breadcrumb: false },
        loadChildren: () =>
          import('./enquiries/contact-routes').then((m) => m.contactRoutes),
      },
      {
        path: 'settings',
        data: { breadcrumb: 'support' },
        resolve: { moduleSettingsTranslations },
        canActivate: [destinationGuard(administrationDestinations.supportSettings)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./configuration/support-settings').then(
            (m) => m.SupportSettingsPage,
          ),
      },
      { path: 'new', pathMatch: 'full', redirectTo: 'tickets/new' },
      { path: 'categories', pathMatch: 'full', redirectTo: 'tickets/categories' },
      { path: ':id', redirectTo: 'tickets/:id' },
    ],
  }];
export const administrationRoutes: Routes = [];

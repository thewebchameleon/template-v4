import type { Routes } from '@angular/router';
import { businessTranslations } from '../../../../src/TemplateV4.Angular/src/app/core/business-translations';
import { capabilityGuard } from '../../../../src/TemplateV4.Angular/src/app/core/features';
import { destinationGuard, administrationDestinations } from '../../../../src/TemplateV4.Angular/src/app/core/destinations';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { authGuard, permissionGuard } from '../../../../src/TemplateV4.Angular/src/app/core/auth';
import { unsavedGuard } from '../../../../src/TemplateV4.Angular/src/app/shared/confirmation';
export const routes: Routes = [{
    path: 'organisation/invoicing',
    resolve: { businessTranslations },
    data: { breadcrumb: 'invoicing' },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./documents/invoicing').then((m) => m.InvoicingPage),
  },
{
    path: 'organisation/invoicing/new',
    canDeactivate: [unsavedGuard],
    resolve: { businessTranslations },
    data: { breadcrumb: 'issueDocument', permission: 'invoicing.issue' },
    canActivate: [authGuard, permissionGuard, capabilityGuard('invoicing')],
    loadComponent: () =>
      import('./documents/commercial-editor').then(
        (m) => m.CommercialEditorPage,
      ),
  },
{
    path: 'organisation/invoicing/settings',
    redirectTo: ({ queryParams, fragment }) =>
      inject(Router).createUrlTree(['/administration/invoicing'], {
        queryParams,
        fragment: fragment ?? undefined,
      }),
  },
{
    path: 'organisation/invoicing/:documentId',
    resolve: { businessTranslations },
    data: { breadcrumb: 'invoicing' },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./documents/commercial-detail').then(
        (m) => m.CommercialDetailPage,
      ),
  }];
export const administrationRoutes: Routes = [{
        path: 'invoicing',
        canDeactivate: [unsavedGuard],
        resolve: { businessTranslations },
        data: { breadcrumb: 'issuerSettings' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.invoicingSettings)],
        loadComponent: () =>
          import('./configuration/issuer-settings').then(
            (m) => m.IssuerSettingsPage,
          ),
      }];

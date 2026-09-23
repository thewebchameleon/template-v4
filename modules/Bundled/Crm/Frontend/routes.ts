import type { Routes } from '@angular/router';
import { businessTranslations } from '../../../../src/TemplateV4.Angular/src/app/core/business-translations';
import { capabilityGuard } from '../../../../src/TemplateV4.Angular/src/app/core/features';
import { destinationGuard, administrationDestinations } from '../../../../src/TemplateV4.Angular/src/app/core/destinations';
import { authGuard } from '../../../../src/TemplateV4.Angular/src/app/core/auth';
import { unsavedGuard } from '../../../../src/TemplateV4.Angular/src/app/shared/confirmation';
export const routes: Routes = [{
    path: 'organisation/crm',
    resolve: { businessTranslations },
    data: { breadcrumb: 'crm' },
    canActivate: [authGuard, capabilityGuard('crm')],
    loadComponent: () => import('./records/crm').then((m) => m.CrmPage),
  },
{
    path: 'organisation/crm/:recordId',
    canDeactivate: [unsavedGuard],
    resolve: { businessTranslations },
    data: { breadcrumb: 'crmEdit' },
    canActivate: [authGuard, capabilityGuard('crm')],
    loadComponent: () => import('./records/crm-detail').then((m) => m.CrmDetailPage),
  }];
export const administrationRoutes: Routes = [{
        path: 'crm',
        canDeactivate: [unsavedGuard],
        resolve: { businessTranslations },
        data: { breadcrumb: 'crmConfiguration' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.crmConfiguration)],
        loadComponent: () =>
          import('./configuration/crm-configuration').then(
            (m) => m.CrmConfigurationPage,
          ),
      }];

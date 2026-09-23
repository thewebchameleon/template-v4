import type { Routes } from '@angular/router';
import { customerTranslations } from '../../../../src/TemplateV4.Angular/src/app/features/organisations/customer-resolver';
import { businessTranslations } from '../../../../src/TemplateV4.Angular/src/app/core/business-translations';
import { destinationGuard, administrationDestinations } from '../../../../src/TemplateV4.Angular/src/app/core/destinations';
import { authGuard } from '../../../../src/TemplateV4.Angular/src/app/core/auth';
import { unsavedGuard } from '../../../../src/TemplateV4.Angular/src/app/shared/confirmation';
export const routes: Routes = [];
export const administrationRoutes: Routes = [{
        path: 'license',
        canDeactivate: [unsavedGuard],
        resolve: { customerTranslations, businessTranslations },
        data: { breadcrumb: 'commercialBilling' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.license)],
        loadComponent: () =>
          import('./commercial-billing').then(
            (m) => m.CommercialBillingPage,
          ),
      },
{
        path: 'commercial-billing',
        canDeactivate: [unsavedGuard],
        resolve: { customerTranslations, businessTranslations },
        data: { breadcrumb: 'commercialBillingSettings', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.commercialBilling)],
        loadComponent: () =>
          import('./commercial-billing-settings').then(
            (m) => m.CommercialBillingSettingsPage,
          ),
      }];

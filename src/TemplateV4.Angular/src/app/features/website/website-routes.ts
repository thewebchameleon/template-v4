import { Routes } from '@angular/router';
import { destinationGuard, administrationDestinations } from '../../core/destinations';
import { unsavedGuard } from '../../shared/confirmation';
import { websiteTranslations } from './website-resolver';
export const websiteRoutes: Routes = [
  {
    path: '',
    resolve: { websiteTranslations },
    data: { breadcrumb: 'websiteSetup' },
    canActivate: [destinationGuard(administrationDestinations.website)],
    canDeactivate: [unsavedGuard],
    loadComponent: () => import('./website-setup').then((m) => m.WebsiteSetupPage),
  },
];

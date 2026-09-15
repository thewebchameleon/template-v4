import { Routes } from '@angular/router';
import { authGuard } from '../../../core/auth';
import { destinationGuard, workspaceDestinations } from '../../../core/destinations';
import { unsavedGuard } from '../../../shared/confirmation';
import { cmsTranslations } from '../cms-resolver';
import { websiteTranslations } from '../../website/website-resolver';
export const sectionsRoutes: Routes = [
  {
    path: '',
    resolve: { cmsTranslations, websiteTranslations },
    data: { breadcrumb: 'websiteSections' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    canDeactivate: [unsavedGuard],
    loadComponent: () => import('./cms-sections').then((m) => m.CmsSectionsPage),
  },
];

import { Routes } from '@angular/router';
import { authGuard } from '../../../core/auth';
import { destinationGuard, workspaceDestinations } from '../../../core/destinations';
import { unsavedGuard } from '../../../shared/confirmation';
import { cmsTranslations } from '../cms-resolver';
export const sectionsRoutes: Routes = [
  {
    path: '',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cmsSections' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    canDeactivate: [unsavedGuard],
    loadComponent: () => import('./cms-sections').then((m) => m.CmsSectionsPage),
  },
];

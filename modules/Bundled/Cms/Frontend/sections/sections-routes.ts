import { Routes } from '@angular/router';
import { authGuard } from '../../../../../src/TemplateV4.Angular/src/app/core/auth';
import { destinationGuard, workspaceDestinations } from '../../../../../src/TemplateV4.Angular/src/app/core/destinations';
import { unsavedGuard } from '../../../../../src/TemplateV4.Angular/src/app/shared/confirmation';
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

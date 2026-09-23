import type { Routes } from '@angular/router';
import { destinationGuard, workspaceDestinations } from '../../../../src/TemplateV4.Angular/src/app/core/destinations';
import { authGuard } from '../../../../src/TemplateV4.Angular/src/app/core/auth';
import { unsavedGuard } from '../../../../src/TemplateV4.Angular/src/app/shared/confirmation';
export const routes: Routes = [{
    path: 'file-storage',
    data: { breadcrumb: 'files' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.fileStorage)],
    canDeactivate: [unsavedGuard],
    loadComponent: () =>
      import('./files/file-storage').then((m) => m.FileStoragePage),
  }];
export const administrationRoutes: Routes = [{
        path: 'file-storage',
        pathMatch: 'full',
        redirectTo: '/file-storage/settings',
      }];

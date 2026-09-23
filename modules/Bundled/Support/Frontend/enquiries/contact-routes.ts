import { Routes } from '@angular/router';
import { destinationGuard, supportDestinations } from '../../../../../src/TemplateV4.Angular/src/app/core/destinations';
import { contactTranslations } from './contact-resolver';
export const contactRoutes: Routes = [
  {
    path: '',
    resolve: { contactTranslations },
    data: { breadcrumb: 'contactInbox' },
    canActivate: [destinationGuard(supportDestinations.contact)],
    loadComponent: () => import('./contact-inbox').then((m) => m.ContactInboxPage),
  },
];

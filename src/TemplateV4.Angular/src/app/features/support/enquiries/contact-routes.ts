import { Routes } from '@angular/router';
import { destinationGuard, administrationDestinations } from '../../../core/destinations';
import { contactTranslations } from './contact-resolver';
export const contactRoutes: Routes = [
  {
    path: '',
    resolve: { contactTranslations },
    data: { breadcrumb: 'contactInbox' },
    canActivate: [destinationGuard(administrationDestinations.contact)],
    loadComponent: () => import('./contact-inbox').then((m) => m.ContactInboxPage),
  },
];

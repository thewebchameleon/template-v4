import { cmsTranslations } from './features/cms/cms-resolver';
import { actionItemTranslations } from './features/action-items/action-item-resolver';
import { updateTranslations } from './features/updates/update-resolver';
import { customerTranslations } from './features/organisations/customer-resolver';
import { businessTranslations } from './core/business-translations';
import { administrationLandingGuard, peopleLandingGuard } from './core/administration';
import { capabilityGuard } from './core/features';
import {
  destinationGuard,
  workspaceDestinations,
  administrationDestinations,
  userManagementDestinations,
} from './core/destinations';
import { moduleSettingsTranslations } from './features/modules/module-settings-resolver';
import { supportTranslations } from './features/support/support-resolver';
import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { authGuard, permissionGuard, mfaSetupGuard } from './core/auth';
import { unsavedGuard } from './shared/confirmation';
import { bootstrapLandingGuard, bootstrapLoginGuard } from './core/bootstrap';
export const routes: Routes = [
  {
    path: 'cms',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cms' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    loadComponent: () => import('./features/cms/articles/cms').then((m) => m.CmsPage),
  },
  {
    path: 'cms/new',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cmsNew' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    canDeactivate: [unsavedGuard],
    loadComponent: () => import('./features/cms/articles/cms-editor').then((m) => m.CmsEditorPage),
  },
  {
    path: 'cms/sections',
    loadChildren: () =>
      import('./features/cms/sections/sections-routes').then((m) => m.sectionsRoutes),
  },
  {
    path: 'cms/:id',
    resolve: { cmsTranslations },
    data: { breadcrumb: 'cms' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.cms)],
    canDeactivate: [unsavedGuard],
    loadComponent: () => import('./features/cms/articles/cms-editor').then((m) => m.CmsEditorPage),
  },
  {
    path: 'organisation/invoicing',
    resolve: { businessTranslations },
    data: { breadcrumb: 'invoicing' },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/invoicing/documents/invoicing').then((m) => m.InvoicingPage),
  },
  {
    path: 'organisation/invoicing/new',
    canDeactivate: [unsavedGuard],
    resolve: { businessTranslations },
    data: { breadcrumb: 'issueDocument', permission: 'invoicing.issue' },
    canActivate: [authGuard, permissionGuard, capabilityGuard('invoicing')],
    loadComponent: () =>
      import('./features/invoicing/documents/commercial-editor').then(
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
      import('./features/invoicing/documents/commercial-detail').then(
        (m) => m.CommercialDetailPage,
      ),
  },
  {
    path: 'organisation/crm',
    resolve: { businessTranslations },
    data: { breadcrumb: 'crm' },
    canActivate: [authGuard, capabilityGuard('crm')],
    loadComponent: () => import('./features/crm/records/crm').then((m) => m.CrmPage),
  },
  {
    path: 'organisation/crm/configuration',
    redirectTo: ({ queryParams, fragment }) =>
      inject(Router).createUrlTree(['/administration/crm'], {
        queryParams,
        fragment: fragment ?? undefined,
      }),
  },
  {
    path: 'organisation/crm/:recordId',
    canDeactivate: [unsavedGuard],
    resolve: { businessTranslations },
    data: { breadcrumb: 'crmEdit' },
    canActivate: [authGuard, capabilityGuard('crm')],
    loadComponent: () => import('./features/crm/records/crm-detail').then((m) => m.CrmDetailPage),
  },
  {
    path: 'files',
    pathMatch: 'full',
    redirectTo: ({ queryParams }) =>
      inject(Router).createUrlTree(['/file-storage'], { queryParams }),
  },
  {
    path: 'shared-files/:id',
    data: { breadcrumb: 'sharedWithMe' },
    loadComponent: () =>
      import('./features/file-storage/sharing/public-file-storage').then(
        (m) => m.PublicFileStoragePage,
      ),
  },
  {
    path: 'organisation',
    canDeactivate: [unsavedGuard],
    resolve: { customerTranslations, businessTranslations },
    data: { breadcrumb: 'organisation' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.organisations)],
    loadComponent: () =>
      import('./features/organisations/organisation-detail').then((m) => m.OrganisationDetailPage),
  },
  {
    path: 'organisation/billing',
    canDeactivate: [unsavedGuard],
    resolve: { customerTranslations, businessTranslations },
    data: { breadcrumb: 'billing' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/billing/billing').then((m) => m.BillingPage),
  },
  {
    path: 'organisation/files',
    pathMatch: 'full',
    redirectTo: ({ queryParams }) =>
      inject(Router).createUrlTree(['/file-storage'], { queryParams }),
  },
  { path: '', pathMatch: 'full', canActivate: [bootstrapLandingGuard], children: [] },
  {
    path: 'dashboard',
    resolve: { actionItemTranslations },
    data: { breadcrumb: 'dashboard' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardPage),
  },
  {
    path: 'bootstrap',
    data: { breadcrumb: 'bootstrapTitle' },
    loadComponent: () =>
      import('./features/identity/authentication/bootstrap').then((m) => m.BootstrapPage),
  },
  {
    path: 'login/setup',
    data: { breadcrumb: 'mfaSetupTitle' },
    canActivate: [authGuard],
    children: [
      {
        path: '',
        canActivate: [mfaSetupGuard],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/identity/authentication/mfa-setup').then((m) => m.MfaSetupPage),
      },
    ],
  },
  {
    path: 'login',
    data: { breadcrumb: 'signIn' },
    canActivate: [bootstrapLoginGuard],
    loadComponent: () =>
      import('./features/identity/authentication/login').then((m) => m.LoginPage),
  },
  {
    path: 'forgot-password',
    data: { breadcrumb: 'forgotPasswordTitle' },
    canActivate: [bootstrapLoginGuard],
    loadComponent: () =>
      import('./features/identity/authentication/forgot-password').then(
        (m) => m.ForgotPasswordPage,
      ),
  },
  {
    path: 'signup',
    resolve: { actionItemTranslations },
    data: { breadcrumb: 'signupTitle' },
    loadComponent: () =>
      import('./features/identity/authentication/signup').then((m) => m.SignupPage),
  },
  {
    path: 'account',
    resolve: { actionItemTranslations },
    data: { breadcrumb: 'account' },
    loadComponent: () => import('./features/identity/account/account').then((m) => m.AccountPage),
  },
  { path: 'profile', redirectTo: 'security', pathMatch: 'full' },
  { path: 'sessions', redirectTo: 'security/sessions', pathMatch: 'full' },
  {
    path: 'me',
    data: { breadcrumb: 'account' },
    canActivate: [authGuard],
    canDeactivate: [unsavedGuard],
    loadComponent: () =>
      import('./features/identity/account/account-home').then((m) => m.AccountHomePage),
  },
  {
    path: 'security/sessions',
    data: { breadcrumb: 'sessions' },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/identity/sessions/sessions').then((m) => m.SessionsPage),
  },
  {
    path: 'security',
    data: { breadcrumb: 'security' },
    canDeactivate: [unsavedGuard],
    canActivate: [authGuard],
    loadComponent: () => import('./features/identity/account/profile').then((m) => m.ProfilePage),
  },
  {
    path: 'action-items',
    resolve: { actionItemTranslations },
    data: { breadcrumb: 'actionItems' },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/action-items/action-items').then((m) => m.ActionItemsPage),
  },
  {
    path: 'notifications',
    data: { breadcrumb: 'notificationCentre' },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notifications/notification-centre').then((m) => m.NotificationCentrePage),
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: { breadcrumb: 'inbox' },
        loadComponent: () => import('./features/notifications/inbox').then((m) => m.InboxPage),
      },
      {
        path: 'preferences',
        data: { breadcrumb: 'notificationPreferences' },
        loadComponent: () =>
          import('./features/notifications/notification-preferences').then(
            (m) => m.NotificationPreferencesPage,
          ),
      },
    ],
  },
  {
    path: 'support',
    resolve: { supportTranslations },
    runGuardsAndResolvers: 'always',
    data: { breadcrumb: 'support' },
    canActivate: [authGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tickets',
      },
      {
        path: 'tickets',
        data: { breadcrumb: 'supportTickets' },
        canActivate: [destinationGuard(workspaceDestinations.support)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/support/tickets/support').then((m) => m.SupportPage),
      },
      {
        path: 'tickets/new',
        data: { breadcrumb: 'supportNew' },
        canActivate: [destinationGuard(workspaceDestinations.support)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/support/tickets/create/support-new').then((m) => m.SupportNewPage),
      },
      {
        path: 'tickets/categories',
        data: { breadcrumb: 'supportCategories', permission: 'support.admin' },
        canActivate: [destinationGuard(workspaceDestinations.support), permissionGuard],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/support/categories/support-categories').then(
            (m) => m.SupportCategoriesPage,
          ),
      },
      {
        path: 'tickets/:id',
        data: { breadcrumb: 'supportTicketDetails' },
        canActivate: [destinationGuard(workspaceDestinations.support)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/support/tickets/detail/support-detail').then(
            (m) => m.SupportDetailPage,
          ),
      },
      {
        path: 'contact',
        data: { breadcrumb: false },
        loadChildren: () =>
          import('./features/support/enquiries/contact-routes').then((m) => m.contactRoutes),
      },
      { path: 'new', pathMatch: 'full', redirectTo: 'tickets/new' },
      { path: 'categories', pathMatch: 'full', redirectTo: 'tickets/categories' },
      { path: ':id', redirectTo: 'tickets/:id' },
    ],
  },
  {
    path: 'file-storage',
    data: { breadcrumb: 'files' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.fileStorage)],
    canDeactivate: [unsavedGuard],
    loadComponent: () =>
      import('./features/file-storage/files/file-storage').then((m) => m.FileStoragePage),
  },
  {
    path: 'privacy',
    data: { breadcrumb: 'privacyAndData' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/privacy/privacy').then((m) => m.PrivacyPage),
  },
  { path: 'audit', redirectTo: 'administration/audit-history', pathMatch: 'full' },
  { path: 'operations', redirectTo: 'administration/system-health', pathMatch: 'full' },
  {
    path: 'user-management',
    resolve: { actionItemTranslations },
    data: { breadcrumb: 'userManagement' },
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', canActivate: [peopleLandingGuard], children: [] },
      {
        path: 'users',
        data: { breadcrumb: 'users', section: 'users' },
        canActivate: [destinationGuard(userManagementDestinations.users)],
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
      },
      {
        path: 'invitations',
        data: { breadcrumb: 'invitations', section: 'invitations' },
        canActivate: [destinationGuard(userManagementDestinations.invitations)],
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
      },
      {
        path: 'roles',
        data: { breadcrumb: 'roles', section: 'roles' },
        canActivate: [destinationGuard(userManagementDestinations.roles)],
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
      },
      {
        path: 'account-security',
        data: { breadcrumb: 'security', section: 'security' },
        canActivate: [destinationGuard(userManagementDestinations.accountSecurity)],
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
      },
      {
        path: 'registration-requests',
        data: { breadcrumb: 'registrationRequests', section: 'registrations' },
        canActivate: [destinationGuard(userManagementDestinations.registrationRequests)],
        loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
      },
      {
        path: 'privacy-requests',
        data: { breadcrumb: 'privacyRequests', section: 'privacy' },
        canActivate: [destinationGuard(userManagementDestinations.privacyRequests)],
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
      },
      {
        path: 'users/:ownerId/files',
        pathMatch: 'full',
        redirectTo: ({ queryParams }) =>
          inject(Router).createUrlTree(['/file-storage'], { queryParams }),
      },
      {
        path: 'users/:ownerId/file-storage',
        pathMatch: 'full',
        redirectTo: ({ queryParams }) =>
          inject(Router).createUrlTree(['/file-storage'], { queryParams }),
      },
      {
        path: 'users/:id',
        data: { breadcrumb: 'personDetails' },
        canActivate: [destinationGuard(userManagementDestinations.users)],
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/users/user-detail').then((m) => m.UserDetailPage),
      },
    ],
  },
  {
    path: 'administration',
    data: { breadcrumb: 'administration' },
    canActivate: [authGuard],
    children: [
      {
        path: 'website',
        loadChildren: () =>
          import('./features/website/website-routes').then((m) => m.websiteRoutes),
      },
      {
        path: 'organisation',
        redirectTo: 'configuration',
        pathMatch: 'full',
      },

      { path: '', pathMatch: 'full', canActivate: [administrationLandingGuard], children: [] },
      {
        path: 'support',
        data: { breadcrumb: 'support' },
        resolve: { supportTranslations, moduleSettingsTranslations },
        canActivate: [destinationGuard(administrationDestinations.supportSettings)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/support/configuration/support-settings').then(
            (m) => m.SupportSettingsPage,
          ),
      },
      {
        path: 'modules',
        resolve: { moduleSettingsTranslations },
        data: { breadcrumb: 'modules', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.modules)],
        loadComponent: () => import('./features/modules/modules').then((m) => m.ModulesPage),
      },
      {
        path: 'license',
        canDeactivate: [unsavedGuard],
        resolve: { customerTranslations, businessTranslations },
        data: { breadcrumb: 'license', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.license)],
        loadComponent: () =>
          import('./features/billing/billing-settings').then((m) => m.BillingSettingsPage),
      },
      {
        path: 'configuration',
        resolve: { customerTranslations },
        data: { breadcrumb: 'configuration', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.configuration)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/configuration/configuration').then((m) => m.ConfigurationPage),
      },
      {
        path: 'file-storage',
        resolve: { moduleSettingsTranslations },
        data: { breadcrumb: 'storageSettings', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.storage)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/file-storage/configuration/storage-settings').then(
            (m) => m.StorageSettingsPage,
          ),
      },
      {
        path: 'crm',
        canDeactivate: [unsavedGuard],
        resolve: { businessTranslations },
        data: { breadcrumb: 'crmConfiguration' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.crmConfiguration)],
        loadComponent: () =>
          import('./features/crm/configuration/crm-configuration').then(
            (m) => m.CrmConfigurationPage,
          ),
      },
      {
        path: 'invoicing',
        canDeactivate: [unsavedGuard],
        resolve: { businessTranslations },
        data: { breadcrumb: 'issuerSettings' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.invoicingSettings)],
        loadComponent: () =>
          import('./features/invoicing/configuration/issuer-settings').then(
            (m) => m.IssuerSettingsPage,
          ),
      },
      {
        path: 'audit-history',
        data: { breadcrumb: 'auditHistory', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.auditHistory)],
        loadComponent: () => import('./features/audit-history/audit').then((m) => m.AuditPage),
      },
      {
        path: 'system-health',
        resolve: { updateTranslations },
        data: { breadcrumb: 'systemHealth', permissions: ['settings.manage', 'jobs.trigger'] },
        canActivate: [authGuard, destinationGuard(administrationDestinations.operations)],
        loadComponent: () =>
          import('./features/operations/operations').then((m) => m.OperationsPage),
      },
    ],
  },
  {
    path: 'forbidden',
    data: { breadcrumb: 'accessRestricted', forbidden: true },
    canActivate: [authGuard],
    loadComponent: () => import('./features/modules/unavailable').then((m) => m.UnavailablePage),
  },
  {
    path: 'module-unavailable',
    data: { breadcrumb: 'modules' },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/modules/module-unavailable').then((m) => m.ModuleUnavailablePage),
  },
  {
    path: '**',
    data: { breadcrumb: 'pageNotFound' },
    loadComponent: () => import('./features/modules/unavailable').then((m) => m.UnavailablePage),
  },
];

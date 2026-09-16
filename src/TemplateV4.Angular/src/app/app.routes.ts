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
} from './core/destinations';
import { supportTranslations } from './features/support/support-resolver';
import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { authGuard, administratorRoleGuard, permissionGuard, mfaSetupGuard } from './core/auth';
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
    canDeactivate: [unsavedGuard],
    resolve: { businessTranslations },
    data: { breadcrumb: 'issuerSettings' },
    canActivate: [authGuard, capabilityGuard('invoicing')],
    loadComponent: () =>
      import('./features/invoicing/configuration/issuer-settings').then(
        (m) => m.IssuerSettingsPage,
      ),
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
    canDeactivate: [unsavedGuard],
    resolve: { businessTranslations },
    data: { breadcrumb: 'crmConfiguration' },
    canActivate: [authGuard, capabilityGuard('crm')],
    loadComponent: () =>
      import('./features/crm/configuration/crm-configuration').then((m) => m.CrmConfigurationPage),
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
    redirectTo: ({ queryParams }) => inject(Router).createUrlTree(['/my-files'], { queryParams }),
  },
  {
    path: 'shared-files/:id',
    data: { breadcrumb: 'sharedWithMe' },
    loadComponent: () =>
      import('./features/my-files/sharing/public-my-files').then((m) => m.PublicMyFilesPage),
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
    redirectTo: ({ queryParams }) => inject(Router).createUrlTree(['/my-files'], { queryParams }),
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
  { path: 'users', redirectTo: 'administration/users', pathMatch: 'full' },
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
    canActivate: [authGuard, destinationGuard(workspaceDestinations.support)],
    children: [
      {
        path: '',
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/support/tickets/support').then((m) => m.SupportPage),
      },
      {
        path: 'new',
        data: { breadcrumb: 'supportNew' },
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/support/tickets/create/support-new').then((m) => m.SupportNewPage),
      },
      {
        path: 'categories',
        data: { breadcrumb: 'supportCategories', permission: 'support.admin' },
        canActivate: [permissionGuard],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/support/categories/support-categories').then(
            (m) => m.SupportCategoriesPage,
          ),
      },
      {
        path: ':id',
        data: { breadcrumb: 'supportTicketDetails' },
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/support/tickets/detail/support-detail').then(
            (m) => m.SupportDetailPage,
          ),
      },
    ],
  },
  {
    path: 'my-files',
    data: { breadcrumb: 'files' },
    canActivate: [authGuard, destinationGuard(workspaceDestinations.myFiles)],
    canDeactivate: [unsavedGuard],
    loadComponent: () => import('./features/my-files/files/my-files').then((m) => m.MyFilesPage),
  },
  {
    path: 'privacy',
    data: { breadcrumb: 'privacyAndData' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/privacy/privacy').then((m) => m.PrivacyPage),
  },
  { path: 'users/:id', redirectTo: 'administration/users/:id', pathMatch: 'full' },
  { path: 'audit', redirectTo: 'administration/audit-history', pathMatch: 'full' },
  { path: 'operations', redirectTo: 'administration/system-health', pathMatch: 'full' },
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
        path: 'contact',
        loadChildren: () =>
          import('./features/contact/contact-routes').then((m) => m.contactRoutes),
      },
      {
        path: 'organisation',
        data: { breadcrumb: 'organisation' },
        canActivate: [destinationGuard(administrationDestinations.organisations)],
        canDeactivate: [unsavedGuard],
        resolve: { customerTranslations },
        loadComponent: () =>
          import('./features/organisations/organisation-detail').then(
            (m) => m.OrganisationDetailPage,
          ),
      },

      { path: '', pathMatch: 'full', canActivate: [administrationLandingGuard], children: [] },
      {
        path: 'users',
        resolve: { actionItemTranslations },
        data: {
          breadcrumb: 'userManagement',
          permissions: ['users.read', 'users.manage', 'roles.manage', 'settings.manage'],
        },
        canActivate: [authGuard, permissionGuard],
        children: [
          {
            path: '',
            pathMatch: 'full',
            data: { breadcrumb: false, section: 'users' },
            canActivate: [peopleLandingGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
          },
          {
            path: 'invitations',
            data: { breadcrumb: 'invitations', permission: 'users.manage', section: 'invitations' },
            canActivate: [permissionGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
          },
          {
            path: 'roles',
            data: { breadcrumb: 'roles', permission: 'roles.manage', section: 'roles' },
            canActivate: [permissionGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
          },
          {
            path: 'account-security',
            data: { breadcrumb: 'security', permission: 'settings.manage', section: 'security' },
            canActivate: [permissionGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
          },
          {
            path: 'registration-requests',
            data: {
              breadcrumb: 'registrationRequests',
              permission: 'settings.manage',
              section: 'registrations',
            },
            canActivate: [permissionGuard, administratorRoleGuard],
            loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
          },
          {
            path: 'privacy-requests',
            data: {
              breadcrumb: 'privacyRequests',
              permission: 'settings.manage',
              section: 'privacy',
            },
            canActivate: [permissionGuard, administratorRoleGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () => import('./features/users/users').then((m) => m.UsersPage),
          },
          {
            path: ':ownerId/files',
            pathMatch: 'full',
            redirectTo: ({ queryParams }) =>
              inject(Router).createUrlTree(['/my-files'], { queryParams }),
          },
          {
            path: ':ownerId/my-files',
            pathMatch: 'full',
            redirectTo: ({ queryParams }) =>
              inject(Router).createUrlTree(['/my-files'], { queryParams }),
          },
          {
            path: ':id',
            data: { breadcrumb: 'personDetails', permission: 'users.read' },
            canActivate: [permissionGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () =>
              import('./features/users/user-detail').then((m) => m.UserDetailPage),
          },
        ],
      },
      {
        path: 'modules',
        data: { breadcrumb: 'modules', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.modules)],
        loadComponent: () => import('./features/modules/modules').then((m) => m.ModulesPage),
      },
      {
        path: 'updates',
        resolve: { updateTranslations },
        data: { breadcrumb: 'releaseUpdates' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.updates)],
        loadComponent: () => import('./features/updates/updates').then((m) => m.UpdatesPage),
      },
      {
        path: 'billing',
        canDeactivate: [unsavedGuard],
        resolve: { customerTranslations, businessTranslations },
        data: { breadcrumb: 'billingSettings', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.billing)],
        loadComponent: () =>
          import('./features/billing/billing-settings').then((m) => m.BillingSettingsPage),
      },
      {
        path: 'configuration',
        data: { breadcrumb: 'configuration', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.configuration)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/configuration/configuration').then((m) => m.ConfigurationPage),
      },
      {
        path: 'storage',
        data: { breadcrumb: 'storageSettings', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.storage)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/my-files/configuration/storage-settings').then(
            (m) => m.StorageSettingsPage,
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

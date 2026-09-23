import { bundledFeatures } from '../bundled-modules.g';
import { dashboardTranslations } from './features/dashboard/dashboard-resolver';
import { actionItemTranslations } from './features/action-items/action-item-resolver';
import { updateTranslations } from './features/updates/update-resolver';
import { backgroundJobTranslations } from './features/operations/background-job-resolver';
import { customerTranslations } from './features/organisations/customer-resolver';
import { businessTranslations } from './core/business-translations';
import { administrationLandingGuard, peopleLandingGuard } from './core/administration';
import { destinationGuard, workspaceDestinations, administrationDestinations, userManagementDestinations } from './core/destinations';
import { moduleSettingsTranslations } from './features/modules/module-settings-resolver';
import { apiKeyTranslations } from './features/api-keys/api-key-resolver';
import { privateModuleTranslations } from './features/private-modules/private-module-resolver';
import { inject } from '@angular/core';
import { Routes, Router } from '@angular/router';
import { authGuard, mfaSetupGuard } from './core/auth';
import { unsavedGuard } from './shared/confirmation';
import { bootstrapLandingGuard, bootstrapLoginGuard } from './core/bootstrap';
export const routes: Routes = [
  ...bundledFeatures.flatMap(feature => feature.routes),
  {
    path: 'organisation/crm/configuration',
    redirectTo: ({ queryParams, fragment }) =>
      inject(Router).createUrlTree(['/administration/crm'], {
        queryParams,
        fragment: fragment ?? undefined,
      }),
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
    path: 'organisation/files',
    pathMatch: 'full',
    redirectTo: ({ queryParams }) =>
      inject(Router).createUrlTree(['/file-storage'], { queryParams }),
  },
  { path: '', pathMatch: 'full', canActivate: [bootstrapLandingGuard], children: [] },
  {
    path: 'dashboard',
    resolve: { dashboardTranslations },
    data: { breadcrumb: 'dashboard' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.DashboardPage),
    canDeactivate: [unsavedGuard],
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
  { path: 'profile', redirectTo: 'me/profile', pathMatch: 'full' },
  { path: 'sessions', redirectTo: 'me/sessions', pathMatch: 'full' },
  { path: 'security/sessions', redirectTo: 'me/sessions', pathMatch: 'full' },
  { path: 'security', redirectTo: 'me/security', pathMatch: 'full' },
  { path: 'action-items', redirectTo: 'me/action-items', pathMatch: 'full' },
  { path: 'notifications', redirectTo: 'me/notifications', pathMatch: 'prefix' },
  { path: 'privacy', redirectTo: 'me/privacy', pathMatch: 'full' },
  {
    path: 'me',
    data: { breadcrumb: 'account' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/identity/account/me').then((m) => m.MePage),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      {
        path: 'profile',
        data: {
          breadcrumb: 'accountMenuProfile',
          pageTitle: 'account',
          pageDescription: 'accountIntro',
        },
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/identity/account/account-home').then((m) => m.AccountHomePage),
      },
      {
        path: 'security',
        data: {
          breadcrumb: 'security',
          pageTitle: 'security',
          pageDescription: 'securityHelp',
        },
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/identity/account/profile').then((m) => m.ProfilePage),
      },
      {
        path: 'sessions',
        data: {
          breadcrumb: 'sessions',
          pageTitle: 'sessions',
          pageDescription: 'sessionsIntro',
        },
        loadComponent: () =>
          import('./features/identity/sessions/sessions').then((m) => m.SessionsPage),
      },
      {
        path: 'action-items',
        resolve: { actionItemTranslations },
        data: {
          breadcrumb: 'actionItems',
          pageTitle: 'actionItems',
          pageDescription: 'actionItemsHelp',
        },
        loadComponent: () =>
          import('./features/action-items/action-items').then((m) => m.ActionItemsPage),
      },
      {
        path: 'notifications',
        data: {
          breadcrumb: 'notificationCentre',
          pageTitle: 'notificationCentre',
          pageDescription: 'notificationIntro',
        },
        loadComponent: () =>
          import('./features/notifications/notification-centre').then(
            (m) => m.NotificationCentrePage,
          ),
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
        path: 'privacy',
        data: {
          breadcrumb: 'privacyAndData',
          pageTitle: 'privacyAndData',
          pageDescription: 'privacyIntro',
        },
        loadComponent: () => import('./features/privacy/privacy').then((m) => m.PrivacyPage),
      },
    ],
  },
  {
    path: 'file-storage/settings',
    resolve: { moduleSettingsTranslations },
    data: { breadcrumb: 'storageSettings', permission: 'settings.manage' },
    canActivate: [authGuard, destinationGuard(administrationDestinations.storage)],
    canDeactivate: [unsavedGuard],
    loadComponent: () =>
      import('./features/file-storage/configuration/storage-settings').then(
        (m) => m.StorageSettingsPage,
      ),
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
    children: [...bundledFeatures.flatMap(feature => feature.administrationRoutes ?? []),
{
        path: 'organisation',
        redirectTo: 'branding',
        pathMatch: 'full',
      },
{ path: '', pathMatch: 'full', canActivate: [administrationLandingGuard], children: [] },
{
        path: 'private-modules',
        resolve: { privateModuleTranslations },
        data: { breadcrumb: 'privateModules', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.privateModules)],
        loadComponent: () =>
          import('./features/private-modules/private-modules').then((m) => m.PrivateModulesPage),
      },
{
        path: 'api-keys',
        resolve: { apiKeyTranslations },
        data: { breadcrumb: 'apiKeys', permission: 'api-keys.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.apiKeys)],
        loadComponent: () => import('./features/api-keys/api-keys').then((m) => m.ApiKeysPage),
      },
{
        path: 'modules',
        resolve: { moduleSettingsTranslations },
        data: { breadcrumb: 'modules', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.modules)],
        loadComponent: () => import('./features/modules/modules').then((m) => m.ModulesPage),
      },
{
        path: 'payment-methods',
        canDeactivate: [unsavedGuard],
        resolve: { customerTranslations, businessTranslations },
        data: { breadcrumb: 'paymentMethods', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.paymentMethods)],
        loadComponent: () =>
          import('./features/payments/payment-method-settings').then(
            (m) => m.PaymentMethodSettingsPage,
          ),
      },
{
        path: 'branding',
        resolve: { customerTranslations },
        data: { breadcrumb: 'configuration', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.configuration)],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/configuration/configuration').then((m) => m.ConfigurationPage),
      },
{
        path: 'audit-history',
        data: { breadcrumb: 'auditHistory', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.auditHistory)],
        loadComponent: () => import('./features/audit-history/audit').then((m) => m.AuditPage),
      },
{
        path: 'background-jobs',
        resolve: { backgroundJobTranslations },
        data: { breadcrumb: 'backgroundJobs', permission: 'settings.manage' },
        canActivate: [authGuard, destinationGuard(administrationDestinations.backgroundJobs)],
        loadComponent: () =>
          import('./features/operations/background-jobs').then((m) => m.BackgroundJobsPage),
      },
{
        path: 'system-health',
        resolve: { updateTranslations },
        data: { breadcrumb: 'systemHealth', permissions: ['settings.manage', 'jobs.trigger'] },
        canActivate: [authGuard, destinationGuard(administrationDestinations.operations)],
        loadComponent: () =>
          import('./features/operations/operations').then((m) => m.OperationsPage),
      }],
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

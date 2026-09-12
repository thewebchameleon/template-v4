import { administrationLandingGuard, peopleLandingGuard } from './core/administration';
import { filesGuard, moduleGuard } from './core/features';
import { Routes } from '@angular/router';
import { authGuard, permissionGuard, administratorRoleGuard } from './core/auth';
import { unsavedGuard } from './shared/confirmation';
import { bootstrapLandingGuard, bootstrapLoginGuard } from './core/bootstrap';
export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [bootstrapLandingGuard], children: [] },
  {
    path: 'dashboard',
    data: { breadcrumb: 'dashboard' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard').then((m) => m.DashboardPage),
  },
  {
    path: 'bootstrap',
    data: { breadcrumb: 'bootstrapTitle' },
    loadComponent: () => import('./features/bootstrap').then((m) => m.BootstrapPage),
  },
  {
    path: 'login',
    data: { breadcrumb: 'signIn' },
    canActivate: [bootstrapLoginGuard],
    loadComponent: () => import('./features/login').then((m) => m.LoginPage),
  },
  {
    path: 'signup',
    data: { breadcrumb: 'signupTitle' },
    loadComponent: () => import('./features/signup').then((m) => m.SignupPage),
  },
  {
    path: 'account',
    data: { breadcrumb: 'account' },
    loadComponent: () => import('./features/account').then((m) => m.AccountPage),
  },
  { path: 'profile', redirectTo: 'security', pathMatch: 'full' },
  { path: 'sessions', redirectTo: 'security/sessions', pathMatch: 'full' },
  {
    path: 'me',
    data: { breadcrumb: 'account' },
    canActivate: [authGuard],
    canDeactivate: [unsavedGuard],
    loadComponent: () => import('./features/account-home').then((m) => m.AccountHomePage),
  },
  { path: 'users', redirectTo: 'administration/users', pathMatch: 'full' },
  {
    path: 'security/sessions',
    data: { breadcrumb: 'sessions' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/sessions').then((m) => m.SessionsPage),
  },
  {
    path: 'security',
    data: { breadcrumb: 'security' },
    canDeactivate: [unsavedGuard],
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile').then((m) => m.ProfilePage),
  },
  {
    path: 'notifications',
    data: { breadcrumb: 'notificationCentre' },
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notification-centre').then((m) => m.NotificationCentrePage),
    children: [
      {
        path: '',
        pathMatch: 'full',
        data: { breadcrumb: 'inbox' },
        loadComponent: () => import('./features/inbox').then((m) => m.InboxPage),
      },
      {
        path: 'preferences',
        data: { breadcrumb: 'notificationPreferences' },
        loadComponent: () =>
          import('./features/notification-preferences').then((m) => m.NotificationPreferencesPage),
      },
    ],
  },
  {
    path: 'support',
    runGuardsAndResolvers: 'always',
    data: { breadcrumb: 'support' },
    canActivate: [authGuard, moduleGuard('support')],
    children: [
      {
        path: '',
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/support').then((m) => m.SupportPage),
      },
      {
        path: 'new',
        data: { breadcrumb: 'supportNew' },
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/support-new').then((m) => m.SupportNewPage),
      },
      {
        path: 'categories',
        data: { breadcrumb: 'supportCategories', permission: 'support.admin' },
        canActivate: [permissionGuard],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/support-categories').then((m) => m.SupportCategoriesPage),
      },
      {
        path: ':id',
        data: { breadcrumb: 'supportTicketDetails' },
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/support-detail').then((m) => m.SupportDetailPage),
      },
    ],
  },
  {
    path: 'files',
    data: { breadcrumb: 'files' },
    canActivate: [authGuard, filesGuard],
    canDeactivate: [unsavedGuard],
    loadComponent: () => import('./features/files').then((m) => m.FilesPage),
  },
  {
    path: 'privacy',
    data: { breadcrumb: 'privacyAndData' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/privacy').then((m) => m.PrivacyPage),
  },
  { path: 'users/:id', redirectTo: 'administration/users/:id', pathMatch: 'full' },
  { path: 'audit', redirectTo: 'administration/audit-history', pathMatch: 'full' },
  { path: 'operations', redirectTo: 'administration/system-health', pathMatch: 'full' },
  {
    path: 'administration',
    data: { breadcrumb: 'administration' },
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', canActivate: [administrationLandingGuard], children: [] },
      {
        path: 'users',
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
            loadComponent: () => import('./features/users').then((m) => m.UsersPage),
          },
          {
            path: 'invitations',
            data: { breadcrumb: 'invitations', permission: 'users.manage', section: 'invitations' },
            canActivate: [permissionGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () => import('./features/users').then((m) => m.UsersPage),
          },
          {
            path: 'roles',
            data: { breadcrumb: 'roles', permission: 'roles.manage', section: 'roles' },
            canActivate: [permissionGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () => import('./features/users').then((m) => m.UsersPage),
          },
          {
            path: 'account-security',
            data: { breadcrumb: 'security', permission: 'settings.manage', section: 'security' },
            canActivate: [permissionGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () => import('./features/users').then((m) => m.UsersPage),
          },
          {
            path: 'privacy-requests',
            data: {
              breadcrumb: 'privacyRequests',
              permission: 'settings.manage',
              section: 'privacy',
            },
            canActivate: [permissionGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () => import('./features/users').then((m) => m.UsersPage),
          },
          {
            path: ':ownerId/files',
            data: { breadcrumb: 'files', permission: 'settings.manage' },
            canActivate: [permissionGuard, filesGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () => import('./features/files').then((m) => m.FilesPage),
          },
          {
            path: ':id',
            data: { breadcrumb: 'personDetails', permission: 'users.read' },
            canActivate: [permissionGuard],
            canDeactivate: [unsavedGuard],
            loadComponent: () => import('./features/user-detail').then((m) => m.UserDetailPage),
          },
        ],
      },
      {
        path: 'modules',
        data: { breadcrumb: 'modules', permission: 'settings.manage' },
        canActivate: [authGuard, permissionGuard, administratorRoleGuard],
        loadComponent: () => import('./features/modules').then((m) => m.ModulesPage),
      },
      {
        path: 'configuration',
        data: { breadcrumb: 'configuration', permission: 'settings.manage' },
        canActivate: [authGuard, permissionGuard, administratorRoleGuard],
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/configuration').then((m) => m.ConfigurationPage),
      },
      {
        path: 'storage',
        data: { breadcrumb: 'storageSettings', permission: 'settings.manage' },
        canActivate: [authGuard, permissionGuard, filesGuard],
        canDeactivate: [unsavedGuard],
        loadComponent: () =>
          import('./features/storage-settings').then((m) => m.StorageSettingsPage),
      },
      {
        path: 'audit-history',
        data: { breadcrumb: 'auditHistory', permission: 'settings.manage' },
        canActivate: [authGuard, permissionGuard, moduleGuard('audit-history')],
        loadComponent: () => import('./features/audit').then((m) => m.AuditPage),
      },
      {
        path: 'system-health',
        data: { breadcrumb: 'systemHealth', permissions: ['settings.manage', 'jobs.trigger'] },
        canActivate: [authGuard, permissionGuard, moduleGuard('operations')],
        loadComponent: () => import('./features/operations').then((m) => m.OperationsPage),
      },
    ],
  },
  {
    path: 'forbidden',
    data: { breadcrumb: 'accessRestricted', forbidden: true },
    canActivate: [authGuard],
    loadComponent: () => import('./features/unavailable').then((m) => m.UnavailablePage),
  },
  {
    path: '**',
    data: { breadcrumb: 'pageNotFound' },
    loadComponent: () => import('./features/unavailable').then((m) => m.UnavailablePage),
  },
];

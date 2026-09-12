import { administrationLandingGuard } from './core/administration';
import { filesGuard, moduleGuard } from './core/features';
import { Routes } from '@angular/router';
import { authGuard, permissionGuard } from './core/auth';
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
  { path: 'privacy-requests', redirectTo: 'administration/privacy-requests', pathMatch: 'full' },
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
          permissions: ['users.read', 'roles.manage', 'settings.manage'],
        },
        canActivate: [authGuard, permissionGuard],
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/users').then((m) => m.UsersPage),
      },
      {
        path: 'users/:id',
        data: { breadcrumb: 'personDetails', permission: 'users.read' },
        canActivate: [authGuard, permissionGuard],
        canDeactivate: [unsavedGuard],
        loadComponent: () => import('./features/user-detail').then((m) => m.UserDetailPage),
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
      {
        path: 'privacy-requests',
        data: { breadcrumb: 'privacyRequests', permission: 'settings.manage' },
        canActivate: [authGuard, permissionGuard],
        loadComponent: () =>
          import('./features/privacy-requests').then((m) => m.PrivacyRequestsPage),
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

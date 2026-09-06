import { Routes } from '@angular/router';
import { authGuard, adminGuard, permissionGuard } from './core/auth';
import { unsavedGuard } from './shared/confirmation';
import { bootstrapLandingGuard, bootstrapLoginGuard } from './core/bootstrap';
export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [bootstrapLandingGuard], children: [] },
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
  {
    path: 'users',
    canDeactivate: [unsavedGuard],
    data: { breadcrumb: 'users' },
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/users').then((m) => m.UsersPage),
  },
  {
    path: 'sessions',
    data: { breadcrumb: 'sessions' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/sessions').then((m) => m.SessionsPage),
  },
  {
    path: 'profile',
    data: { breadcrumb: 'profile' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile').then((m) => m.ProfilePage),
  },
  {
    path: 'settings',
    canDeactivate: [unsavedGuard],
    data: { breadcrumb: 'adminSettings' },
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/settings').then((m) => m.SettingsPage),
  },
  {
    path: 'notifications',
    data: { breadcrumb: 'notificationCentre' },
    canActivate: [authGuard],
    loadComponent: () => import('./features/inbox').then((m) => m.InboxPage),
  },
  {
    path: 'files',
    data: { breadcrumb: 'files' },
    canActivate: [authGuard],
    canDeactivate: [unsavedGuard],
    loadComponent: () => import('./features/files').then((m) => m.FilesPage),
  },
  {
    path: 'privacy',
    data: { breadcrumb: 'privacyAndData' },
    canActivate: [authGuard],
    canDeactivate: [unsavedGuard],
    loadComponent: () => import('./features/privacy').then((m) => m.PrivacyPage),
  },
  {
    path: 'invitations',
    data: { breadcrumb: 'invitations', permission: 'users.manage' },
    canActivate: [authGuard, permissionGuard],
    loadComponent: () => import('./features/invitations').then((m) => m.InvitationsPage),
  },
  {
    path: 'audit',
    data: { breadcrumb: 'auditHistory', permission: 'settings.manage' },
    canActivate: [authGuard, permissionGuard],
    loadComponent: () => import('./features/audit').then((m) => m.AuditPage),
  },
  {
    path: 'operations',
    data: { breadcrumb: 'operations', permission: 'settings.manage' },
    canActivate: [authGuard, permissionGuard],
    loadComponent: () => import('./features/operations').then((m) => m.OperationsPage),
  },
  {
    path: 'privacy-requests',
    data: { breadcrumb: 'privacyRequests', permission: 'settings.manage' },
    canActivate: [authGuard, permissionGuard],
    loadComponent: () => import('./features/privacy-requests').then((m) => m.PrivacyRequestsPage),
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

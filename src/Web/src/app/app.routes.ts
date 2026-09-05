import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/auth';
import { bootstrapLandingGuard, bootstrapLoginGuard } from './core/bootstrap';
export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [bootstrapLandingGuard], children: [] },
  {
    path: 'bootstrap',
    loadComponent: () => import('./features/bootstrap').then((m) => m.BootstrapPage),
  },
  {
    path: 'login',
    canActivate: [bootstrapLoginGuard],
    loadComponent: () => import('./features/login').then((m) => m.LoginPage),
  },
  { path: 'signup', loadComponent: () => import('./features/signup').then((m) => m.SignupPage) },
  { path: 'account', loadComponent: () => import('./features/account').then((m) => m.AccountPage) },
  {
    path: 'users',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/users').then((m) => m.UsersPage),
  },
  {
    path: 'sessions',
    canActivate: [authGuard],
    loadComponent: () => import('./features/sessions').then((m) => m.SessionsPage),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile').then((m) => m.ProfilePage),
  },
  {
    path: 'settings',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./features/settings').then((m) => m.SettingsPage),
  },
  { path: '**', redirectTo: 'profile' },
];

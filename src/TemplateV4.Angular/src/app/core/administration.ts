import { Injectable, computed, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { Features } from './features';

@Injectable({ providedIn: 'root' })
export class AdministrationNavigation {
  private readonly auth = inject(Auth);
  private readonly features = inject(Features);
  readonly links = computed(() =>
    [
      {
        path: '/administration/billing',
        label: 'billingSettings',
        icon: 'lucideSettings',
        section: 'modules',
        permissions: ['settings.manage'],
        administratorOnly: true,
      },
      {
        path: '/administration/users',
        label: 'userManagement',
        icon: 'lucideUsersRound',
        section: 'administration',
        permissions: ['users.read', 'users.manage', 'roles.manage', 'settings.manage'],
      },
      {
        path: '/administration/configuration',
        label: 'configuration',
        icon: 'lucideSettings',
        section: 'administration',
        permissions: ['settings.manage'],
        administratorOnly: true,
      },
      {
        path: '/administration/modules',
        label: 'modules',
        icon: 'lucideSettings2',
        section: 'administration',
        permissions: ['settings.manage'],
        administratorOnly: true,
      },
      {
        path: '/administration/storage',
        label: 'storageSettings',
        icon: 'lucideFolderOpen',
        section: 'modules',
        permissions: ['settings.manage'],
        feature: 'files',
      },
      {
        path: '/administration/audit-history',
        label: 'auditHistory',
        icon: 'lucideHistory',
        section: 'administration',
        permissions: ['settings.manage'],
        module: 'audit-history',
      },
      {
        path: '/administration/system-health',
        label: 'systemHealth',
        icon: 'lucideActivity',
        section: 'administration',
        permissions: ['settings.manage', 'jobs.trigger'],
        module: 'operations',
      },
    ].filter(
      (item) =>
        !this.auth.access()?.setupRequired &&
        (!item.administratorOnly || this.auth.access()?.isAdministrator === true) &&
        item.permissions.some((permission) => this.auth.has(permission)) &&
        (!item.module || this.features.moduleEnabled(item.module)) &&
        (!item.feature || this.features.enabled(item.feature)),
    ),
  );
}

export const administrationLandingGuard: CanActivateFn = async (route) => {
  const navigation = inject(AdministrationNavigation);
  const features = inject(Features);
  const router = inject(Router);
  await features.load();
  return router.createUrlTree([navigation.links()[0]?.path ?? '/forbidden'], {
    queryParams: route.queryParams,
    fragment: route.fragment ?? undefined,
  });
};

export const peopleLandingGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);
  if (auth.has('users.read')) return true;

  const path = auth.has('users.manage')
    ? '/administration/users/invitations'
    : auth.has('roles.manage')
      ? '/administration/users/roles'
      : auth.has('settings.manage')
        ? '/administration/users/account-security'
        : '/forbidden';

  return router.createUrlTree([path], {
    queryParams: route.queryParams,
    fragment: route.fragment ?? undefined,
  });
};

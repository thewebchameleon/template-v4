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
        path: '/administration/users',
        label: 'userManagement',
        icon: 'lucideUsersRound',
        permissions: ['users.read', 'roles.manage', 'settings.manage'],
      },
      {
        path: '/administration/configuration',
        label: 'configuration',
        icon: 'lucideSettings',
        permissions: ['settings.manage'],
        administratorOnly: true,
      },
      {
        path: '/administration/modules',
        label: 'modules',
        icon: 'lucideSettings2',
        permissions: ['settings.manage'],
        administratorOnly: true,
      },
      {
        path: '/administration/storage',
        label: 'storageSettings',
        icon: 'lucideFolderOpen',
        permissions: ['settings.manage'],
        feature: 'files',
      },
      {
        path: '/administration/privacy-requests',
        label: 'privacyRequests',
        icon: 'lucideShieldCheck',
        permissions: ['settings.manage'],
      },
      {
        path: '/administration/audit-history',
        label: 'auditHistory',
        icon: 'lucideHistory',
        permissions: ['settings.manage'],
        module: 'audit-history',
      },
      {
        path: '/administration/system-health',
        label: 'systemHealth',
        icon: 'lucideActivity',
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

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { Features } from './features';
import { CapabilityId } from './capability-ids';

export interface Destination {
  path: string;
  label: string;
  icon: string;
  capability?: CapabilityId;
  permissions?: readonly string[];
  administratorOnly?: boolean;
  section?: string;
  help?: string;
  hasPanel?: boolean;
}

export const workspaceDestinations = {
  organizations: {
    path: '/organizations',
    label: 'organizations',
    icon: 'lucideUsersRound',
    capability: 'organizations',
    help: 'dashboardTeamsHelp',
    hasPanel: false,
  },
  myFiles: {
    path: '/my-files',
    label: 'files',
    icon: 'lucideFolderOpen',
    capability: 'my-files',
    help: 'dashboardFilesHelp',
    hasPanel: true,
  },
  support: {
    path: '/support',
    label: 'support',
    icon: 'lucideLifeBuoy',
    capability: 'support',
    help: 'dashboardSupportHelp',
    hasPanel: false,
  },
} as const satisfies Record<string, Destination>;

export const administrationDestinations = {
  billing: {
    path: '/administration/billing',
    label: 'billingSettings',
    icon: 'lucideSettings',
    section: 'modules',
    permissions: ['settings.manage'],
    administratorOnly: true,
  },
  users: {
    path: '/administration/users',
    label: 'userManagement',
    icon: 'lucideUsersRound',
    section: 'administration',
    permissions: ['users.read', 'users.manage', 'roles.manage', 'settings.manage'],
  },
  configuration: {
    path: '/administration/configuration',
    label: 'configuration',
    icon: 'lucideSettings',
    section: 'administration',
    permissions: ['settings.manage'],
    administratorOnly: true,
  },
  modules: {
    path: '/administration/modules',
    label: 'modules',
    icon: 'lucideSettings2',
    section: 'administration',
    permissions: ['settings.manage'],
    administratorOnly: true,
  },
  storage: {
    path: '/administration/storage',
    label: 'storageSettings',
    icon: 'lucideFolderOpen',
    section: 'modules',
    permissions: ['settings.manage'],
    capability: 'my-files',
  },
  auditHistory: {
    path: '/administration/audit-history',
    label: 'auditHistory',
    icon: 'lucideHistory',
    section: 'administration',
    permissions: ['settings.manage'],
    capability: 'audit-history',
  },
  operations: {
    path: '/administration/system-health',
    label: 'systemHealth',
    icon: 'lucideActivity',
    section: 'administration',
    permissions: ['settings.manage', 'jobs.trigger'],
    capability: 'operations',
  },
} as const satisfies Record<string, Destination>;

export function destinationAvailable(
  destination: Destination,
  auth: Auth,
  features: Features,
): boolean {
  return (
    !auth.access()?.setupRequired &&
    (!destination.administratorOnly || auth.access()?.isAdministrator === true) &&
    (!destination.permissions ||
      destination.permissions.some((permission) => auth.has(permission))) &&
    (!destination.capability || features.enabled(destination.capability))
  );
}

export const destinationGuard =
  (destination: Destination): CanActivateFn =>
  async () => {
    const auth = inject(Auth);
    const features = inject(Features);
    const router = inject(Router);
    if (!auth.access() && !(await auth.refresh())) return router.createUrlTree(['/login']);
    await features.load();
    if (destination.capability && !features.enabled(destination.capability))
      return router.createUrlTree(['/me']);
    return (
      destinationAvailable(destination, auth, features) || router.createUrlTree(['/forbidden'])
    );
  };

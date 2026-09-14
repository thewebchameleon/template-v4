import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { Features } from './features';

export interface Destination {
  path: string;
  activePath?: string;
  label: string;
  icon: string;
  capability?: string;
  permissions?: readonly string[];
  administratorOnly?: boolean;
  section?: string;
  help?: string;
  hasPanel?: boolean;
}

// Paths are relative to the selected organisation workspace.
export const organisationDestinations: readonly Destination[] = [
  { path: 'crm', label: 'crm', icon: 'lucideContactRound', capability: 'crm' },
  { path: 'invoicing', label: 'invoicing', icon: 'lucideFileSpreadsheet', capability: 'invoicing' },
];

export function activeDestinationIndex(items: readonly Destination[], path: string): number {
  let result = -1;
  let length = -1;
  items.forEach((item, index) => {
    const match = item.activePath ?? item.path;
    if ((path === match || path.startsWith(match + '/')) && match.length > length) {
      result = index;
      length = match.length;
    }
  });
  return result;
}

export const workspaceDestinations = {
  organisations: {
    path: '/organisations',
    label: 'organisation',
    icon: 'lucideUsersRound',
    capability: 'organisations',
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
  organisations: {
    path: '/administration/organisations',
    label: 'organisations',
    icon: 'lucideUsersRound',
    section: 'administration',
    administratorOnly: true,
    capability: 'organisations',
  },
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

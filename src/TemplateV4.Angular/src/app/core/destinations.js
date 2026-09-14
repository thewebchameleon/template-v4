import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from './auth';
import { Features } from './features';
// Paths are relative to the selected organization workspace.
export const organizationDestinations = [
    { path: 'crm', label: 'crm', icon: 'lucideContactRound', capability: 'crm' },
    { path: 'invoicing', label: 'invoicing', icon: 'lucideReceipt', capability: 'invoicing' },
];
export function activeDestinationIndex(items, path) {
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
};
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
};
export function destinationAvailable(destination, auth, features) {
    return (!auth.access()?.setupRequired &&
        (!destination.administratorOnly || auth.access()?.isAdministrator === true) &&
        (!destination.permissions ||
            destination.permissions.some((permission) => auth.has(permission))) &&
        (!destination.capability || features.enabled(destination.capability)));
}
export const destinationGuard = (destination) => async () => {
    const auth = inject(Auth);
    const features = inject(Features);
    const router = inject(Router);
    if (!auth.access() && !(await auth.refresh()))
        return router.createUrlTree(['/login']);
    await features.load();
    if (destination.capability && !features.enabled(destination.capability))
        return router.createUrlTree(['/me']);
    return (destinationAvailable(destination, auth, features) || router.createUrlTree(['/forbidden']));
};

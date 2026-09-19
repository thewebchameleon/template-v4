import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from './auth';
import { Features } from './features';
// Paths are relative to the organisation workspace.
export const organisationDestinations = [
    { path: 'crm', label: 'crm', icon: 'lucideContactRound', capability: 'crm' },
    {
        path: 'invoicing',
        label: 'invoicing',
        icon: 'lucideFileSpreadsheet',
        capability: 'invoicing',
    },
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
    cms: {
        path: '/cms',
        label: 'cms',
        icon: 'lucideNewspaper',
        capability: 'cms',
        permissions: ['cms.edit'],
        help: 'cmsModuleHelp',
        hasPanel: false,
    },
    organisations: {
        path: '/organisation',
        label: 'organisation',
        icon: 'lucideUsersRound',
        help: 'dashboardTeamsHelp',
        hasPanel: false,
    },
    fileStorage: {
        path: '/file-storage',
        label: 'files',
        icon: 'lucideFolderOpen',
        capability: 'file-storage',
        help: 'dashboardFilesHelp',
        hasPanel: true,
    },
    support: {
        path: '/support/tickets',
        label: 'supportTickets',
        icon: 'lucideLifeBuoy',
        capability: 'support-tickets',
        help: 'dashboardSupportHelp',
        hasPanel: false,
    },
};
export const administrationDestinations = {
    supportSettings: {
        path: '/administration/support',
        label: 'support',
        icon: 'lucideLifeBuoy',
        section: 'modules',
        navigationCapability: 'support',
        permissions: ['settings.manage'],
        administratorOnly: true,
    },
    configuration: {
        path: '/administration/branding',
        label: 'configuration',
        icon: 'lucidePalette',
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
        path: '/administration/file-storage',
        label: 'files',
        icon: 'lucideFolderOpen',
        section: 'administration',
        permissions: ['settings.manage'],
        administratorOnly: true,
    },
    crmConfiguration: {
        path: '/administration/crm',
        label: 'crm',
        icon: 'lucideContactRound',
        section: 'modules',
        capability: 'crm',
    },
    invoicingSettings: {
        path: '/administration/invoicing',
        label: 'invoicing',
        icon: 'lucideFileSpreadsheet',
        section: 'modules',
        capability: 'invoicing',
    },
    auditHistory: {
        path: '/administration/audit-history',
        label: 'auditHistory',
        icon: 'lucideHistory',
        section: 'administration',
        permissions: ['settings.manage'],
    },
    backgroundJobs: {
        path: '/administration/background-jobs',
        label: 'backgroundJobs',
        icon: 'lucideClock3',
        section: 'administration',
        permissions: ['settings.manage'],
        administratorOnly: true,
    },
    operations: {
        path: '/administration/system-health',
        label: 'systemHealth',
        icon: 'lucideActivity',
        section: 'administration',
        permissions: ['settings.manage', 'jobs.trigger'],
    },
    apiKeys: {
        path: '/administration/api-keys',
        label: 'apiKeys',
        icon: 'lucideKeyRound',
        section: 'administration',
        permissions: ['api-keys.manage'],
    },
    paymentMethods: {
        path: '/administration/payment-methods',
        label: 'paymentMethods',
        icon: 'lucideCreditCard',
        section: 'administration',
        permissions: ['settings.manage'],
        administratorOnly: true,
    },
    license: {
        path: '/administration/license',
        label: 'commercialBilling',
        icon: 'lucideDollarSign',
        section: 'administration',
        permissions: ['commercial-billing.read'],
    },
    commercialBilling: {
        path: '/administration/commercial-billing',
        label: 'commercialBillingSettings',
        icon: 'lucideCreditCard',
        section: 'modules',
        permissions: ['settings.manage'],
        capability: 'commercial-billing',
        administratorOnly: true,
    },
};
export const supportDestinations = {
    contact: {
        path: '/support/contact',
        label: 'contact',
        icon: 'lucideMail',
        permissions: ['contact.manage'],
        capability: 'support',
    },
    tickets: workspaceDestinations.support,
};
export const userManagementDestinations = {
    users: {
        path: '/user-management/users',
        label: 'users',
        icon: 'lucideUsersRound',
        permissions: ['users.read'],
    },
    invitations: {
        path: '/user-management/invitations',
        label: 'invitations',
        icon: 'lucideMail',
        permissions: ['users.manage'],
    },
    roles: {
        path: '/user-management/roles',
        label: 'roles',
        icon: 'lucideShieldCheck',
        permissions: ['roles.manage'],
    },
    accountSecurity: {
        path: '/user-management/account-security',
        label: 'security',
        icon: 'lucideShieldCheck',
        permissions: ['settings.manage'],
    },
    registrationRequests: {
        path: '/user-management/registration-requests',
        label: 'registrationRequests',
        icon: 'lucideUsersRound',
        permissions: ['settings.manage'],
        administratorOnly: true,
    },
    privacyRequests: {
        path: '/user-management/privacy-requests',
        label: 'privacyRequests',
        icon: 'lucideShieldCheck',
        permissions: ['settings.manage'],
        administratorOnly: true,
    },
};
export function destinationAvailable(destination, auth, features) {
    return (!auth.access()?.setupRequired &&
        (!destination.administratorOnly || auth.access()?.isAdministrator === true) &&
        (!destination.permissions ||
            destination.permissions.some((permission) => auth.has(permission))) &&
        (!destination.capability || features.enabled(destination.capability)));
}
export function destinationVisibleInNavigation(destination, auth, features) {
    return (destinationAvailable(destination, auth, features) &&
        (!destination.navigationCapability || features.enabled(destination.navigationCapability)));
}
export const destinationGuard = (destination) => async (_route, state) => {
    const auth = inject(Auth);
    const features = inject(Features);
    const router = inject(Router);
    if (!auth.access() && !(await auth.refresh()))
        return router.createUrlTree(['/login']);
    await features.load();
    if (destination.capability && !features.enabled(destination.capability))
        return router.createUrlTree(['/module-unavailable'], {
            queryParams: {
                returnUrl: state.url,
                reason: features.state() === 'error' ? 'error' : 'disabled',
            },
        });
    return (destinationAvailable(destination, auth, features) || router.createUrlTree(['/forbidden']));
};

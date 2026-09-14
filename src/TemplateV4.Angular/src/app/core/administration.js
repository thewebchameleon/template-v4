import { FOUNDATION_FEATURES } from './feature-extensions';
import { administrationDestinations, destinationAvailable } from './destinations';
import { Injectable, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from './auth';
import { Features } from './features';
import * as i0 from "@angular/core";
export class AdministrationNavigation {
    extensions = inject(FOUNDATION_FEATURES);
    auth = inject(Auth);
    features = inject(Features);
    links = computed(() => [
        ...Object.values(administrationDestinations),
        ...this.extensions.flatMap((x) => x.destinations ?? []).filter((x) => x.section),
    ].filter((item) => destinationAvailable(item, this.auth, this.features)), /* @ts-ignore */
    ...(ngDevMode ? [{ debugName: "links" }] : /* istanbul ignore next */ []));
    static ɵfac = function AdministrationNavigation_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AdministrationNavigation)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AdministrationNavigation, factory: AdministrationNavigation.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AdministrationNavigation, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
export const administrationLandingGuard = async (route) => {
    const navigation = inject(AdministrationNavigation);
    const features = inject(Features);
    const router = inject(Router);
    await features.load();
    return router.createUrlTree([navigation.links()[0]?.path ?? '/forbidden'], {
        queryParams: route.queryParams,
        fragment: route.fragment ?? undefined,
    });
};
export const peopleLandingGuard = (route) => {
    const auth = inject(Auth);
    const router = inject(Router);
    if (auth.has('users.read'))
        return true;
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

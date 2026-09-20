import { FOUNDATION_FEATURES } from './feature-extensions';
import {
  administrationDestinations,
  destinationVisibleInNavigation,
  type Destination,
} from './destinations';
import { Injectable, computed, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { Features } from './features';

@Injectable({ providedIn: 'root' })
export class AdministrationNavigation {
  private readonly extensions = inject(FOUNDATION_FEATURES);
  private readonly auth = inject(Auth);
  private readonly features = inject(Features);
  readonly links = computed<readonly Destination[]>(() =>
    [
      ...Object.values(administrationDestinations),
      ...this.extensions.flatMap((x) => x.destinations ?? []).filter((x) => x.section),
    ].filter((item) => destinationVisibleInNavigation(item, this.auth, this.features)),
  );
}

export const administrationLandingGuard: CanActivateFn = async (route, state) => {
  const navigation = inject(AdministrationNavigation);
  const features = inject(Features);
  const router = inject(Router);
  await features.load();
  if (features.state() === 'error')
    return router.createUrlTree(['/module-unavailable'], {
      queryParams: { returnUrl: state.url, reason: 'error' },
    });
  const destination = navigation.links().find((item) => item.section === 'administration');
  return router.createUrlTree([destination?.path ?? '/forbidden'], {
    queryParams: route.queryParams,
    fragment: route.fragment ?? undefined,
  });
};

export const peopleLandingGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const path = auth.has('users.read')
    ? '/user-management/users'
    : auth.has('users.manage')
      ? '/user-management/invitations'
      : auth.has('roles.manage')
        ? '/user-management/roles'
        : auth.has('settings.manage')
          ? '/user-management/account-security'
          : '/forbidden';

  return router.createUrlTree([path], {
    queryParams: route.queryParams,
    fragment: route.fragment ?? undefined,
  });
};

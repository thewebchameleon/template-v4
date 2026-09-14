import { FOUNDATION_FEATURES } from './feature-extensions';
import { administrationDestinations, destinationAvailable } from './destinations';
import { Injectable, computed, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';
import { Features } from './features';

@Injectable({ providedIn: 'root' })
export class AdministrationNavigation {
  private readonly extensions = inject(FOUNDATION_FEATURES);
  private readonly auth = inject(Auth);
  private readonly features = inject(Features);
  readonly links = computed(() =>
    [
      ...Object.values(administrationDestinations),
      ...this.extensions.flatMap((x) => x.destinations ?? []).filter((x) => x.section),
    ].filter((item) => destinationAvailable(item, this.auth, this.features)),
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

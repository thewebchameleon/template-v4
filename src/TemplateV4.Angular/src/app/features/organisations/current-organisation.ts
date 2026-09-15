import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CustomerHome } from '../../api/models';
import { WorkspaceApi } from '../../core/workspace-api';

// Read the account preference on module entry, including visits from other devices.
export const currentOrganisationGuard: CanActivateFn = async (route) => {
  const api = inject(WorkspaceApi);
  const router = inject(Router);
  const home = await api.get<CustomerHome>('customers/');
  return home.currentOrganisationId
    ? router.createUrlTree([
        '/organisations',
        home.currentOrganisationId,
        ...route.queryParamMap.get('module')!.split('/'),
      ])
    : true;
};

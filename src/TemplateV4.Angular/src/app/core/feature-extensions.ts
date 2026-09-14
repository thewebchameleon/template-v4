import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';
import { Destination } from './destinations';

export interface FoundationFeature {
  id: string;
  moduleIcon?: string;
  routes: Routes;
  destinations?: readonly Destination[];
  organisationDestinations?: readonly Destination[];
  organisationLinks?: readonly { segment: string; label: string; capability: string }[];
  crmDealActions?: readonly { segment: string; label: string; capability: string }[];
  translations?: Record<string, [string, string]>;
}
export const FOUNDATION_FEATURES = new InjectionToken<readonly FoundationFeature[]>(
  'Foundation feature contributions',
  { providedIn: 'root', factory: () => [] },
);

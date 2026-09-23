import type { FoundationFeature } from '../../../../src/TemplateV4.Angular/src/app/core/feature-extensions';
export const commercialBillingFeature: FoundationFeature = {
  id: 'commercial-billing',
  routes: [{
    path: '',
    canMatch: [(_route, segments) => {
      const url = segments.map(segment => segment.path).join('/');
      return url === 'organisation/invoicing' || url.startsWith('organisation/invoicing/');
    }],
    loadChildren: () => import('./invoicing/routes').then(m => m.routes),
  }],
  administrationRoutes: [
    { path: '', canMatch: [(_route, segments) => ["license", "commercial-billing"].some(prefix => { const url = segments.map(segment => segment.path).join('/'); return url === prefix || url.startsWith(prefix + '/'); })], loadChildren: () => import('./routes').then(m => m.administrationRoutes) },
    { path: '', canMatch: [(_route, segments) => { const url = segments.map(segment => segment.path).join('/'); return url === 'invoicing' || url.startsWith('invoicing/'); }], loadChildren: () => import('./invoicing/routes').then(m => m.administrationRoutes) },
  ],
};

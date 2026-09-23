import type { FoundationFeature } from '../../../../src/TemplateV4.Angular/src/app/core/feature-extensions';
export const commercialBillingFeature: FoundationFeature = { id: 'commercial-billing', routes: [],
administrationRoutes: [{ path: '', canMatch: [(_route, segments) => ["license","commercial-billing"].some(prefix => { const url = segments.map(segment => segment.path).join('/'); return url === prefix || url.startsWith(prefix + '/'); })], loadChildren: () => import('./routes').then(m => m.administrationRoutes) }] };

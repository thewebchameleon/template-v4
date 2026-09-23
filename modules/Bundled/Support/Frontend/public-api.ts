import type { FoundationFeature } from '../../../../src/TemplateV4.Angular/src/app/core/feature-extensions';
export const supportFeature: FoundationFeature = { id: 'support', routes: [{ path: '', canMatch: [(_route, segments) => ["support"].some(prefix => { const url = segments.map(segment => segment.path).join('/'); return url === prefix || url.startsWith(prefix + '/'); })], loadChildren: () => import('./routes').then(m => m.routes) }],
administrationRoutes: [] };

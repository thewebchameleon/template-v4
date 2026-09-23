import type { FoundationFeature } from '../../../../src/TemplateV4.Angular/src/app/core/feature-extensions';
export const cmsFeature: FoundationFeature = { id: 'cms', routes: [{ path: '', canMatch: [(_route, segments) => ["cms","cms/new","cms/sections","cms/collections/new","cms/collections"].some(prefix => { const url = segments.map(segment => segment.path).join('/'); return url === prefix || url.startsWith(prefix + '/'); })], loadChildren: () => import('./routes').then(m => m.routes) }],
administrationRoutes: [] };

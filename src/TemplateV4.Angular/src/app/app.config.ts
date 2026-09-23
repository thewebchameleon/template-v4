import { businessTranslations } from './core/business-translations';
import { bundledFeatures } from '../bundled-modules.g';
import { unsavedGuard } from './shared/confirmation';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter, RouteReuseStrategy } from '@angular/router';
import { EntityRouteReuseStrategy } from './core/entity-route-reuse';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { routes } from './app.routes';
import { Runtime } from './core/runtime';
import { UiSounds } from './core/ui-sounds';
import { PlatformAppearanceTheme } from './core/platform-appearance';
import { authInterceptor, errorInterceptor } from './core/interceptors';
import { FOUNDATION_FEATURES, FoundationFeature } from './core/feature-extensions';
import { authGuard } from './core/auth';
import { capabilityGuard } from './core/features';
import { dictionary } from './core/translations';
import { provideSpartanHlm } from '@spartan-ng/helm/utils';
export function foundationConfig(features: readonly FoundationFeature[] = []): ApplicationConfig {
  if (new Set(features.map((feature) => feature.id)).size !== features.length)
    throw new Error('Duplicate feature contribution.');
  for (const feature of features) Object.assign(dictionary, feature.translations ?? {});
  return {
    providers: [
      { provide: FOUNDATION_FEATURES, useValue: [...bundledFeatures, ...features] },
      provideBrowserGlobalErrorListeners(),
      provideSpartanHlm(),
      provideRouter([
        ...features.flatMap((feature) =>
          feature.routes.map((route) => ({
            ...route,
            canDeactivate: route.data?.['protectDraft'] ? [unsavedGuard] : route.canDeactivate,
            canActivate: [
              authGuard,
              ...(route.data?.['capability'] ? [capabilityGuard(route.data['capability'])] : []),
              ...(route.canActivate ?? []),
            ],
          })),
        ),
        ...routes,
      ]),
      { provide: RouteReuseStrategy, useClass: EntityRouteReuseStrategy },
      provideHttpClient(withXhr(), withInterceptors([errorInterceptor, authInterceptor])),
      provideAppInitializer(() => {
        inject(UiSounds);
        const runtime = inject(Runtime);
        const appearance = inject(PlatformAppearanceTheme);
        return Promise.all([runtime.load().then(() => appearance.load()), Promise.resolve(businessTranslations({} as never, {} as never)), import('../../../../modules/Bundled/FileStorage/Frontend/file-storage-translations').then(m => Object.assign(dictionary, m.fileStorageDictionary))]).then(() => undefined);
      }),
    ],
  };
}
export const appConfig = foundationConfig();

import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { routes } from './app.routes';
import { Runtime } from './core/runtime';
import { PlatformAppearanceTheme } from './core/platform-appearance';
import { authInterceptor, errorInterceptor } from './core/interceptors';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withXhr(), withInterceptors([errorInterceptor, authInterceptor])),
    provideAppInitializer(() => {
      const runtime = inject(Runtime);
      const appearance = inject(PlatformAppearanceTheme);
      return runtime.load().then(() => appearance.load());
    }),
  ],
};

import { ApplicationConfig } from "@angular/core";
import {
  provideClientHydration,
  withEventReplay,
} from "@angular/platform-browser";
import { provideHttpClient, withFetch } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { Page } from "./page";
import { pageResolver } from "./site";
export const config: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideRouter([
      {
        path: "**",
        component: Page,
        resolve: { page: pageResolver },
        runGuardsAndResolvers: "always",
      },
    ]),
  ],
};

import {
  BootstrapContext,
  bootstrapApplication,
} from "@angular/platform-browser";
import { mergeApplicationConfig } from "@angular/core";
import { provideServerRendering, withRoutes, RenderMode } from "@angular/ssr";
import { App } from "./app/app";
import { config } from "./app/app.config";
export default (context: BootstrapContext) =>
  bootstrapApplication(
    App,
    mergeApplicationConfig(config, {
      providers: [
        provideServerRendering(
          withRoutes([{ path: "**", renderMode: RenderMode.Server }]),
        ),
      ],
    }),
    context,
  );

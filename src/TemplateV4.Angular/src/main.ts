import { bootstrapApplication } from '@angular/platform-browser';
import { foundationConfig } from './app/app.config';
import { businessFeatures } from './business-modules.g';
import { App } from './app/app';

bootstrapApplication(App, foundationConfig(businessFeatures)).catch((err) => console.error(err));

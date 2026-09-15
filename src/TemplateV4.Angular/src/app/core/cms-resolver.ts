import { ResolveFn } from '@angular/router';
import { dictionary } from './translations';
export const cmsTranslations: ResolveFn<void> = async () => {
  const translations = await import('./cms-translations');
  Object.assign(dictionary, translations.cmsDictionary);
};

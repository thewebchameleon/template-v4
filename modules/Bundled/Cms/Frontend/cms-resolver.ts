import { ResolveFn } from '@angular/router';
import { dictionary } from '../../../../src/TemplateV4.Angular/src/app/core/translations';
export const cmsTranslations: ResolveFn<void> = async () => {
  const translations = await import('./cms-translations');
  Object.assign(dictionary, translations.cmsDictionary);
};

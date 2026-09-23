import { ResolveFn } from '@angular/router';
import { dictionary } from '../../../../../src/TemplateV4.Angular/src/app/core/translations';
export const contactTranslations: ResolveFn<void> = async () => {
  Object.assign(dictionary, (await import('./contact-translations')).contactDictionary);
};

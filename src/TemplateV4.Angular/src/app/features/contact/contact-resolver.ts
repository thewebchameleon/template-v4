import { ResolveFn } from '@angular/router';
import { dictionary } from '../../core/translations';
export const contactTranslations: ResolveFn<void> = async () => {
  Object.assign(dictionary, (await import('./contact-translations')).contactDictionary);
};

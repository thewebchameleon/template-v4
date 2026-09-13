import { ResolveFn } from '@angular/router';
import { dictionary } from './translations';
export const supportTranslations: ResolveFn<void> = async () => {
  const translations = await import('./support-translations');
  Object.assign(dictionary, translations.supportDictionary);
};

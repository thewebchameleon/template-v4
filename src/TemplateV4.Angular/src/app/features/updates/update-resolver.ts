import { ResolveFn } from '@angular/router';
import { dictionary } from '../../core/translations';
export const updateTranslations: ResolveFn<void> = async () => {
  const translations = await import('./update-translations');
  Object.assign(dictionary, translations.updateDictionary);
};

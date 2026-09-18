import { ResolveFn } from '@angular/router';
import { dictionary } from '../../core/translations';

export const backgroundJobTranslations: ResolveFn<void> = async () => {
  const translations = await import('./background-job-translations');
  Object.assign(dictionary, translations.backgroundJobDictionary);
};

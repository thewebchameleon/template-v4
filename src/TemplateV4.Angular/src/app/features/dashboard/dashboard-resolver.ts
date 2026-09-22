import { ResolveFn } from '@angular/router';
import { dictionary } from '../../core/translations';
export const dashboardTranslations: ResolveFn<void> = async () => {
  const translations = await import('./dashboard-translations');
  Object.assign(dictionary, translations.dashboardDictionary);
};

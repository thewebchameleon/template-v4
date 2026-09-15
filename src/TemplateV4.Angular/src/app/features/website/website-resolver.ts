import { ResolveFn } from '@angular/router';
import { dictionary } from '../../core/translations';
export const websiteTranslations: ResolveFn<void> = async () => {
  Object.assign(dictionary, (await import('./website-translations')).websiteDictionary);
};

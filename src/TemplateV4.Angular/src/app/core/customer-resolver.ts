import { ResolveFn } from '@angular/router';
import { dictionary } from './translations';

export const customerTranslations: ResolveFn<boolean> = async () => {
  Object.assign(dictionary, (await import('./customer-translations')).customerDictionary);
  return true;
};

import { ResolveFn } from '@angular/router';
import { dictionary } from './translations';
export const businessTranslations: ResolveFn<boolean> = async () => {
  Object.assign(dictionary, (await import('./business-dictionary')).businessDictionary);
  return true;
};

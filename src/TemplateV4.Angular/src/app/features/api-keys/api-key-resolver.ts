import { ResolveFn } from '@angular/router';
import { dictionary } from '../../core/translations';

export const apiKeyTranslations: ResolveFn<void> = async () => {
  Object.assign(dictionary, (await import('./api-key-translations')).apiKeyDictionary);
};

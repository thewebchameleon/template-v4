import { ResolveFn } from '@angular/router';
import { dictionary } from '../../core/translations';

export const privateModuleTranslations: ResolveFn<void> = async () => {
  Object.assign(
    dictionary,
    (await import('./private-module-translations')).privateModuleDictionary,
  );
};

import { ResolveFn } from '@angular/router';
import { dictionary } from '../../core/translations';
export const moduleSettingsTranslations: ResolveFn<void> = async () => {
  Object.assign(
    dictionary,
    (await import('./module-settings-translations')).moduleSettingsDictionary,
  );
};

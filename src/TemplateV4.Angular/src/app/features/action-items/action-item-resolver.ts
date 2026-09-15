import { ResolveFn } from '@angular/router';
import { dictionary } from '../../core/translations';
export const actionItemTranslations: ResolveFn<void> = async () => {
  const translations = await import('./action-item-translations');
  Object.assign(dictionary, translations.actionItemDictionary);
};

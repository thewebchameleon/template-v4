import { dictionary } from '../../core/translations';
export const supportTranslations = async () => {
    const translations = await import('./support-translations');
    Object.assign(dictionary, translations.supportDictionary);
};

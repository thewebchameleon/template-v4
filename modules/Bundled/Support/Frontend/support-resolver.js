import { dictionary } from '../../../../src/TemplateV4.Angular/src/app/core/translations';
export const supportTranslations = async () => {
    const translations = await import('./support-translations');
    Object.assign(dictionary, translations.supportDictionary);
};

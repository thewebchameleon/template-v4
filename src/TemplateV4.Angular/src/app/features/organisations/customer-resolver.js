import { dictionary } from '../../core/translations';
export const customerTranslations = async () => {
    Object.assign(dictionary, (await import('./customer-translations')).customerDictionary);
    return true;
};

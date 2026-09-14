import { dictionary } from './translations';
export const customerTranslations = async () => {
    Object.assign(dictionary, (await import('./customer-translations')).customerDictionary);
    return true;
};

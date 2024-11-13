import { EventCategories } from '@/constants/EventCategories';
import { getTranslations, TranslatorType } from '@/i18n';

export const formatEventCategories = (categories: EventCategories[]): string => {
    const t: TranslatorType = getTranslations('de');

    const translated = categories.map((category) => {
        return t(`event.category.${category}`);
    });

    return translated.join(", ");
};
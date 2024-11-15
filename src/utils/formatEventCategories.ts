import { EventCategories } from '@/constants/EventCategories';
import { getTranslations } from '@/i18n';

export const formatEventCategories = async (categories: EventCategories[]): Promise<string> => {
    const t = await getTranslations('de'); // Await the async translator function

    const translated = categories.map((category) => {
        return t(`event.category.${category}`);
    });

    return translated.join(", ");
};

import { EventCategories } from '@/constants/EventCategories';
import { getTranslations } from '@/i18n';

export const formatEventCategories = async (categories: EventCategories[]): Promise<string> => {
    const t = await getTranslations('de'); // Await the async translator function

    const translated = categories.map((category) => {
        return t(`event.category.${category}`);
    });

    return translated.join(", ");
};

export const formatEventCategory = async (category: EventCategories): Promise<string> => {
    const t = await getTranslations('de'); // Await the async translator function
    return t(`event.category.${category}`);
};

export const formatEventCategoriesSync = (categories: EventCategories[]): string => {
    const staticTranslations = {
        "lunch": "Business Lunch",
        "business": "Corporate Event",
        "meeting": "Meeting",
        "conference": "Konferenz"
    };

    const translated = categories.map((category) => {
        return staticTranslations[category];
    });

    return translated.join(", ");
};

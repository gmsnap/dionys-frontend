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
    if (!categories || categories.length === 0) {
        return "-";
    }
    const staticTranslations = {
        "business": "Business",
        "social": "Social",
    };

    const translated = categories
        .map((category) => staticTranslations[category])
        .filter((translation) => translation);

    return translated.length > 0 ? translated.join(", ") : "-";
};

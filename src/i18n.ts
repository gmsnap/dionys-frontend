import { createTranslator } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';

// Define a type for our messages
type Messages = AbstractIntlMessages;

export async function getTranslations(locale: string) {
    const messages: Messages = (await import(`@/locales/${locale}.json`)).default;
    return createTranslator({ locale, messages });
}

// Export the async Translator type
export type TranslatorType = ReturnType<typeof createTranslator>;
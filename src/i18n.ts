import { createTranslator } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';

// Define a type for our messages
type Messages = AbstractIntlMessages;

export function getTranslations(locale: string) {
    const messages: Messages = require(`@/locales/${locale}.json`);
    return createTranslator({ locale, messages });
}

// Export the Translator type
export type TranslatorType = ReturnType<typeof getTranslations>;
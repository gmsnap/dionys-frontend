import { createTranslator } from 'next-intl';
import type { AbstractIntlMessages } from 'next-intl';

// Define a type for our messages
type Messages = AbstractIntlMessages;

export function getTranslations(locale: string) {
  let messages: Messages;
  try {
    messages = require(`@/locales/${locale}.json`);
  } catch (error) {
    console.error(`Failed to load messages for locale ${locale}`, error);
    messages = {};
  }
  return createTranslator({ locale, messages });
}

export type TranslatorType = ReturnType<typeof getTranslations>;

// Add a function to get available locales
export function getAvailableLocales(): string[] {
  return ['de']; // Add your supported locales here
}
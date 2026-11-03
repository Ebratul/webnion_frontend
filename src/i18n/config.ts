export const LOCALES = ['en', 'bn'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';
export const LOCALE_COOKIE = 'locale';

export const isLocale = (value: string): value is Locale => (LOCALES as readonly string[]).includes(value);

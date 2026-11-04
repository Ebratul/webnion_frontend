import type { Locale } from '@/i18n/config';

const intlLocale = (locale: Locale) => (locale === 'bn' ? 'bn-BD' : 'en-US');

export const formatPrice = (amount: number, currency: string, locale: Locale) =>
  new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).format(amount);

export const formatScore = (score: number, locale: Locale) =>
  new Intl.NumberFormat(intlLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(score);

export const formatDate = (date: string, locale: Locale) =>
  new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date));

export const formatNumber = (value: number, locale: Locale) => new Intl.NumberFormat(intlLocale(locale)).format(value);

export const formatDayMonth = (date: string, locale: Locale) => {
  const parts = new Intl.DateTimeFormat(intlLocale(locale), { day: '2-digit', month: 'short', timeZone: 'UTC' }).formatToParts(new Date(date));
  return { day: parts.find((part) => part.type === 'day')?.value ?? '', month: parts.find((part) => part.type === 'month')?.value ?? '' };
};

const BENGALI_ZERO = '০'.charCodeAt(0);

export const toAsciiDigits = (value: string) =>
  value.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - BENGALI_ZERO));

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

const BENGALI_ZERO = '০'.charCodeAt(0);

export const toAsciiDigits = (value: string) =>
  value.replace(/[০-৯]/g, (digit) => String(digit.charCodeAt(0) - BENGALI_ZERO));

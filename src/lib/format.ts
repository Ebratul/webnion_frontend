import type { Locale } from '@/i18n/config';

const intlLocale = (locale: Locale) => (locale === 'bn' ? 'bn-BD' : 'en-US');

// How the Bangla site shows prices set in dollars. Set under Contact & Links in the admin panel.
export interface TakaPrices {
  showTakaInBangla: boolean;
  usdToBdt: number;
  roundTo: number;
}

export const DEFAULT_TAKA_PRICES: TakaPrices = { showTakaInBangla: true, usdToBdt: 122, roundTo: 100 };

// A dollar price becomes Taka on the Bangla site at the admin's rate, rounded so it reads like a real price (24,300, not
// 24,278). Other currencies, and the English site, are left as they are.
export const localPrice = (amount: number, currency: string, locale: Locale, taka?: TakaPrices) => {
  if (locale === 'bn' && taka?.showTakaInBangla && currency.toUpperCase() === 'USD' && taka.usdToBdt > 0) {
    const step = Math.max(1, taka.roundTo);
    return { amount: Math.round((amount * taka.usdToBdt) / step) * step, currency: 'BDT' };
  }
  return { amount, currency };
};

export const formatPriceParts = (amount: number, currency: string, locale: Locale) => {
  const parts = new Intl.NumberFormat(intlLocale(locale), {
    style: 'currency',
    currency,
    currencyDisplay: 'narrowSymbol',
    maximumFractionDigits: 0,
  }).formatToParts(amount);
  const symbolAt = parts.findIndex((part) => part.type === 'currency');
  const numberAt = parts.findIndex((part) => part.type === 'integer');
  return {
    symbol: parts[symbolAt]?.value ?? '',
    amount: parts.filter((part) => part.type !== 'currency' && part.type !== 'literal').map((part) => part.value).join(''),
    // Taka is written ৳ first in Bangladesh, although the Bangla number format puts it last
    symbolFirst: currency === 'BDT' || symbolAt < numberAt,
  };
};

export const formatPrice = (amount: number, currency: string, locale: Locale) => {
  const { symbol, amount: number, symbolFirst } = formatPriceParts(amount, currency, locale);
  return symbolFirst ? `${symbol}${number}` : `${number}${symbol}`;
};

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

import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { REVALIDATE_SECONDS } from './api';
import { buildContact, DEFAULT_BRAND, DEFAULT_CONTACT, DEFAULT_IMAGES } from './site';
import { defaultNavigation, localizeLinks, type NavigationSettings } from './navigation';
import { applyTextOverrides, type TextOverrides } from './siteText';

export interface SiteSettings {
  contact: Partial<typeof DEFAULT_CONTACT> | null;
  images: Partial<typeof DEFAULT_IMAGES> | null;
  brand: Partial<typeof DEFAULT_BRAND> | null;
  homepage: { hidden: string[] } | null;
  navigation: NavigationSettings | null;
  options: SiteOptions | null;
  text: Record<Locale, TextOverrides>;
}

export interface SiteOptions {
  whatsappButton: boolean;
  inquiryEmails: string[];
  budgets: { en: string; bn: string }[];
}

const EMPTY: SiteSettings = { contact: null, images: null, brand: null, homepage: null, navigation: null, options: null, text: { en: {}, bn: {} } };

// Once per render, however many components ask
const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const response = await fetch(`${process.env.API_URL}/site-settings`, { next: { revalidate: REVALIDATE_SECONDS, tags: ['site'] } });
    if (!response.ok) throw new Error(`Site settings API responded with ${response.status}`);
    const body: { data: SiteSettings } = await response.json();
    return body.data;
  } catch (error) {
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return EMPTY;
    // As with the homepage data: throwing keeps the last good page, instead of caching one without the admin's edits
    throw error;
  }
});

export const getSiteDictionary = cache(async (locale: Locale) => {
  const settings = await getSettings();
  const dictionary = applyTextOverrides(getDictionary(locale), settings.text[locale]);
  // The budget choices are a list the admin sets under Contact & Links, so they can be added and removed, not only renamed
  const budgets = settings.options?.budgets;
  if (!budgets?.length) return dictionary;
  return { ...dictionary, contactPage: { ...dictionary.contactPage, form: { ...dictionary.contactPage.form, budgets: budgets.map((budget) => budget[locale] || budget.en) } } };
});

export const getContact = cache(async () => buildContact({ ...DEFAULT_CONTACT, ...(await getSettings()).contact }));

export const getSiteImages = cache(async () => ({ ...DEFAULT_IMAGES, ...(await getSettings()).images }));

export const getBrand = cache(async () => ({ ...DEFAULT_BRAND, ...(await getSettings()).brand }));

// The admin panel must open even when the API cannot be reached, so it falls back to the original brand
export const getBrandOrDefault = async () => getBrand().catch(() => DEFAULT_BRAND);

export const getOptions = cache(async () => ({ whatsappButton: true, ...(await getSettings()).options }));

// Saved menus, or the ones the site showed before, in the current language
export const getNavigationSettings = cache(async (): Promise<NavigationSettings> => {
  const settings = await getSettings();
  if (settings.navigation) return settings.navigation;
  const [en, bn] = await Promise.all([getSiteDictionary('en'), getSiteDictionary('bn')]);
  return defaultNavigation(en, bn, { ...DEFAULT_CONTACT, ...settings.contact });
});

export const getNavigation = cache(async (locale: Locale) => {
  const navigation = await getNavigationSettings();
  return {
    header: localizeLinks(navigation.header, locale),
    headerButton: localizeLinks([{ label: { en: '', bn: '' }, href: navigation.headerButton.href }], locale)[0]!,
    footerQuick: localizeLinks(navigation.footerQuick, locale),
    footerServices: localizeLinks(navigation.footerServices, locale),
    socials: navigation.socials,
    offices: navigation.offices.map((office) => ({ name: office.name[locale] || office.name.en, address: office.address[locale] || office.address.en })),
  };
});

export type SiteNavigation = Awaited<ReturnType<typeof getNavigation>>;

export const getHiddenSections = cache(async () => new Set((await getSettings()).homepage?.hidden ?? []));

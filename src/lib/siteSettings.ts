import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { cache } from 'react';
import type { Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { REVALIDATE_SECONDS } from './api';
import { buildContact, DEFAULT_CONTACT, DEFAULT_IMAGES } from './site';
import { applyTextOverrides, type TextOverrides } from './siteText';

export interface SiteSettings {
  contact: Partial<typeof DEFAULT_CONTACT> | null;
  images: Partial<typeof DEFAULT_IMAGES> | null;
  text: Record<Locale, TextOverrides>;
}

const EMPTY: SiteSettings = { contact: null, images: null, text: { en: {}, bn: {} } };

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

export const getSiteDictionary = cache(async (locale: Locale) => applyTextOverrides(getDictionary(locale), (await getSettings()).text[locale]));

export const getContact = cache(async () => buildContact({ ...DEFAULT_CONTACT, ...(await getSettings()).contact }));

export const getSiteImages = cache(async () => ({ ...DEFAULT_IMAGES, ...(await getSettings()).images }));

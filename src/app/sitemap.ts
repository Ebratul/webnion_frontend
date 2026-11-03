import type { MetadataRoute } from 'next';
import { LOCALES } from '@/i18n/config';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    changeFrequency: 'weekly',
    priority: 1,
    alternates: { languages: { en: `${SITE_URL}/en`, bn: `${SITE_URL}/bn` } },
  }));
}

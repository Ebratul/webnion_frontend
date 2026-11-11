import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { SiteTextDocument } from './ai';

// The website's built-in text lives in this app's dictionaries, not in the database. At Rebuild the admin panel sends it
// to the API, so the chat assistant can answer from it too.
const SECTIONS: { key: keyof Dictionary; title: string; path: string }[] = [
  { key: 'meta', title: 'About the company', path: '' },
  { key: 'hero', title: 'Homepage introduction', path: '' },
  { key: 'problems', title: 'Problems we solve', path: '' },
  { key: 'services', title: 'Services overview', path: '#services' },
  { key: 'outcomes', title: 'Expert insights', path: '' },
  { key: 'process', title: 'How we work', path: '' },
  { key: 'pricing', title: 'Pricing notes', path: '#pricing' },
  { key: 'faq', title: 'Questions and answers', path: '' },
  { key: 'servicePage', title: 'Services page', path: '/service' },
  { key: 'closing', title: 'Working with us', path: '/service' },
  { key: 'teamPage', title: 'Team', path: '/team' },
  { key: 'contactPage', title: 'Contact page', path: '/contact' },
  { key: 'footer', title: 'Company summary', path: '' },
];

const looksLikeCode = (text: string) => /^(https?:\/\/|\/|#)|^[a-z0-9-]+$/.test(text);

const strings = (value: unknown): string[] => {
  if (typeof value === 'string') return value.trim() && !looksLikeCode(value.trim()) ? [value.trim()] : [];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
};

export const siteTextDocuments = (locale: Locale, t: Dictionary, contactLines: string[]): SiteTextDocument[] => [
  ...SECTIONS.map(({ key, title, path }) => ({
    id: String(key),
    title,
    url: `/${locale}${path}`,
    text: [...new Set(strings(t[key]))].join('\n').slice(0, 20_000),
  })).filter((document) => document.text),
  { id: 'contact-details', title: 'Contact details', url: `/${locale}/contact`, text: contactLines.join('\n') },
];

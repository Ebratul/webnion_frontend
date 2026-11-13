import type { Dictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';
import type { LocalizedValue } from './admin/resources';
import type { ContactSettings } from './site';

// The header menu, the footer's link columns, social links and offices, as edited under Menu & Footer.
// Links are stored without the language: /contact becomes /en/contact or /bn/contact, and #pricing the homepage section.

export interface NavLink {
  label: LocalizedValue;
  href: string;
}

export const SOCIAL_NETWORKS = ['facebook', 'instagram', 'linkedin', 'youtube', 'x', 'tiktok', 'whatsapp', 'telegram', 'messenger', 'pinterest', 'threads', 'github', 'behance', 'dribbble', 'website'] as const;
export type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];

export const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  facebook: 'Facebook', instagram: 'Instagram', linkedin: 'LinkedIn', youtube: 'YouTube', x: 'X (Twitter)', tiktok: 'TikTok', whatsapp: 'WhatsApp',
  telegram: 'Telegram', messenger: 'Messenger', pinterest: 'Pinterest', threads: 'Threads', github: 'GitHub', behance: 'Behance', dribbble: 'Dribbble', website: 'Website',
};

export interface NavigationSettings {
  header: NavLink[];
  headerButton: { href: string };
  footerQuick: NavLink[];
  // Company: the business's brands and pages. Settings saved before this column existed have none, so the default fills in.
  footerCompany?: NavLink[];
  footerServices: NavLink[];
  socials: { network: SocialNetwork; url: string }[];
  offices: { name: LocalizedValue; address: LocalizedValue }[];
}

const both = (en: string, bn: string): LocalizedValue => ({ en, bn });

// The Company column until it is edited: the brand, the blog, the team and the privacy policy
export const defaultCompanyLinks = (en: Dictionary, bn: Dictionary, contact: ContactSettings): NavLink[] => [
  { label: both('Webnion', 'Webnion'), href: '/' },
  { label: both(en.blog.crumb, bn.blog.crumb), href: '/blog' },
  { label: both(en.nav.team, bn.nav.team), href: '/team' },
  { label: both(en.footer.privacy, bn.footer.privacy), href: contact.privacy },
];

// What the site showed before anything was saved, built from the current text so earlier edits carry over
export const defaultNavigation = (en: Dictionary, bn: Dictionary, contact: ContactSettings): NavigationSettings => {
  const nav = (key: keyof Dictionary['nav']) => both(en.nav[key], bn.nav[key]);
  return {
    header: [
      { label: nav('services'), href: '/service' },
      { label: nav('portfolio'), href: '/project' },
      { label: nav('products'), href: '/products' },
      { label: nav('pricing'), href: '/pricing' },
      { label: nav('caseStudies'), href: '/case-studies' },
      { label: nav('contact'), href: '/contact' },
      { label: nav('team'), href: '/team' },
    ],
    headerButton: { href: '/contact' },
    footerQuick: [
      { label: nav('portfolio'), href: '/project' },
      { label: nav('products'), href: '/products' },
      { label: nav('pricing'), href: '/pricing' },
    ],
    footerCompany: defaultCompanyLinks(en, bn, contact),
    footerServices: en.footer.serviceLinks.map((service, index) => ({ label: both(service.label, bn.footer.serviceLinks[index]?.label ?? service.label), href: `/services/${service.slug}` })),
    socials: [
      { network: 'facebook', url: contact.facebook },
      { network: 'instagram', url: contact.instagram },
    ],
    offices: [
      { name: both(en.footer.bangladesh, bn.footer.bangladesh), address: both(en.footer.bangladeshAddress, bn.footer.bangladeshAddress) },
      { name: both(en.footer.italy, bn.footer.italy), address: both(en.footer.italyAddress, bn.footer.italyAddress) },
    ],
  };
};

export const isExternal = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

// Turns a stored link into one for the current language
export const resolveHref = (href: string, locale: Locale) => {
  if (href.startsWith('#')) return `/${locale}${href}`;
  if (href.startsWith('/') && !/^\/(en|bn|images|uploads)(\/|$)/.test(href)) return `/${locale}${href === '/' ? '' : href}`;
  return href;
};

export interface ResolvedLink {
  label: string;
  href: string;
  external: boolean;
}

export const localizeLinks = (links: NavLink[], locale: Locale): ResolvedLink[] =>
  links.map((link) => ({ label: link.label[locale] || link.label.en, href: resolveHref(link.href, locale), external: isExternal(link.href) }));

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://webnion.com';

export const CONTACT = {
  email: 'hello@webnion.com',
  phoneLocal: '01774029768',
  phoneBd: '+8801774029768',
  phoneBdLabel: '+880 1774-029768',
  phoneIt: '+393444899827',
  phoneItLabel: '+39 344 489 9827',
  whatsapp: 'https://wa.me/8801774029768',
  facebook: 'https://www.facebook.com/meetwebnion',
  instagram: 'https://www.instagram.com/meetwebnion/',
  privacy: 'https://webnion.net/p/privacy-policy',
};

// Section links carry the locale path so they also work from project and case study pages
export const sectionHref = (locale: string, id: string) => `/${locale}#${id}`;

export const SECTION_IDS = {
  services: 'services',
  portfolio: 'portfolio',
  pricing: 'pricing',
  contact: 'contact',
};

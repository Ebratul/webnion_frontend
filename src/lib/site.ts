export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://webnion.com';

// What an admin can change under Site Settings. These are the values until the first save.
export const DEFAULT_CONTACT = {
  email: 'hello@webnion.com',
  phoneLocal: '01774029768',
  phoneBdLabel: '+880 1774-029768',
  phoneItLabel: '+39 344 489 9827',
  whatsappNumber: '8801774029768',
  facebook: 'https://www.facebook.com/meetwebnion',
  instagram: 'https://www.instagram.com/meetwebnion/',
  privacy: 'https://webnion.com/p/privacy-policy',
};

export const DEFAULT_IMAGES = {
  outcomeFounder: '/images/outcomes/founder.webp',
  outcomeHandover: '/images/outcomes/client-handover.webp',
  outcomeTeam: '/images/outcomes/team-at-work.webp',
};

export type ContactSettings = typeof DEFAULT_CONTACT;
export type ImageSettings = typeof DEFAULT_IMAGES;

const telephone = (label: string) => label.replace(/[\s-]/g, '');

// The links are built from what the admin types, so a number is only ever entered once
export const buildContact = (settings: ContactSettings) => ({
  ...settings,
  phoneBd: telephone(settings.phoneBdLabel),
  phoneIt: telephone(settings.phoneItLabel),
  whatsapp: `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`,
});

export type Contact = ReturnType<typeof buildContact>;

// Section links carry the locale path so they also work from project and case study pages
export const sectionHref = (locale: string, id: string) => `/${locale}#${id}`;

export const SECTION_IDS = {
  services: 'services',
  portfolio: 'portfolio',
  pricing: 'pricing',
  contact: 'contact',
};

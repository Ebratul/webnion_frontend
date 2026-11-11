// The homepage sections in page order, with where each one is edited in the admin panel.
// Hero and Contact cannot be hidden: every "Start Your Project" and "Book" button on the site leads to Contact.
export interface HomeSection {
  key: string;
  label: string;
  description: string;
  textGroup?: string;
  manage?: { href: string; label: string };
  canHide: boolean;
}

export const HOME_SECTIONS: HomeSection[] = [
  { key: 'hero', label: 'Hero', description: 'The first screen: heading, text, button and an optional background image.', textGroup: 'hero', manage: { href: '/admin/hero-backgrounds', label: 'Background Image' }, canHide: false },
  { key: 'trust', label: 'Projects And Client Logos', description: 'The moving project images and the row of client logos.', textGroup: 'trust', manage: { href: '/admin/clients', label: 'Client Logos' }, canHide: true },
  { key: 'problems', label: 'Problems And Chat', description: 'The dark card with the demo chat.', textGroup: 'problems', canHide: true },
  { key: 'services', label: 'Services', description: 'Service cards and their buttons.', textGroup: 'services', manage: { href: '/admin/services', label: 'Services' }, canHide: true },
  { key: 'outcomes', label: 'Expert Insights', description: 'Heading, four points and three photos.', textGroup: 'outcomes', manage: { href: '/admin/settings', label: 'Photos' }, canHide: true },
  { key: 'portfolio', label: 'Portfolio', description: 'The moving project cards. Projects marked Featured appear here.', textGroup: 'projects', manage: { href: '/admin/projects', label: 'Projects' }, canHide: true },
  { key: 'outcomeCards', label: 'Outcome Cards', description: 'The stacking cards with images and buttons.', textGroup: 'outcomeCards', manage: { href: '/admin/outcome-cards', label: 'Cards' }, canHide: true },
  { key: 'testimonials', label: 'Customer Reviews', description: 'Ratings, video reviews and client screenshots.', textGroup: 'testimonials', manage: { href: '/admin/testimonials', label: 'Reviews' }, canHide: true },
  { key: 'delivery', label: 'Delivery Stories', description: 'The moving row of handover photos.', textGroup: 'delivery', manage: { href: '/admin/delivery-stories', label: 'Stories' }, canHide: true },
  { key: 'process', label: 'Process', description: 'The three steps.', textGroup: 'process', canHide: true },
  { key: 'pricing', label: 'Pricing', description: 'Plans and prices. The Pricing link in the menu leads here.', textGroup: 'pricing', manage: { href: '/admin/pricing-plans', label: 'Plans' }, canHide: true },
  { key: 'technologies', label: 'Technologies', description: 'The moving technology cards.', textGroup: 'technologies', manage: { href: '/admin/technologies', label: 'Technologies' }, canHide: true },
  { key: 'faq', label: 'FAQ', description: 'Questions and the call card.', textGroup: 'faq', manage: { href: '/admin/faqs', label: 'Questions' }, canHide: true },
  { key: 'contact', label: 'Contact', description: 'The closing panel with the WhatsApp and inquiry buttons.', textGroup: 'inquiry', manage: { href: '/admin/settings', label: 'Contact Details' }, canHide: false },
];

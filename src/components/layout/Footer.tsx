import { Mail, MapPin, Phone, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS, sectionHref, type BrandSettings, type Contact } from '@/lib/site';
import { FacebookIcon, InstagramIcon } from '../ui/BrandIcons';
import { Logo } from './Logo';

interface FooterProps {
  locale: Locale;
  t: Dictionary['footer'];
  nav: Dictionary['nav'];
  label: string;
  contact: Contact;
  brand: BrandSettings;
}

// Bright in both themes. Under the pointer: pure white in dark mode, the full brand purple in light mode.
const textClass = 'text-fg/85 dark:text-white/85';
const linkHover = 'hover:text-primary dark:hover:text-white';
const linkClass = `inline-flex min-h-6 min-w-6 items-center text-sm ${textClass} transition-colors duration-200 ${linkHover}`;
const navLinkClass = `footer-link ${linkClass} py-0.5`;
const headingClass = 'text-sm font-semibold text-fg';

const ContactItem = ({ Icon, label, children }: { Icon: LucideIcon; label: string; children: ReactNode }) => (
  <li className="flex gap-3.5">
    <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-tint text-accent">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0">
      <p className={headingClass}>{label}</p>
      <div className={`mt-1 text-sm leading-6 ${textClass}`}>{children}</div>
    </div>
  </li>
);

export const Footer = ({ locale, t, nav, label, contact, brand }: FooterProps) => {
  const socials = [
    { href: contact.facebook, name: 'Facebook', Icon: FacebookIcon },
    { href: contact.instagram, name: 'Instagram', Icon: InstagramIcon },
  ];

  return (
    <footer className="site-footer border-t border-line bg-[#faf2e6] dark:bg-surface">
      <div className="container-page">
        <div className="grid gap-10 pt-14 pb-10 md:grid-cols-2 lg:grid-cols-[1.35fr_1.15fr_1fr] lg:gap-x-12">
          <div className="md:col-span-2 lg:col-span-1">
            <Logo locale={locale} brand={brand} />
            <p className={`mt-5 max-w-xs text-sm ${textClass}`}>{t.about}</p>
            <ul className="mt-6 flex gap-2.5">
              {socials.map(({ href, name, Icon }) => (
                <li key={name}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={name}
                    className="grid size-10 place-items-center rounded-full border border-line text-fg transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-white"
                  >
                    <Icon className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label={label}>
            <h2 className={headingClass}>{t.quickLinks}</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-5 gap-y-2.5">
              <li><Link href={`/${locale}/project`} className={navLinkClass}>{nav.portfolio}</Link></li>
              <li><Link href={`/${locale}/case-studies`} className={navLinkClass}>{nav.caseStudies}</Link></li>
              <li><Link href={`/${locale}/products`} className={navLinkClass}>{nav.products}</Link></li>
              <li><Link href={`/${locale}/team`} className={navLinkClass}>{nav.team}</Link></li>
              <li><Link href={sectionHref(locale, SECTION_IDS.pricing)} className={navLinkClass}>{nav.pricing}</Link></li>
              <li><Link href={`/${locale}/contact`} className={navLinkClass}>{nav.contact}</Link></li>
            </ul>
          </nav>

          <div>
            <h2 className={headingClass}>{t.services}</h2>
            <ul className="mt-5 space-y-2.5">
              {t.serviceLinks.map((service) => (
                <li key={service.slug}><Link href={`/${locale}/services/${service.slug}`} className={navLinkClass}>{service.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-line pb-10 pt-9">
          <h2 className="sr-only">{t.contact}</h2>
          <address className="not-italic">
            <ul className="grid gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
              <ContactItem Icon={MapPin} label={t.bangladesh}>
                <p>{t.bangladeshAddress}</p>
              </ContactItem>
              <ContactItem Icon={MapPin} label={t.italy}>
                <p translate="no">{t.italyAddress}</p>
              </ContactItem>
              <ContactItem Icon={Phone} label={t.callUs}>
                <span className="flex flex-col items-start">
                  <a href={`tel:${contact.phoneBd}`} dir="ltr" className={linkClass}>{contact.phoneBdLabel}</a>
                  <a href={`tel:${contact.phoneIt}`} dir="ltr" className={linkClass}>{contact.phoneItLabel}</a>
                </span>
              </ContactItem>
              <ContactItem Icon={Mail} label={t.email}>
                <a href={`mailto:${contact.email}`} className={`${linkClass} [overflow-wrap:anywhere]`}>{contact.email}</a>
              </ContactItem>
            </ul>
          </address>
        </div>

        <div aria-hidden translate="no" className="footer-mark-box">
          <span className="footer-mark" style={{ fontSize: `${Math.min(23.4, (23.4 * 7) / Math.max(brand.siteName.length, 1)).toFixed(2)}cqw` }}>{brand.siteName}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line py-6 pr-16 text-xs text-fg/80 xl:pr-0 dark:text-white/80">
          <p>© {new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US', { useGrouping: false }).format(2026)} {t.rights}</p>
          <a href={contact.privacy} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-6 items-center transition-colors duration-200 ${linkHover}`}>{t.privacy}</a>
          <p>{t.madeIn}</p>
        </div>
      </div>
    </footer>
  );
};

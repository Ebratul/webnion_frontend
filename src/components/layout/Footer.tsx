import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { CONTACT, SECTION_IDS, sectionHref } from '@/lib/site';
import { FacebookIcon, InstagramIcon } from '../ui/BrandIcons';
import { Logo } from './Logo';

interface FooterProps {
  locale: Locale;
  t: Dictionary['footer'];
  nav: Dictionary['nav'];
  label: string;
}

const linkClass = 'text-sm text-muted transition-colors duration-200 hover:text-accent';
const headingClass = 'text-sm font-semibold text-fg';

export const Footer = ({ locale, t, nav, label }: FooterProps) => {
  const socials = [
    { href: CONTACT.facebook, name: 'Facebook', Icon: FacebookIcon },
    { href: CONTACT.instagram, name: 'Instagram', Icon: InstagramIcon },
  ];

  return (
    <footer className="bg-surface">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_1.1fr_1.5fr]">
        <div>
          <Logo locale={locale} />
          <p className="mt-5 max-w-xs text-sm text-muted">{t.about}</p>
          <ul className="mt-5 flex gap-2">
            {socials.map(({ href, name, Icon }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="grid size-10 place-items-center rounded-xl bg-tint text-accent transition-colors duration-200 hover:bg-primary hover:text-white"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label={label}>
          <h2 className={headingClass}>{t.quickLinks}</h2>
          <ul className="mt-4 space-y-2.5">
            <li><Link href={`/${locale}/project`} className={linkClass}>{nav.portfolio}</Link></li>
            <li><Link href={`/${locale}/products`} className={linkClass}>{nav.products}</Link></li>
            <li><Link href={sectionHref(locale, SECTION_IDS.pricing)} className={linkClass}>{nav.pricing}</Link></li>
            <li><Link href={`/${locale}/case-studies`} className={linkClass}>{nav.caseStudies}</Link></li>
            <li><Link href={sectionHref(locale, SECTION_IDS.team)} className={linkClass}>{nav.team}</Link></li>
            <li><a href={CONTACT.privacy} target="_blank" rel="noopener noreferrer" className={linkClass}>{t.privacy}</a></li>
          </ul>
        </nav>

        <div>
          <h2 className={headingClass}>{t.services}</h2>
          <ul className="mt-4 space-y-2.5">
            {t.serviceLinks.map((service) => (
              <li key={service.slug}><Link href={`/${locale}/services/${service.slug}`} className={linkClass}>{service.label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={headingClass}>{t.contact}</h2>
          <address className="mt-4 space-y-3 not-italic">
            <p className="flex gap-3 text-sm text-muted">
              <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
              <span><strong className="font-medium text-fg">{t.bangladesh}:</strong> {t.bangladeshAddress}</span>
            </p>
            <p className="flex gap-3 text-sm text-muted">
              <MapPin aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
              <span translate="no"><strong className="font-medium text-fg">{t.italy}:</strong> {t.italyAddress}</span>
            </p>
            <p className="flex items-start gap-3">
              <Phone aria-hidden className="mt-1 size-4 shrink-0 text-accent" />
              <span className="flex flex-col">
                <a href={`tel:${CONTACT.phoneBd}`} dir="ltr" className={linkClass}>{CONTACT.phoneBdLabel}</a>
                <a href={`tel:${CONTACT.phoneIt}`} dir="ltr" className={linkClass}>{CONTACT.phoneItLabel}</a>
              </span>
            </p>
            <p className="flex items-center gap-3">
              <Mail aria-hidden className="size-4 shrink-0 text-accent" />
              <a href={`mailto:${CONTACT.email}`} className={linkClass}>{CONTACT.email}</a>
            </p>
          </address>
        </div>
      </div>
      <div className="container-page">
        <p className="border-t border-line py-6 text-center text-xs text-muted">
          © {new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US', { useGrouping: false }).format(2026)} {t.rights}
        </p>
      </div>
    </footer>
  );
};

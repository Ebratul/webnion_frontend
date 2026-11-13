import { Mail, MapPin, Phone, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { BrandSettings, Contact } from '@/lib/site';
import { SOCIAL_LABELS, type ResolvedLink } from '@/lib/navigation';
import type { SiteNavigation } from '@/lib/siteSettings';
import { SocialIcon } from '../ui/SocialIcon';
import { Logo } from './Logo';

interface FooterProps {
  locale: Locale;
  t: Dictionary['footer'];
  nav: Dictionary['nav'];
  label: string;
  contact: Contact;
  brand: BrandSettings;
  navigation: SiteNavigation;
}

// Bright in both themes. Under the pointer: pure white in dark mode, the full brand purple in light mode.
const textClass = 'text-fg/85 dark:text-white/85';
const linkHover = 'hover:text-primary dark:hover:text-white';
const linkClass = `inline-flex min-h-6 min-w-6 items-center text-sm ${textClass} transition-colors duration-200 ${linkHover}`;
const navLinkClass = `footer-link ${linkClass} py-0.5`;
const headingClass = 'text-sm font-semibold text-fg';

const FooterLink = ({ link }: { link: ResolvedLink }) => (
  <Link href={link.href} {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={navLinkClass}>{link.label}</Link>
);

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

export const Footer = ({ locale, t, nav, label, contact, brand, navigation }: FooterProps) => {

  return (
    <footer className="site-footer border-t border-line bg-[#faf2e6] dark:bg-surface">
      <div className="container-page">
        <div className="grid gap-10 pt-14 pb-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.85fr_1.1fr] lg:gap-x-10 xl:gap-x-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo locale={locale} brand={brand} />
            <p className={`mt-5 max-w-xs text-sm ${textClass}`}>{t.about}</p>
            <ul className="mt-6 flex gap-2.5">
              {navigation.socials.map(({ network, url }) => (
                <li key={`${network}-${url}`}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={SOCIAL_LABELS[network]}
                    className="grid size-10 place-items-center rounded-full border border-line text-fg transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-white"
                  >
                    <SocialIcon network={network} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label={label}>
            <h2 className={headingClass}>{t.quickLinks}</h2>
            <ul className="mt-5 space-y-2.5">
              {navigation.footerQuick.map((link) => <li key={`${link.href}-${link.label}`}><FooterLink link={link} /></li>)}
            </ul>
          </nav>

          {navigation.footerCompany.length > 0 && (
            <nav aria-label={t.company}>
              <h2 className={headingClass}>{t.company}</h2>
              <ul className="mt-5 space-y-2.5">
                {navigation.footerCompany.map((link) => <li key={`${link.href}-${link.label}`}><FooterLink link={link} /></li>)}
              </ul>
            </nav>
          )}

          <div>
            <h2 className={headingClass}>{t.services}</h2>
            <ul className="mt-5 space-y-2.5">
              {navigation.footerServices.map((link) => <li key={`${link.href}-${link.label}`}><FooterLink link={link} /></li>)}
            </ul>
          </div>
        </div>

        <div className="border-t border-line pb-10 pt-9">
          <h2 className="sr-only">{t.contact}</h2>
          <address className="not-italic">
            <ul className="grid gap-x-5 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
              {navigation.offices.map((office) => (
                <ContactItem key={office.name} Icon={MapPin} label={office.name}>
                  <p>{office.address}</p>
                </ContactItem>
              ))}
              <ContactItem Icon={Phone} label={t.callUs}>
                <span className="flex flex-col items-start">
                  <a href={`tel:${contact.phoneBd}`} dir="ltr" className={linkClass}>{contact.phoneBdLabel}</a>
                  {contact.phoneIt && <a href={`tel:${contact.phoneIt}`} dir="ltr" className={linkClass}>{contact.phoneItLabel}</a>}
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
          <p>© {new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-US', { useGrouping: false }).format(new Date().getFullYear())} {t.rights}</p>
          <a href={contact.privacy} target="_blank" rel="noopener noreferrer" className={`inline-flex min-h-6 items-center transition-colors duration-200 ${linkHover}`}>{t.privacy}</a>
          <p>{t.madeIn}</p>
        </div>
      </div>
    </footer>
  );
};

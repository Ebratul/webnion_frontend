import { Mail, MapPin, Phone, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
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

const linkClass = 'inline-block min-w-6 py-0.5 text-sm text-muted transition-colors duration-200 hover:text-accent';
const navLinkClass = 'footer-link inline-flex min-h-6 min-w-6 items-center py-0.5 text-sm text-muted transition-colors duration-200 hover:text-accent';
const headingClass = 'footer-heading text-sm font-semibold text-fg';

const ContactCard = ({ Icon, label, children }: { Icon: LucideIcon; label: string; children: ReactNode }) => (
  <li className="group flex gap-3 rounded-2xl border border-line bg-white/55 p-3.5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_14px_30px_-20px_var(--accent)] motion-reduce:hover:translate-y-0 dark:bg-white/[0.03]">
    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-xl bg-tint text-accent transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
      <Icon className="size-4" />
    </span>
    <div className="min-w-0">
      <p className="text-[0.6875rem] font-semibold uppercase text-muted [&:lang(en)]:tracking-[0.08em]">{label}</p>
      <div className="mt-1 space-y-1.5 text-sm text-muted">{children}</div>
    </div>
  </li>
);

export const Footer = ({ locale, t, nav, label }: FooterProps) => {
  const socials = [
    { href: CONTACT.facebook, name: 'Facebook', Icon: FacebookIcon },
    { href: CONTACT.instagram, name: 'Instagram', Icon: InstagramIcon },
  ];

  return (
    <footer className="site-footer border-t border-line bg-[#faf2e6] dark:bg-surface">
      <span aria-hidden translate="no" className="footer-mark">Webnion</span>
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
                  className="grid size-10 place-items-center rounded-xl bg-primary text-white transition-[background-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-[0_10px_22px_-10px_var(--primary)] motion-reduce:hover:translate-y-0"
                >
                  <Icon className="size-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label={label} className="footer-column">
          <h2 className={headingClass}>{t.quickLinks}</h2>
          <ul className="mt-5 space-y-1.5">
            <li><Link href={`/${locale}/project`} className={navLinkClass}>{nav.portfolio}</Link></li>
            <li><Link href={`/${locale}/products`} className={navLinkClass}>{nav.products}</Link></li>
            <li><Link href={sectionHref(locale, SECTION_IDS.pricing)} className={navLinkClass}>{nav.pricing}</Link></li>
            <li><Link href={`/${locale}/case-studies`} className={navLinkClass}>{nav.caseStudies}</Link></li>
            <li><Link href={`/${locale}/team`} className={navLinkClass}>{nav.team}</Link></li>
            <li><Link href={`/${locale}/contact`} className={navLinkClass}>{nav.contact}</Link></li>
            <li><a href={CONTACT.privacy} target="_blank" rel="noopener noreferrer" className={navLinkClass}>{t.privacy}</a></li>
          </ul>
        </nav>

        <div className="footer-column">
          <h2 className={headingClass}>{t.services}</h2>
          <ul className="mt-5 space-y-1.5">
            {t.serviceLinks.map((service) => (
              <li key={service.slug}><Link href={`/${locale}/services/${service.slug}`} className={navLinkClass}>{service.label}</Link></li>
            ))}
          </ul>
        </div>

        <div className="footer-column">
          <h2 className={headingClass}>{t.contact}</h2>
          <address className="mt-5 not-italic">
            <ul className="space-y-2.5">
              <ContactCard Icon={MapPin} label={t.location}>
                <p><strong className="font-medium text-fg">{t.bangladesh}:</strong> {t.bangladeshAddress}</p>
                <p translate="no"><strong className="font-medium text-fg">{t.italy}:</strong> {t.italyAddress}</p>
              </ContactCard>
              <ContactCard Icon={Phone} label={t.callUs}>
                <span className="flex flex-col">
                  <a href={`tel:${CONTACT.phoneBd}`} dir="ltr" className={linkClass}>{CONTACT.phoneBdLabel}</a>
                  <a href={`tel:${CONTACT.phoneIt}`} dir="ltr" className={linkClass}>{CONTACT.phoneItLabel}</a>
                </span>
              </ContactCard>
              <ContactCard Icon={Mail} label={t.email}>
                <a href={`mailto:${CONTACT.email}`} className={`${linkClass} [overflow-wrap:anywhere]`}>{CONTACT.email}</a>
              </ContactCard>
            </ul>
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

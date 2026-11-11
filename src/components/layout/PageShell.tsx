import type { ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { getBrand, getContact, getNavigation, getOptions, getSiteDictionary } from '@/lib/siteSettings';
import { ReplayOnNavigate } from '../ui/ReplayOnNavigate';
import { Footer } from './Footer';
import { Header } from './Header';
import { WhatsAppButton } from './WhatsAppButton';

export const PageShell = async ({ locale, children }: { locale: Locale; children: ReactNode }) => {
  const [t, contact, brand, navigation, options] = await Promise.all([getSiteDictionary(locale), getContact(), getBrand(), getNavigation(locale), getOptions()]);

  return (
    <>
      <ReplayOnNavigate />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        {t.a11y.skipToContent}
      </a>
      <Header locale={locale} nav={t.nav} a11y={t.a11y} brand={brand} links={navigation.header} button={navigation.headerButton} />
      <main id="main">{children}</main>
      <Footer locale={locale} t={t.footer} nav={t.nav} label={t.a11y.footerNav} contact={contact} brand={brand} navigation={navigation} />
      {options.whatsappButton && <WhatsAppButton label={t.a11y.whatsapp} href={contact.whatsapp} />}
    </>
  );
};

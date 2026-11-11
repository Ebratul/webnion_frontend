import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { ThemeScript } from '@/components/layout/ThemeScript';
import { LOCALES, isLocale } from '@/i18n/config';
import { fontClasses } from '@/lib/fonts';
import { SITE_URL } from '@/lib/site';
import '../globals.css';
import { BrandStyle } from '@/components/layout/BrandStyle';
import { getBrand, getSiteDictionary } from '@/lib/siteSettings';

export const viewport: Viewport = { themeColor: '#050507' };

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [{ meta }, brand] = await Promise.all([getSiteDictionary(locale), getBrand()]);

  return {
    metadataBase: new URL(SITE_URL),
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', bn: '/bn', 'x-default': '/en' },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `/${locale}`,
      siteName: brand.siteName,
      locale: locale === 'bn' ? 'bn_BD' : 'en_US',
      type: 'website',
    },
    ...(brand.favicon ? { icons: { icon: brand.favicon, apple: brand.favicon } } : {}),
  };
};

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const brand = await getBrand();

  return (
    <html lang={locale} className={`site-zoom ${fontClasses}`} suppressHydrationWarning>
      <body>
        <BrandStyle primaryColor={brand.primaryColor} />
        <ThemeScript />
        {children}
      </body>
    </html>
  );
}

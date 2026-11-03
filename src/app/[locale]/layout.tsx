import type { Metadata, Viewport } from 'next';
import { Hind_Siliguri, Poppins } from 'next/font/google';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { LOCALES, isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { SITE_URL } from '@/lib/site';
import '../globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
});

// Runs before first paint so a saved light theme never flashes dark.
const THEME_SCRIPT = `try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t='dark';document.documentElement.dataset.theme=t;document.querySelector('meta[name="theme-color"]').setAttribute('content',t==='light'?'#ffffff':'#050507')}catch(e){document.documentElement.dataset.theme='dark'}`;

export const viewport: Viewport = { themeColor: '#050507' };

export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { meta } = getDictionary(locale);

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
      siteName: 'Webnion',
      locale: locale === 'bn' ? 'bn_BD' : 'en_US',
      type: 'website',
    },
  };
};

export default async function RootLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} className={`${poppins.variable} ${hindSiliguri.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

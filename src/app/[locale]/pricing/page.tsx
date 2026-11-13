import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { FinalInquiry } from '@/components/sections/FinalInquiry';
import { Pricing } from '@/components/sections/Pricing';
import { PricingExtras } from '@/components/sections/PricingExtras';
import { isLocale } from '@/i18n/config';
import { getHomeData } from '@/lib/api';
import { getBrand, getOptions, getPricingPage, getSiteDictionary } from '@/lib/siteSettings';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const [dictionary, brand] = await Promise.all([getSiteDictionary(locale), getBrand()]);
  const t = dictionary.pricingPage;
  const title = `${t.metaTitle} | ${brand.siteName}`;
  return {
    title,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/pricing`, languages: { en: '/en/pricing', bn: '/bn/pricing', 'x-default': '/en/pricing' } },
    openGraph: { title, description: t.subtitle, url: `/${locale}/pricing`, siteName: brand.siteName, type: 'website' },
  };
};

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const [dictionary, data, options, lists] = await Promise.all([getSiteDictionary(locale), getHomeData(locale), getOptions(), getPricingPage(locale)]);
  const t = dictionary.pricingPage;

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={t.titleLines} subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />
      <Pricing locale={locale} t={dictionary.pricing} plans={data.pricingPlans} taka={options.takaPrices} />
      <PricingExtras locale={locale} t={t} included={lists.included} steps={lists.steps} extras={lists.extras} />
      <FinalInquiry locale={locale} t={dictionary.inquiry} closeLabel={dictionary.a11y.close} services={data.services} plans={data.pricingPlans} />
    </PageShell>
  );
}

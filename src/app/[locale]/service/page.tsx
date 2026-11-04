import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { ClosingCard } from '@/components/sections/ClosingCard';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { getHomeData } from '@/lib/api';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).servicePage;

  return {
    title: t.metaTitle,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/service`, languages: { en: '/en/service', bn: '/bn/service', 'x-default': '/en/service' } },
    openGraph: { title: t.metaTitle, description: t.subtitle, url: `/${locale}/service`, siteName: 'Webnion', type: 'website' },
  };
};

export default async function ServicePage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = getDictionary(locale);
  const t = dictionary.servicePage;
  const { services, pricingPlans } = await getHomeData(locale);

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={t.titleLines} subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />

      <div className="container-page py-14 lg:py-20">
        {services.length === 0 ? (
          <p className="py-16 text-center text-muted">{t.empty}</p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <li key={service.id} className="reveal">
                <ServiceCard locale={locale} service={service} cta={dictionary.services.cta} heading="h2" />
              </li>
            ))}
          </ul>
        )}
      </div>

      <ClosingCard locale={locale} t={dictionary.closing} inquiry={dictionary.inquiry} closeLabel={dictionary.a11y.close} services={services} plans={pricingPlans} />
    </PageShell>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { ServiceCard } from '@/components/ui/ServiceCard';
import { isLocale } from '@/i18n/config';
import { getHomeData } from '@/lib/api';
import { getSiteDictionary } from '@/lib/siteSettings';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = (await getSiteDictionary(locale)).servicePage;

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

  const dictionary = await getSiteDictionary(locale);
  const t = dictionary.servicePage;
  const { services } = await getHomeData(locale);

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={t.titleLines} subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />

      <div className="container-page section-y">
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

    </PageShell>
  );
}

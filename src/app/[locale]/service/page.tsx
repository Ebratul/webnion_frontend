import { ChevronRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { ClosingCard } from '@/components/sections/ClosingCard';
import { ServiceLink } from '@/components/ui/ServiceLink';
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
                <article className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-2.5 shadow-soft">
                  <Link href={`/${locale}/services/${service.slug}`} tabIndex={-1} aria-hidden className="block overflow-hidden rounded-xl bg-tint">
                    <Image
                      src={service.image}
                      alt=""
                      width={1400}
                      height={1050}
                      sizes="(min-width: 1024px) 370px, (min-width: 768px) 50vw, 100vw"
                      className="aspect-[8/5] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col p-2.5 pt-4">
                    <h2 className="text-lg font-medium">
                      <Link href={`/${locale}/services/${service.slug}`} className="transition-colors duration-200 hover:text-accent">{service.title}</Link>
                    </h2>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{service.description}</p>
                    <ServiceLink slug={service.slug} className="group/link mt-5 flex items-center justify-between gap-3">
                      <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-white underline underline-offset-2 transition-colors duration-200 group-hover/link:bg-primary-hover">
                        {dictionary.services.cta}
                      </span>
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white transition-transform duration-200 group-hover/link:translate-x-0.5">
                        <ChevronRight aria-hidden className="size-4" strokeWidth={3} />
                      </span>
                    </ServiceLink>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ClosingCard locale={locale} t={dictionary.closing} inquiry={dictionary.inquiry} closeLabel={dictionary.a11y.close} services={services} plans={pricingPlans} />
    </PageShell>
  );
}

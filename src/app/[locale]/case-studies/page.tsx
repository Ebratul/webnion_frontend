import { ArrowRight, CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { CardCover } from '@/components/ui/CardCover';
import { ShowMoreGrid } from '@/components/ui/ShowMoreGrid';
import { coverCardBodyClass, imageCardClass } from '@/components/ui/imageCard';
import { isLocale } from '@/i18n/config';
import { getCaseStudies } from '@/lib/api';
import { formatDayMonth } from '@/lib/format';
import { getSiteDictionary } from '@/lib/siteSettings';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = (await getSiteDictionary(locale)).caseStudiesPage;

  return {
    title: t.metaTitle,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/case-studies`, languages: { en: '/en/case-studies', bn: '/bn/case-studies', 'x-default': '/en/case-studies' } },
    openGraph: { title: t.metaTitle, description: t.subtitle, url: `/${locale}/case-studies`, siteName: 'Webnion', type: 'website' },
  };
};

export default async function CaseStudiesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { category } = await searchParams;
  const dictionary = await getSiteDictionary(locale);
  const t = dictionary.caseStudiesPage;
  const basePath = `/${locale}/case-studies`;

  const all = await getCaseStudies(locale);
  const studies = category ? all.filter((study) => study.category === category) : all;

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={t.titleLines} subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />

      <div className="container-page section-y">
        {category && (
          <p className="mb-8 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted">{t.showingCategory}:</span>
            <span className="font-medium">{category}</span>
            <Link href={basePath} scroll={false} className="font-semibold text-accent underline-offset-4 hover:underline">{t.allCategories}</Link>
          </p>
        )}

        {studies.length === 0 ? (
          <p className="py-16 text-center text-muted">{t.empty}</p>
        ) : (
          // A new category starts again from the first twelve
          <ShowMoreGrid key={category ?? 'all'} className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" moreLabel={t.showMore} statusLabel={t.showing} locale={locale}>
            {studies.map((study, index) => {
              const href = `${basePath}/${study.slug}`;
              const date = study.publishedAt ? formatDayMonth(study.publishedAt, locale) : null;
              return (
                <li key={study.id} className="reveal">
                  <article className={`group ${imageCardClass}`}>
                    <CardCover src={study.image} href={href} priority={index < 3} wide>
                      {date && (
                        <p className="absolute left-4 top-4 rounded-xl bg-black/70 px-3 py-1.5 text-center text-white backdrop-blur">
                          <span className="block text-lg font-semibold leading-none">{date.day}</span>
                          <span className="mt-1 block text-[0.6875rem] font-medium uppercase leading-none">{date.month}</span>
                        </p>
                      )}
                    </CardCover>
                    <div className={coverCardBodyClass}>
                      <Link
                        href={`${basePath}?category=${encodeURIComponent(study.category)}`}
                        scroll={false}
                        className="mb-2 flex min-h-7 max-w-full items-center self-start text-xs font-medium text-accent underline-offset-4 hover:underline"
                      >
                        {study.category}
                      </Link>
                      <p className="flex items-center gap-4 text-xs text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <Image src="/icon.svg" alt="" width={18} height={18} unoptimized className="size-[1.125rem] rounded" />
                          {t.author}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays aria-hidden className="size-3.5" />
                          {t.article}
                        </span>
                      </p>
                      <h2 className="mt-3 text-base font-medium leading-snug">
                        <Link href={href} className="block py-0.5 transition-colors duration-200 hover:text-accent">{study.title}</Link>
                      </h2>
                      <p className="mt-3 line-clamp-4 flex-1 text-sm text-muted">{study.excerpt}</p>
                      <Link href={href} aria-label={`${t.readMore}: ${study.title}`} className="mt-4 inline-flex items-center gap-1.5 self-start py-0.5 text-sm font-semibold transition-colors duration-200 hover:text-accent">
                        {t.readMore}
                        <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ShowMoreGrid>
        )}
      </div>
    </PageShell>
  );
}

import { ArrowRight, CalendarDays } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { Pagination } from '@/components/ui/Pagination';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { getCaseStudies } from '@/lib/api';
import { formatDayMonth } from '@/lib/format';

const PAGE_SIZE = 6;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; category?: string }>;
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).caseStudiesPage;

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

  const { page: pageParam, category } = await searchParams;
  const dictionary = getDictionary(locale);
  const t = dictionary.caseStudiesPage;
  const basePath = `/${locale}/case-studies`;

  const all = await getCaseStudies(locale);
  const matching = category ? all.filter((study) => study.category === category) : all;
  const pageCount = Math.max(Math.ceil(matching.length / PAGE_SIZE), 1);
  const requested = Number.parseInt(pageParam ?? '1', 10);
  const page = Number.isNaN(requested) ? 1 : Math.min(Math.max(requested, 1), pageCount);
  const studies = matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hrefFor = (target: number) => {
    const query = new URLSearchParams();
    if (category) query.set('category', category);
    if (target > 1) query.set('page', String(target));
    const text = query.toString();
    return text ? `${basePath}?${text}` : basePath;
  };

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={t.titleLines} subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />

      <div className="container-page py-14 lg:py-16">
        {category && (
          <p className="mb-8 flex flex-wrap items-center gap-3 text-sm">
            <span className="text-muted">{t.showingCategory}:</span>
            <span className="font-medium">{category}</span>
            <Link href={basePath} className="font-semibold text-accent underline-offset-4 hover:underline">{t.allCategories}</Link>
          </p>
        )}

        {studies.length === 0 ? (
          <p className="py-16 text-center text-muted">{t.empty}</p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {studies.map((study, index) => {
              const href = `${basePath}/${study.slug}`;
              const date = study.publishedAt ? formatDayMonth(study.publishedAt, locale) : null;
              return (
                <li key={study.id} className="reveal">
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-primary bg-surface">
                    <div className="relative">
                      <Link href={href} tabIndex={-1} aria-hidden className="block overflow-hidden">
                        <Image
                          src={study.image}
                          alt=""
                          width={900}
                          height={580}
                          priority={index < 3}
                          sizes="(min-width: 1024px) 370px, (min-width: 768px) 50vw, 100vw"
                          className="aspect-[3/2] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </Link>
                      {date && (
                        <p className="absolute left-3 top-3 rounded-xl bg-black/70 px-3 py-1.5 text-center text-white backdrop-blur">
                          <span className="block text-lg font-semibold leading-none">{date.day}</span>
                          <span className="mt-1 block text-[0.625rem] font-medium uppercase leading-none">{date.month}</span>
                        </p>
                      )}
                      <Link
                        href={`${basePath}?category=${encodeURIComponent(study.category)}`}
                        className="absolute bottom-3 right-3 max-w-[85%] truncate rounded-full bg-primary px-3 py-1 text-[0.6875rem] font-semibold text-white shadow transition-colors duration-200 hover:bg-primary-hover"
                      >
                        {study.category}
                      </Link>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
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
                        <Link href={href} className="transition-colors duration-200 hover:text-accent">{study.title}</Link>
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
          </ul>
        )}

        <Pagination page={page} pageCount={pageCount} hrefFor={hrefFor} locale={locale} label={t.pageLabel} previous={t.previous} next={t.next} />
      </div>
    </PageShell>
  );
}

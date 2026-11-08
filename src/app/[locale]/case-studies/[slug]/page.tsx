import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/layout/PageHero';
import { PageShell } from '@/components/layout/PageShell';
import { ContentBlocks } from '@/components/ui/ContentBlocks';
import { isLocale } from '@/i18n/config';
import { getCaseStudy } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { SECTION_IDS, sectionHref } from '@/lib/site';
import { getSiteDictionary } from '@/lib/siteSettings';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const study = await getCaseStudy(slug, locale);
  if (!study) return {};

  const title = `${study.title} | Webnion`;
  const description = study.content.find((block) => block.type === 'paragraph')?.text ?? study.category;
  const path = `/case-studies/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { en: `/en${path}`, bn: `/bn${path}`, 'x-default': `/en${path}` },
    },
    openGraph: { title, description, url: `/${locale}${path}`, siteName: 'Webnion', type: 'article', images: [study.image] },
  };
};

export default async function CaseStudyPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const study = await getCaseStudy(slug, locale);
  if (!study) notFound();

  const t = await getSiteDictionary(locale);
  const labels = t.caseStudyDetail;

  return (
    <PageShell locale={locale}>
      <PageHero title={study.title} homeHref={`/${locale}`} homeLabel={t.nav.home} crumb={labels.crumb} />

      <div className="container-page section-y max-w-3xl">
        <Image src={study.image} alt="" width={870} height={570} priority sizes="(min-width: 768px) 768px, 100vw" className="h-auto w-full rounded-2xl" />

        <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-muted">
          <span className="rounded-full border border-line bg-tint px-3 py-1 font-medium text-accent">{study.category}</span>
          {study.publishedAt && (
            <span>
              {labels.published}: {formatDate(study.publishedAt, locale)}
            </span>
          )}
        </div>

        <article className="mt-6 rounded-3xl border border-line bg-surface p-6 sm:p-8">
          <ContentBlocks blocks={study.content} locale={study.contentLocale} />
        </article>

        <Link
          href={sectionHref(locale, SECTION_IDS.portfolio)}
          className="mt-6 inline-flex items-center gap-2 py-1 text-sm text-muted transition-colors duration-200 hover:text-accent"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {labels.back}
        </Link>
      </div>
    </PageShell>
  );
}

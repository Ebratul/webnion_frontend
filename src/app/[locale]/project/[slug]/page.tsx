import { ArrowLeft, CalendarDays, ChartPie, MapPin, User, Wallet } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHero } from '@/components/layout/PageHero';
import { PageShell } from '@/components/layout/PageShell';
import { SecondaryLink } from '@/components/ui/Button';
import { ContentBlocks } from '@/components/ui/ContentBlocks';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { getProject } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { SECTION_IDS, sectionHref } from '@/lib/site';

export const revalidate = 60;

type PageProps = { params: Promise<{ locale: string; slug: string }> };

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const project = await getProject(slug, locale);
  if (!project) return {};

  const title = `${project.name} | Webnion`;
  const description = project.content.find((block) => block.type === 'paragraph')?.text ?? project.category;
  const path = `/project/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: { en: `/en${path}`, bn: `/bn${path}`, 'x-default': `/en${path}` },
    },
    openGraph: { title, description, url: `/${locale}${path}`, siteName: 'Webnion', type: 'article', images: [project.image] },
  };
};

export default async function ProjectPage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const project = await getProject(slug, locale);
  if (!project) notFound();

  const t = getDictionary(locale);
  const labels = t.projectDetail;
  const info = [
    { label: labels.client, value: project.client, Icon: User },
    { label: labels.budget, value: project.budget, Icon: Wallet },
    { label: labels.location, value: project.location, Icon: MapPin },
    { label: labels.sector, value: project.sector, Icon: ChartPie },
    { label: labels.completed, value: project.completedAt && formatDate(project.completedAt, locale), Icon: CalendarDays },
  ].filter((item) => item.value);

  return (
    <PageShell locale={locale}>
      <PageHero title={project.name} homeHref={`/${locale}`} homeLabel={t.nav.home} crumb={labels.crumb} translateTitle={false} />

      <div className="container-page grid gap-6 py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:py-16">
        <div className="min-w-0 space-y-6">
          <div className="overflow-hidden rounded-2xl bg-white">
            <Image src={project.image} alt={project.name} width={768} height={768} priority sizes="(min-width: 1024px) 768px, 100vw" className="w-full" />
          </div>
          {project.content.length > 0 && (
            <article className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
              <ContentBlocks blocks={project.content} locale={project.contentLocale} />
            </article>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-line bg-surface">
            <h2 className="border-b border-line px-6 py-5 text-lg font-semibold">{labels.infoTitle}</h2>
            <dl className="space-y-5 p-6">
              {info.map(({ label, value, Icon }) => (
                <div key={label} className="relative flex min-h-10 flex-col justify-center pl-[3.25rem]">
                  <dt className="text-xs text-muted">
                    <span className="absolute left-0 top-0 grid size-10 place-items-center rounded-full bg-primary text-white">
                      <Icon aria-hidden className="size-4" />
                    </span>
                    {label}
                  </dt>
                  <dd className="text-sm font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <SecondaryLink href={sectionHref(locale, SECTION_IDS.contact)} className="mt-4 w-full">{t.nav.cta}</SecondaryLink>
          <Link
            href={`/${locale}/project`}
            className="mt-4 inline-flex items-center gap-2 py-1 text-sm text-muted transition-colors duration-200 hover:text-accent"
          >
            <ArrowLeft aria-hidden className="size-4" />
            {labels.back}
          </Link>
        </aside>
      </div>
    </PageShell>
  );
}

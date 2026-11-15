import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { ShowMoreGrid } from '@/components/ui/ShowMoreGrid';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { isLocale } from '@/i18n/config';
import { getHomeData } from '@/lib/api';
import { isProjectType, PROJECT_TYPES, projectType } from '@/lib/projectTypes';
import { getSiteDictionary } from '@/lib/siteSettings';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
};

export const revalidate = 60;

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = (await getSiteDictionary(locale)).projectPage;

  return {
    title: t.metaTitle,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/project`, languages: { en: '/en/project', bn: '/bn/project', 'x-default': '/en/project' } },
    openGraph: { title: t.metaTitle, description: t.subtitle, url: `/${locale}/project`, siteName: 'Webnion', type: 'website' },
  };
};

export default async function ProjectsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { type } = await searchParams;
  const dictionary = await getSiteDictionary(locale);
  const t = dictionary.projectPage;
  const basePath = `/${locale}/project`;

  const { projects: all } = await getHomeData(locale);
  // E-commerce, Business, School and Landing Page, read from each project's Category
  const active = isProjectType(type) ? type : undefined;
  const projects = active ? all.filter((project) => projectType(project) === active) : all;

  const chip = (selected: boolean) =>
    `inline-flex min-h-11 shrink-0 items-center rounded-full border px-5 text-sm font-medium transition-colors duration-200 ${selected ? 'border-primary bg-primary text-white shadow-[0_10px_24px_-14px_var(--primary)]' : 'border-line hover:border-primary hover:text-primary dark:hover:text-accent'}`;

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={t.titleLines} subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />

      <div className="container-page section-y">
        {all.length > 0 && (
          <nav aria-label={t.filterLabel} className="no-scrollbar -mx-4 mb-10 flex gap-2.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
            <Link href={basePath} scroll={false} aria-current={!active ? 'page' : undefined} className={chip(!active)}>
              {t.allTypes}
            </Link>
            {PROJECT_TYPES.map((key) => (
              <Link key={key} href={`${basePath}?type=${key}`} scroll={false} aria-current={active === key ? 'page' : undefined} className={chip(active === key)}>
                {t.types[key]}
              </Link>
            ))}
          </nav>
        )}

        {all.length === 0 ? (
          <p className="py-16 text-center text-muted">{t.empty}</p>
        ) : projects.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted">{t.emptyType.replace('{type}', active ? t.types[active] : '')}</p>
            <Link href={basePath} scroll={false} className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 hover:underline dark:text-accent">
              {t.seeAll}
            </Link>
          </div>
        ) : (
          // A new filter starts again from the first twelve
          <ShowMoreGrid key={active ?? 'all'} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" moreLabel={t.showMore} statusLabel={t.showing} locale={locale}>
            {projects.map((project, index) => (
              <li key={project.id} className="reveal">
                <ProjectCard
                  project={project}
                  href={`${basePath}/${project.slug}`}
                  viewLabel={dictionary.projects.viewProject}
                  sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                  heading="h2"
                  priority={index < 3}
                />
              </li>
            ))}
          </ShowMoreGrid>
        )}
      </div>
    </PageShell>
  );
}

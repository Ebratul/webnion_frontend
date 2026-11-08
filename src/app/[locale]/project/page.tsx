import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { Pagination } from '@/components/ui/Pagination';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { isLocale } from '@/i18n/config';
import { getHomeData } from '@/lib/api';
import { getSiteDictionary } from '@/lib/siteSettings';

const PAGE_SIZE = 12;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

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

  const { page: pageParam } = await searchParams;
  const dictionary = await getSiteDictionary(locale);
  const t = dictionary.projectPage;
  const labels = dictionary.caseStudiesPage;
  const basePath = `/${locale}/project`;

  const { projects: all } = await getHomeData(locale);
  const pageCount = Math.max(Math.ceil(all.length / PAGE_SIZE), 1);
  const requested = Number.parseInt(pageParam ?? '1', 10);
  const page = Number.isNaN(requested) ? 1 : Math.min(Math.max(requested, 1), pageCount);
  const projects = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={t.titleLines} subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />

      <div className="container-page section-y">
        {projects.length === 0 ? (
          <p className="py-16 text-center text-muted">{t.empty}</p>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => {
              const href = `${basePath}/${project.slug}`;
              return (
                <li key={project.id} className="reveal">
                  <ProjectCard
                    project={project}
                    href={href}
                    viewLabel={dictionary.projects.viewProject}
                    sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
                    heading="h2"
                    priority={index < 3}
                  />
                </li>
              );
            })}
          </ul>
        )}

        <Pagination
          page={page}
          pageCount={pageCount}
          hrefFor={(target) => (target > 1 ? `${basePath}?page=${target}` : basePath)}
          locale={locale}
          label={labels.pageLabel}
          previous={labels.previous}
          next={labels.next}
        />
      </div>
    </PageShell>
  );
}

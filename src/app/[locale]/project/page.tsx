import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { ShowMoreGrid } from '@/components/ui/ShowMoreGrid';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { isLocale } from '@/i18n/config';
import { getHomeData } from '@/lib/api';
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
  // One button per kind, the most common first; a kind keeps the name of its first project in this language
  const counts = new Map<string, { label: string; count: number }>();
  for (const project of all) {
    if (!project.typeKey || !project.type) continue;
    const entry = counts.get(project.typeKey) ?? { label: project.type, count: 0 };
    entry.count += 1;
    counts.set(project.typeKey, entry);
  }
  const types = [...counts.entries()].sort((a, b) => b[1].count - a[1].count);
  const active = type && counts.has(type) ? type : undefined;
  const projects = active ? all.filter((project) => project.typeKey === active) : all;

  const chip = (selected: boolean) =>
    `inline-flex min-h-10 items-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors duration-200 ${selected ? 'border-primary bg-primary text-white shadow-[0_10px_24px_-14px_var(--primary)]' : 'border-line hover:border-primary hover:text-primary dark:hover:text-accent'}`;

  return (
    <PageShell locale={locale}>
      <PageBanner titleLines={t.titleLines} subtitle={t.subtitle} homeHref={`/${locale}`} homeLabel={dictionary.nav.home} crumb={t.crumb} />

      <div className="container-page section-y">
        {types.length > 1 && (
          <nav aria-label={t.filterLabel} className="mb-10 flex flex-wrap justify-center gap-2.5">
            <Link href={basePath} scroll={false} aria-current={!active ? 'page' : undefined} className={chip(!active)}>
              {t.allTypes}
              <span className={`text-xs tabular-nums ${!active ? 'text-white/80' : 'text-muted'}`}>{all.length}</span>
            </Link>
            {types.map(([key, { label, count }]) => (
              <Link key={key} href={`${basePath}?type=${encodeURIComponent(key)}`} scroll={false} aria-current={active === key ? 'page' : undefined} className={chip(active === key)}>
                {label}
                <span className={`text-xs tabular-nums ${active === key ? 'text-white/80' : 'text-muted'}`}>{count}</span>
              </Link>
            ))}
          </nav>
        )}

        {projects.length === 0 ? (
          <p className="py-16 text-center text-muted">{t.empty}</p>
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

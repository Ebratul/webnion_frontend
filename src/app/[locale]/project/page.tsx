import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageBanner } from '@/components/layout/PageBanner';
import { PageShell } from '@/components/layout/PageShell';
import { Pagination } from '@/components/ui/Pagination';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { getHomeData } from '@/lib/api';

const PAGE_SIZE = 12;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).projectPage;

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
  const dictionary = getDictionary(locale);
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

      <div className="container-page py-14 lg:py-16">
        {projects.length === 0 ? (
          <p className="py-16 text-center text-muted">{t.empty}</p>
        ) : (
          <ul className="grid gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => {
              const href = `${basePath}/${project.slug}`;
              return (
                <li key={project.id} className="reveal">
                  {/* The caption overlaps the image from the bottom, so a long name grows upward and cards stay level */}
                  <article className="group relative rounded-2xl border border-primary bg-surface p-2.5 pb-16 transition-colors duration-300 hover:border-accent">
                    <Link href={href} tabIndex={-1} aria-hidden className="block overflow-hidden rounded-xl bg-white">
                      <Image
                        src={project.image}
                        alt=""
                        width={768}
                        height={768}
                        priority={index < 3}
                        sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
                        className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </Link>
                    <div className="absolute inset-x-5 bottom-2.5 flex items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4">
                      <div className="min-w-0">
                        <p className="inline-block rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[0.6875rem]">{project.category}</p>
                        <h2 translate="no" className="mt-2 font-medium [overflow-wrap:anywhere]">
                          <Link href={href} className="transition-colors duration-200 hover:text-accent">{project.name}</Link>
                        </h2>
                      </div>
                      <Link
                        href={href}
                        aria-label={`${dictionary.projects.viewProject}: ${project.name}`}
                        className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-white transition-colors duration-200 hover:bg-primary-hover"
                      >
                        <ArrowUpRight aria-hidden className="size-4" />
                      </Link>
                    </div>
                  </article>
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

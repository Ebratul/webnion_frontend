import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import type { CaseStudy, Project } from '@/lib/types';
import { SectionHeading } from '../ui/SectionHeading';
import { ProjectCarousel } from './ProjectCarousel';

interface FeaturedProjectsProps {
  locale: Locale;
  t: Dictionary['projects'];
  a11y: Dictionary['a11y'];
  projects: Project[];
  caseStudies: CaseStudy[];
}

export const FeaturedProjects = ({ locale, t, a11y, projects, caseStudies }: FeaturedProjectsProps) => {
  const featured = projects.filter((project) => project.isFeatured);

  return (
    <section id={SECTION_IDS.portfolio} aria-labelledby="projects-title" className="band-dark pb-16 pt-20 lg:pb-20 lg:pt-28">
      <div className="container-page">
        <SectionHeading id="projects-title" eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

        <div className="mt-12">
          <ProjectCarousel locale={locale} projects={featured} viewLabel={t.viewProject} a11y={a11y} />
        </div>

        <h3 className="mt-16 text-center text-xl font-semibold">{t.caseStudiesTitle}</h3>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {caseStudies.slice(0, 3).map((study) => (
            <li key={study.id}>
              <Link
                href={`/${locale}/case-studies/${study.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-colors duration-200 hover:border-accent"
              >
                <span className="text-xs font-medium text-accent">{study.category}</span>
                <span className="mt-3 flex-1 text-sm font-medium leading-relaxed">{study.title}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors duration-200 group-hover:text-fg">
                  {t.readCaseStudy}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link href={`/${locale}/case-studies`} className="inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 transition-colors duration-200 hover:text-accent hover:underline">
            {t.seeMoreCaseStudies}
            <ArrowUpRight aria-hidden className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

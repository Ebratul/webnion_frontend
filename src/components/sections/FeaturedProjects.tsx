import { ArrowUpRight } from 'lucide-react';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import type { Project } from '@/lib/types';
import { SectionHeading } from '../ui/SectionHeading';
import { ProjectCarousel } from './ProjectCarousel';

interface FeaturedProjectsProps {
  t: Dictionary['projects'];
  a11y: Dictionary['a11y'];
  projects: Project[];
}

export const FeaturedProjects = ({ t, a11y, projects }: FeaturedProjectsProps) => {
  const featured = projects.filter((project) => project.isFeatured);

  return (
    <section id={SECTION_IDS.portfolio} aria-labelledby="projects-title" className="band-dark pb-16 pt-20 lg:pb-20 lg:pt-28">
      <div className="container-page">
        <SectionHeading id="projects-title" eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

        <div className="mt-12">
          <ProjectCarousel projects={featured} viewLabel={t.viewProject} a11y={a11y} />
        </div>

        <h3 className="mt-16 text-center text-xl font-semibold">{t.caseStudiesTitle}</h3>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {t.caseStudies.map((study) => (
            <li key={study.url}>
              <a
                href={study.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col rounded-2xl border border-line bg-surface p-6 transition-colors duration-200 hover:border-accent"
              >
                <span className="text-xs font-medium text-accent">{study.category}</span>
                <span className="mt-3 flex-1 text-sm font-medium leading-relaxed">{study.title}</span>
                <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors duration-200 group-hover:text-fg">
                  {t.readCaseStudy}
                  <ArrowUpRight aria-hidden className="size-3.5" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import type { Project } from '@/lib/types';
import { SectionHeading } from '../ui/SectionHeading';
import { ProjectCarousel } from './ProjectCarousel';

interface FeaturedProjectsProps {
  locale: Locale;
  t: Dictionary['projects'];
  a11y: Dictionary['a11y'];
  projects: Project[];
}

export const FeaturedProjects = ({ locale, t, a11y, projects }: FeaturedProjectsProps) => {
  const featured = projects.filter((project) => project.isFeatured);

  return (
    <section id={SECTION_IDS.portfolio} aria-labelledby="projects-title">
      <div className="container-page">
        <SectionHeading id="projects-title" title={t.title} subtitle={t.subtitle} />
      </div>

      <div className="band-dark section-y mt-12 bg-[#131620]!">
        <div className="container-page">
          <ProjectCarousel locale={locale} projects={featured} viewLabel={t.viewProject} a11y={a11y} />
        </div>
      </div>
    </section>
  );
};

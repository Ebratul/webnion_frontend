import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Project } from '@/lib/types';
import { PausableMarquee } from '../ui/PausableMarquee';

interface ProjectMosaicProps {
  locale: Locale;
  projects: Project[];
  pauseLabel: string;
  playLabel: string;
}

// Mixed widths give the rows a rhythm, like a gallery wall rather than a row of equal tiles
const WIDTHS = ['w-44 sm:w-60', 'w-64 sm:w-[26rem]', 'w-40 sm:w-52', 'w-60 sm:w-96', 'w-48 sm:w-72'];

const Row = ({ locale, projects, direction, offset }: { locale: Locale; projects: Project[]; direction?: 'reverse'; offset: number }) => (
  <div className="marquee-track" data-direction={direction}>
    {[...projects, ...projects].map((project, index) => {
      // The second copy of each row exists only to make the loop seamless
      const isCopy = index >= projects.length;
      return (
        <Link
          key={`${project.id}-${index}`}
          href={`/${locale}/project/${project.slug}`}
          draggable={false}
          aria-hidden={isCopy || undefined}
          // Keyboard users reach these projects in the Portfolio section; focus would make the row jump here
          tabIndex={-1}
          className={`group relative mr-5 h-36 shrink-0 overflow-hidden rounded-2xl bg-white [cursor:inherit] sm:h-56 ${WIDTHS[(index + offset) % WIDTHS.length]}`}
        >
          <Image
            src={project.image}
            alt={isCopy ? '' : project.name}
            width={768}
            height={768}
            sizes="(min-width: 640px) 416px, 256px"
            draggable={false}
            className="size-full object-cover object-top"
          />
          <span aria-hidden className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span translate="no" className="block truncate text-sm font-semibold">{project.name}</span>
            <span className="block truncate text-xs text-white/75">{project.category}</span>
          </span>
        </Link>
      );
    })}
  </div>
);

export const ProjectMosaic = ({ locale, projects, pauseLabel, playLabel }: ProjectMosaicProps) => {
  const middle = Math.ceil(projects.length / 2);

  return (
    <PausableMarquee pauseLabel={pauseLabel} playLabel={playLabel} className="band-dark py-5" buttonClassName="bottom-6 right-5 sm:right-8">
      <div className="fade-edges flex flex-col gap-5 overflow-hidden">
        <Row locale={locale} projects={projects.slice(0, middle)} offset={0} />
        <Row locale={locale} projects={projects.slice(middle)} direction="reverse" offset={2} />
      </div>
    </PausableMarquee>
  );
};

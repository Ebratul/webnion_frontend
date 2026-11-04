import Image from 'next/image';
import type { Project } from '@/lib/types';
import { PausableMarquee } from '../ui/PausableMarquee';

interface ProjectMosaicProps {
  projects: Project[];
  pauseLabel: string;
  playLabel: string;
}

const Row = ({ projects, direction }: { projects: Project[]; direction?: 'reverse' }) => (
  <div className="marquee-track" data-direction={direction}>
    {[...projects, ...projects].map((project, index) => (
      <div key={`${project.id}-${index}`} className="mr-3 w-56 shrink-0 overflow-hidden rounded-2xl bg-white sm:mr-4 sm:w-72">
        <Image
          src={project.image}
          // The second copy of each row exists only to make the loop seamless
          alt={index < projects.length ? project.name : ''}
          width={768}
          height={768}
          sizes="(min-width: 640px) 288px, 224px"
          className="aspect-[4/3] w-full object-cover object-top"
        />
      </div>
    ))}
  </div>
);

export const ProjectMosaic = ({ projects, pauseLabel, playLabel }: ProjectMosaicProps) => {
  const middle = Math.ceil(projects.length / 2);

  return (
    <PausableMarquee pauseLabel={pauseLabel} playLabel={playLabel} className="band-dark py-4 sm:py-5" buttonClassName="bottom-7 right-5 sm:right-8">
      <div className="fade-edges flex flex-col gap-3 overflow-hidden sm:gap-4">
        <Row projects={projects.slice(0, middle)} />
        <Row projects={projects.slice(middle)} direction="reverse" />
      </div>
    </PausableMarquee>
  );
};

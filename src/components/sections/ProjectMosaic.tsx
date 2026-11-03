'use client';

import { Pause, Play } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import type { Project } from '@/lib/types';

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
  const [paused, setPaused] = useState(false);
  const middle = Math.ceil(projects.length / 2);

  return (
    <div data-paused={paused} className="band-dark relative py-4 sm:py-5">
      <div className="fade-edges flex flex-col gap-3 overflow-hidden sm:gap-4">
        <Row projects={projects.slice(0, middle)} />
        <Row projects={projects.slice(middle)} direction="reverse" />
      </div>
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? playLabel : pauseLabel}
        className="absolute bottom-7 right-5 grid size-10 place-items-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur transition-colors duration-200 hover:bg-primary sm:right-8"
      >
        {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
      </button>
    </div>
  );
};

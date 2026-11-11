import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  href: string;
  viewLabel: string;
  sizes: string;
  heading: 'h2' | 'h3';
  priority?: boolean;
  // The carousel's second copy of each card is decoration, so the keyboard skips it
  skipFocus?: boolean;
}

// The square image sits at the top and a dark gradient carries the text below it, so nothing of the image is cropped
export const ProjectCard = ({ project, href, viewLabel, sizes, heading: Heading, priority, skipFocus }: ProjectCardProps) => (
  <article className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-primary bg-[#0d0f18] transition-shadow duration-300 hover:shadow-[0_24px_60px_-28px_var(--primary)]">
    <Image
      src={project.image}
      alt=""
      width={768}
      height={768}
      sizes={sizes}
      priority={priority}
      draggable={false}
      className="absolute inset-x-0 top-0 aspect-square w-full bg-white object-cover"
    />
    <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-[#0d0f18] from-55% via-[#0d0f18]/85 via-75% to-transparent p-5 pt-24 text-white">
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--accent-dark)]">{project.category}</p>
        <Heading translate="no" className="mt-1 text-lg font-medium leading-snug [overflow-wrap:anywhere]">{project.name}</Heading>
      </div>
      {/* The link stretches over the whole card, so clicking the image or the name opens the project too */}
      <Link
        href={href}
        aria-label={`${viewLabel}: ${project.name}`}
        tabIndex={skipFocus ? -1 : undefined}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-white transition-colors duration-300 after:absolute after:inset-0 after:rounded-3xl group-hover:bg-primary-hover"
      >
        <ArrowUpRight aria-hidden className="size-[18px] transition-transform duration-300 group-hover:translate-x-px group-hover:-translate-y-px" />
      </Link>
    </div>
  </article>
);

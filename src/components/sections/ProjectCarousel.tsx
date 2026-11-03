'use client';

import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Dictionary } from '@/i18n';
import type { Project } from '@/lib/types';

interface ProjectCarouselProps {
  projects: Project[];
  viewLabel: string;
  a11y: Dictionary['a11y'];
}

export const ProjectCarousel = ({ projects, viewLabel, a11y }: ProjectCarouselProps) => {
  const scroller = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Slides near the end cannot reach the left edge, so pagination stops at the last reachable position
  const [maxIndex, setMaxIndex] = useState(Math.max(projects.length - 4, 0));

  const slideWidth = () => {
    const list = scroller.current;
    const first = list?.firstElementChild as HTMLElement | null;
    return first && list ? first.offsetWidth + parseFloat(getComputedStyle(list).columnGap || '0') : 0;
  };

  useEffect(() => {
    const list = scroller.current;
    if (!list) return;
    const measure = () => {
      const width = slideWidth();
      if (width > 0) setMaxIndex(Math.round((list.scrollWidth - list.clientWidth) / width));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    scroller.current?.scrollTo({ left: slideWidth() * index, behavior: 'smooth' });
  };

  const onScroll = () => {
    const width = slideWidth();
    if (width > 0) setActiveIndex(Math.round((scroller.current?.scrollLeft ?? 0) / width));
  };

  return (
    <div>
      <ul
        ref={scroller}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 lg:gap-5"
      >
        {projects.map((project) => (
          <li key={project.id} className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3.75rem)/4)]">
            <article className="flex h-full flex-col rounded-2xl border border-line bg-surface p-2">
              <div className="overflow-hidden rounded-xl bg-white">
                <Image src={project.image} alt="" width={768} height={768} sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 78vw" className="aspect-square w-full object-cover" />
              </div>
              <div className="flex flex-1 items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="inline-block rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[0.6875rem] text-muted">{project.category}</p>
                  <h3 translate="no" className="mt-2 truncate text-sm font-medium">{project.name}</h3>
                </div>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${viewLabel}: ${project.name}`}
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-bg text-fg transition-colors duration-200 hover:border-primary hover:bg-primary hover:text-white"
                  >
                    <ArrowUpRight aria-hidden className="size-4" />
                  </a>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => goTo(activeIndex - 1)}
          disabled={activeIndex === 0}
          aria-label={a11y.previous}
          className="grid size-10 place-items-center rounded-full border border-line text-fg transition-colors duration-200 hover:border-accent disabled:opacity-40"
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <div className="hidden items-center sm:flex">
          {projects.slice(0, maxIndex + 1).map((project, index) => (
            <button
              key={project.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`${a11y.goToSlide}: ${project.name}`}
              aria-current={index === activeIndex}
              className="grid size-5 place-items-center"
            >
              <span className={`size-1.5 rounded-full transition-colors duration-200 ${index === activeIndex ? 'bg-primary ring-2 ring-primary/40' : 'bg-white/25'}`} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(activeIndex + 1)}
          disabled={activeIndex >= maxIndex}
          aria-label={a11y.next}
          className="grid size-10 place-items-center rounded-full border border-line text-fg transition-colors duration-200 hover:border-accent disabled:opacity-40"
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
      </div>
    </div>
  );
};

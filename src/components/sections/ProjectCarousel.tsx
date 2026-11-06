'use client';

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { Project } from '@/lib/types';
import { ProjectCard } from '../ui/ProjectCard';

// One card every two seconds, sliding for part of that time so each card rests before the next move
const AUTOPLAY_MS = 2000;
const SLIDE_MS = 800;
// The most cards visible at once. With more projects than this the row loops, using a second copy of the cards.
const MAX_VISIBLE = 3;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

interface ProjectCarouselProps {
  locale: Locale;
  projects: Project[];
  viewLabel: string;
  exploreLabel: string;
  a11y: Dictionary['a11y'];
}

export const ProjectCarousel = ({ locale, projects, viewLabel, exploreLabel, a11y }: ProjectCarouselProps) => {
  const count = projects.length;
  const loops = count > MAX_VISIBLE;
  const scroller = useRef<HTMLUListElement>(null);
  const frame = useRef<number | null>(null);
  // Where the running animation will land, so quick repeated clicks add up instead of restarting from the same card
  const landing = useRef<number | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState(0);
  const [maxPosition, setMaxPosition] = useState(Math.max(count - MAX_VISIBLE, 0));
  // Rows run on their own unless the visitor asks for reduced motion. There is no pause button, by the owner's choice:
  // the row also stops under the mouse and while a card has keyboard focus.
  const [still, setStill] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);

  const slideWidth = () => {
    const list = scroller.current;
    const first = list?.children[0];
    const second = list?.children[1];
    if (!list || !first || !second) return 0;
    // Measured between cards and converted out of the page zoom. offsetWidth rounds, and the error would add up along the row.
    const zoom = list.getBoundingClientRect().width / list.clientWidth || 1;
    return (second.getBoundingClientRect().left - first.getBoundingClientRect().left) / zoom;
  };

  useEffect(() => {
    const list = scroller.current;
    if (!list) return;
    const measure = () => {
      const width = slideWidth();
      if (width > 0) setMaxPosition(Math.round((list.scrollWidth - list.clientWidth) / width));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setStill(true);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (settle.current) clearTimeout(settle.current);
    };
  }, []);

  // Native smooth scrolling has a fixed, quick speed, so the slide is timed here.
  // Scroll snapping would fight every frame and is switched off until the slide lands.
  const slideTo = (target: number, from: number) => {
    const list = scroller.current;
    if (!list) return;
    if (frame.current !== null) cancelAnimationFrame(frame.current);

    const width = slideWidth();
    const end = target * width;
    list.style.scrollSnapType = 'none';
    list.scrollLeft = from;
    landing.current = target;

    const finish = () => {
      list.scrollLeft = end;
      list.style.scrollSnapType = '';
      frame.current = null;
      landing.current = null;
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }

    let startTime: number | null = null;
    const step = (now: number) => {
      startTime ??= now;
      const progress = Math.min((now - startTime) / SLIDE_MS, 1);
      list.scrollLeft = from + (end - from) * easeInOutCubic(progress);
      if (progress < 1) frame.current = requestAnimationFrame(step);
      else finish();
    };
    frame.current = requestAnimationFrame(step);
  };

  const move = (delta: number) => {
    const list = scroller.current;
    const width = slideWidth();
    if (!list || !width) return;

    const last = Math.round((list.scrollWidth - list.clientWidth) / width);
    let from = list.scrollLeft;
    let target = (landing.current ?? Math.round(from / width)) + delta;

    if (loops) {
      // Both copies look identical, so stepping to the other copy at an edge cannot be seen
      if (target < 0) {
        target += count;
        from += count * width;
      } else if (target > last) {
        target -= count;
        from -= count * width;
      }
    } else {
      target = Math.min(Math.max(target, 0), last);
    }
    slideTo(target, from);
  };

  useEffect(() => {
    if (still || hovering || focused || maxPosition === 0) return;
    const timer = setInterval(() => {
      // Cards travel right to left, which means scrolling forward through the row
      if (!document.hidden) move(1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
    // move only reads refs and values that are also dependencies here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still, hovering, focused, maxPosition, count]);

  const onScroll = () => {
    const list = scroller.current;
    const width = slideWidth();
    if (!list || !width) return;
    const current = Math.round(list.scrollLeft / width);
    setPosition(loops ? current % count : current);

    // After a manual swipe to either end, step to the other copy so the row can keep going that way
    if (settle.current) clearTimeout(settle.current);
    if (!loops || frame.current !== null) return;
    settle.current = setTimeout(() => {
      if (frame.current !== null) return;
      const at = Math.round(list.scrollLeft / width);
      if (at === 0) list.scrollLeft += count * width;
      else if (at >= count) list.scrollLeft -= count * width;
    }, 200);
  };

  // The copy is decoration for the loop, so it is hidden from screen readers and the keyboard
  const cards = loops ? [...projects.map((project) => ({ project, copy: false })), ...projects.map((project) => ({ project, copy: true }))] : projects.map((project) => ({ project, copy: false }));

  return (
    <div
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      onFocus={(event) => setFocused(event.target.matches(':focus-visible'))}
      onBlur={() => setFocused(false)}
    >
      <ul
        ref={scroller}
        onScroll={onScroll}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain"
      >
        {cards.map(({ project, copy }) => (
          <li
            key={`${project.id}-${copy}`}
            aria-hidden={copy || undefined}
            className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <ProjectCard
              project={project}
              href={`/${locale}/project/${project.slug}`}
              viewLabel={viewLabel}
              sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 82vw"
              heading="h3"
              skipFocus={copy}
            />
          </li>
        ))}
      </ul>

      {/* A link to every project on the left and the arrows on the right, on one line under the cards */}
      <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
        <Link
          href={`/${locale}/project`}
          className="group inline-flex min-h-11 items-center gap-3 text-[0.9375rem] font-medium text-white transition-colors duration-200 hover:text-accent"
        >
          {exploreLabel}
          <span aria-hidden className="grid size-9 place-items-center rounded-full border border-white/20 transition-[background-color,border-color,transform] duration-300 group-hover:translate-x-1 group-hover:border-primary group-hover:bg-primary group-hover:text-white motion-reduce:group-hover:translate-x-0">
            <ArrowRight className="size-4" />
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={!loops && position === 0}
            aria-label={a11y.previous}
            className="grid size-11 place-items-center rounded-full bg-primary text-white transition-colors duration-200 hover:bg-primary-hover disabled:opacity-40"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={!loops && position >= maxPosition}
            aria-label={a11y.next}
            className="grid size-11 place-items-center rounded-full bg-primary text-white transition-colors duration-200 hover:bg-primary-hover disabled:opacity-40"
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

'use client';

import { ArrowUpRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { Project } from '@/lib/types';

const AUTOPLAY_MS = 3000;
const SLIDE_MS = 1000;
// The most cards visible at once. With more projects than this the row loops, using a second copy of the cards.
const MAX_VISIBLE = 4;

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

interface ProjectCarouselProps {
  locale: Locale;
  projects: Project[];
  viewLabel: string;
  a11y: Dictionary['a11y'];
}

export const ProjectCarousel = ({ locale, projects, viewLabel, a11y }: ProjectCarouselProps) => {
  const count = projects.length;
  const loops = count > MAX_VISIBLE;
  const scroller = useRef<HTMLUListElement>(null);
  const frame = useRef<number | null>(null);
  // Where the running animation will land, so quick repeated clicks add up instead of restarting from the same card
  const landing = useRef<number | null>(null);
  const settle = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [position, setPosition] = useState(0);
  const [maxPosition, setMaxPosition] = useState(Math.max(count - MAX_VISIBLE, 0));
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [focused, setFocused] = useState(false);

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
      if (width > 0) setMaxPosition(Math.round((list.scrollWidth - list.clientWidth) / width));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true);
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

  const goToCard = (index: number) => {
    const list = scroller.current;
    const width = slideWidth();
    if (!list || !width) return;
    const current = list.scrollLeft / width;
    const nearest = loops && Math.abs(index + count - current) < Math.abs(index - current) ? index + count : index;
    slideTo(nearest, list.scrollLeft);
  };

  useEffect(() => {
    if (paused || hovering || focused || maxPosition === 0) return;
    const timer = setInterval(() => {
      // Cards travel left to right, which means scrolling back through the row
      if (!document.hidden) move(-1);
    }, AUTOPLAY_MS);
    return () => clearInterval(timer);
    // move only reads refs and values that are also dependencies here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, hovering, focused, maxPosition, count]);

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
  const dots = loops ? projects : projects.slice(0, maxPosition + 1);

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
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 lg:gap-5"
      >
        {cards.map(({ project, copy }) => (
          <li
            key={`${project.id}-${copy}`}
            aria-hidden={copy || undefined}
            className="w-[78%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3.75rem)/4)]"
          >
            <article className="group relative flex h-full flex-col rounded-2xl border border-line bg-surface p-2 transition-colors duration-300 hover:border-accent/60">
              <div className="overflow-hidden rounded-xl bg-white">
                <Image
                  src={project.image}
                  alt=""
                  width={768}
                  height={768}
                  sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 78vw"
                  className="aspect-square w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 items-center justify-between gap-3 p-3">
                <div className="min-w-0">
                  <p className="inline-block rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-[0.6875rem] text-muted">{project.category}</p>
                  <h3 translate="no" className="mt-2 truncate text-sm font-medium">{project.name}</h3>
                </div>
                {/* The link stretches over the whole card, so clicking the image or the name opens the project too */}
                <Link
                  href={`/${locale}/project/${project.slug}`}
                  aria-label={`${viewLabel}: ${project.name}`}
                  tabIndex={copy ? -1 : undefined}
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-line bg-bg text-fg transition-colors duration-300 after:absolute after:inset-0 after:rounded-2xl group-hover:border-primary group-hover:bg-primary group-hover:text-white"
                >
                  <ArrowUpRight aria-hidden className="size-4" />
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={!loops && position === 0}
          aria-label={a11y.previous}
          className="grid size-10 place-items-center rounded-full border border-line text-fg transition-colors duration-200 hover:border-accent disabled:opacity-40"
        >
          <ChevronLeft aria-hidden className="size-4" />
        </button>
        <div className="hidden items-center sm:flex">
          {dots.map((project, index) => (
            <button
              key={project.id}
              type="button"
              onClick={() => goToCard(index)}
              aria-label={`${a11y.goToSlide}: ${project.name}`}
              aria-current={index === position}
              className="grid size-5 place-items-center"
            >
              <span className={`size-1.5 rounded-full transition-colors duration-300 ${index === position ? 'bg-primary ring-2 ring-primary/40' : 'bg-white/25'}`} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={!loops && position >= maxPosition}
          aria-label={a11y.next}
          className="grid size-10 place-items-center rounded-full border border-line text-fg transition-colors duration-200 hover:border-accent disabled:opacity-40"
        >
          <ChevronRight aria-hidden className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-label={paused ? a11y.playMotion : a11y.pauseMotion}
          className="grid size-10 place-items-center rounded-full border border-line text-fg transition-colors duration-200 hover:border-accent"
        >
          {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
        </button>
      </div>
    </div>
  );
};

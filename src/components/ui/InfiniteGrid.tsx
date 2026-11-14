'use client';

import { Children, useEffect, useRef, useState, type ReactNode } from 'react';

interface InfiniteGridProps {
  children: ReactNode;
  className: string;
  // How many cards show at first and how many each step adds: four rows of three
  step?: number;
  moreLabel: string;
  // "{shown}" and "{total}" are filled in
  statusLabel: string;
}

// Shows the first cards and adds more as the visitor scrolls near the end, instead of page buttons.
// The button stays for keyboards and for browsers that never report the scroll.
export const InfiniteGrid = ({ children, className, step = 12, moreLabel, statusLabel }: InfiniteGridProps) => {
  const items = Children.toArray(children);
  const [shown, setShown] = useState(step);
  const sentinel = useRef<HTMLDivElement>(null);
  const total = items.length;
  const hasMore = shown < total;

  useEffect(() => {
    const element = sentinel.current;
    if (!hasMore || !element) return;
    // A new observer after each step reports at once if the end is still near, so a tall screen fills up.
    // The huge top margin also counts the end as reached once it is above the screen: a fast flick or the End key
    // can jump past it without it ever being on screen.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setShown((current) => Math.min(current + step, total));
      },
      { rootMargin: '100000px 0px 600px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasMore, shown, step, total]);

  return (
    <>
      <ul className={className}>{items.slice(0, shown)}</ul>
      <p aria-live="polite" className="sr-only">
        {statusLabel.replace('{shown}', String(Math.min(shown, total))).replace('{total}', String(total))}
      </p>
      {hasMore && (
        <div ref={sentinel} className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => setShown((current) => Math.min(current + step, total))}
            className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-line px-6 text-sm font-medium transition-colors duration-200 hover:border-primary hover:text-primary dark:hover:text-accent"
          >
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-primary motion-reduce:animate-none" />
            {moreLabel}
          </button>
        </div>
      )}
    </>
  );
};

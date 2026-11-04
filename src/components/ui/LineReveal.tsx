'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

// Where text wraps depends on the screen, so lines are counted at the moment the block enters view.
const assignLines = (root: HTMLElement) => {
  let line = -1;
  let lastTop: number | null = null;

  root.querySelectorAll<HTMLElement>('.line-word, [data-line-item]').forEach((element) => {
    const isItem = element.hasAttribute('data-line-item');
    const { top } = element.getBoundingClientRect();
    if (isItem || lastTop === null || Math.abs(top - lastTop) > 4) line += 1;
    element.style.setProperty('--line', String(line));
    lastTop = isItem ? null : top;
  });
};

const observers = new WeakMap<HTMLElement, IntersectionObserver>();

// Hides the block, then plays its reveal once it is in view. Calling this again replays it.
export const watchReveal = (element: HTMLElement) => {
  observers.get(element)?.disconnect();
  element.dataset.reveal = 'ready';

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      assignLines(element);
      element.dataset.reveal = 'in';
      observer.disconnect();
    },
    { rootMargin: '0px 0px -10% 0px' },
  );
  observer.observe(element);
  observers.set(element, observer);
};

// Reveals the LineText words and data-line-item elements inside it, one line after another.
// The hidden state is only set here, so text stays visible if JavaScript does not run.
export const LineReveal = ({ className, children }: { className?: string; children: ReactNode }) => {
  const container = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    watchReveal(element);
    return () => observers.get(element)?.disconnect();
  }, []);

  return (
    <div ref={container} className={className} data-line-reveal>
      {children}
    </div>
  );
};

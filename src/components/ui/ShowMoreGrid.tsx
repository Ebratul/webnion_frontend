'use client';

import { ArrowDown } from 'lucide-react';
import { Children, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '@/i18n/config';
import { formatNumber } from '@/lib/format';

interface ShowMoreGridProps {
  children: ReactNode;
  className: string;
  // How many cards show at first and how many each press adds: four rows of three
  step?: number;
  moreLabel: string;
  // "{shown}" and "{total}" are filled in
  statusLabel: string;
  locale: Locale;
}

// Shows the first four rows and a See More button instead of page numbers. Cards added by the button rise in row by row;
// the ones still below the screen keep the usual scroll reveal, so they rise as the visitor scrolls to them.
export const ShowMoreGrid = ({ children, className, step = 12, moreLabel, statusLabel, locale }: ShowMoreGridProps) => {
  const items = Children.toArray(children);
  const total = items.length;
  const [shown, setShown] = useState(Math.min(step, total));
  const list = useRef<HTMLUListElement>(null);
  // Where the last press started, so only the new cards are animated and focused
  const added = useRef<number | null>(null);

  // Before paint, so the new cards never flash in at full strength first
  useLayoutEffect(() => {
    const from = added.current;
    const element = list.current;
    added.current = null;
    if (from === null || !element) return;

    const columns = Math.max(getComputedStyle(element).gridTemplateColumns.split(' ').filter(Boolean).length, 1);
    const fresh = [...element.children].slice(from) as HTMLElement[];
    const screen = window.innerHeight;
    fresh.forEach((card, index) => {
      if (card.getBoundingClientRect().top >= screen) return;
      card.style.setProperty('--row', String(Math.floor(index / columns)));
      card.dataset.enter = '';
      card.addEventListener('animationend', () => delete card.dataset.enter, { once: true });
    });

    // Keyboard users carry on from the first new card instead of from a button that may now be gone
    fresh[0]?.querySelector<HTMLElement>('a:not([tabindex="-1"]), button')?.focus({ preventScroll: true });
  }, [shown]);

  const more = () => {
    added.current = shown;
    setShown((current) => Math.min(current + step, total));
  };

  return (
    <>
      <ul ref={list} className={className}>{items.slice(0, shown)}</ul>
      {total > step && (
        <div className="mt-12 flex flex-col items-center gap-3">
          {shown < total && (
            <button
              type="button"
              onClick={more}
              className="group/more inline-flex min-h-12 items-center gap-2.5 rounded-full border border-line bg-surface/60 px-7 text-sm font-semibold backdrop-blur transition-[border-color,color,background-color,box-shadow] duration-300 hover:border-primary hover:bg-primary hover:text-white hover:shadow-[0_14px_32px_-14px_var(--primary)]"
            >
              {moreLabel}
              <ArrowDown aria-hidden className="size-4 transition-transform duration-300 group-hover/more:translate-y-0.5 motion-reduce:transition-none" />
            </button>
          )}
          <p aria-live="polite" className="text-xs tabular-nums text-muted">
            {statusLabel.replace('{shown}', formatNumber(shown, locale)).replace('{total}', formatNumber(total, locale))}
          </p>
        </div>
      )}
    </>
  );
};

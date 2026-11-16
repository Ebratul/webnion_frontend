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

    const fresh = [...element.children].slice(from) as HTMLElement[];
    const screen = window.innerHeight;
    // Rows are read from where the cards sit, so grids and centred, wrapping rows both work
    const tops = [...new Set(fresh.map((card) => Math.round(card.getBoundingClientRect().top)))].sort((a, b) => a - b);
    fresh.forEach((card) => {
      const top = Math.round(card.getBoundingClientRect().top);
      if (top >= screen) return;
      card.style.setProperty('--row', String(tops.indexOf(top)));
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
      <ul ref={list} className={`show-more-grid ${className}`}>{items.slice(0, shown)}</ul>
      {total > step && (
        <div className="mt-14 flex flex-col items-center gap-2">
          {/* Plain text rather than a button shape, with a line that draws in under it on hover */}
          {shown < total && (
            <button
              type="button"
              onClick={more}
              className="group/more relative inline-flex min-h-11 items-center gap-2 px-2 text-[0.9375rem] font-semibold tracking-wide transition-colors duration-300 hover:text-accent focus-visible:text-accent"
            >
              <span className="relative">
                {moreLabel}
                <span aria-hidden className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/more:scale-x-100 group-focus-visible/more:scale-x-100" />
              </span>
              <ArrowDown aria-hidden className="see-more-arrow size-4" />
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

'use client';

import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import type { Dictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';
import { formatNumber } from '@/lib/format';
import type { Testimonial } from '@/lib/types';
import { ShowMoreGrid } from '../ui/ShowMoreGrid';
import { ReviewIdentity } from './ReviewIdentity';

interface ImageReviewsProps {
  items: Testimonial[];
  t: Dictionary['reviewsPage'];
  a11y: Dictionary['a11y'];
  locale: Locale;
}

const iconButton =
  'grid size-11 shrink-0 place-items-center rounded-full bg-primary text-white transition-colors duration-200 hover:bg-primary-hover disabled:opacity-40';

// Screenshots of client messages. Each card shows the top of the message; pressing it opens the whole message in a
// viewer that steps through all of them with the arrows, the arrow keys or a swipe.
export const ImageReviews = ({ items, t, a11y, locale }: ImageReviewsProps) => {
  const [index, setIndex] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);

  const current = index === null ? null : items[index];
  const many = items.length > 1;

  const open = (at: number, button: HTMLElement) => {
    opener.current = button;
    setIndex(at);
    dialog.current?.showModal();
  };

  const go = (step: number) => setIndex((at) => (at === null ? at : (at + step + items.length) % items.length));

  // Each message starts from its top
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [index]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (!many) return;
    if (event.key === 'ArrowRight') go(1);
    else if (event.key === 'ArrowLeft') go(-1);
    else return;
    event.preventDefault();
  };

  const onTouchStart = (event: TouchEvent) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: TouchEvent) => {
    const start = touchStart.current;
    const end = event.changedTouches[0]?.clientX;
    touchStart.current = null;
    if (!many || start === null || end === undefined || Math.abs(end - start) < 60) return;
    go(end < start ? 1 : -1);
  };

  return (
    <>
      <ShowMoreGrid className="flex flex-wrap justify-center gap-x-4 gap-y-8 sm:gap-x-5" moreLabel={t.showMore} statusLabel={t.showingImages} locale={locale}>
        {items.map((item, at) => (
          <li key={item.id} className="w-[calc((100%-1rem)/2)] sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-3.75rem)/4)]">
            <article>
              <button
                type="button"
                onClick={(event) => open(at, event.currentTarget)}
                aria-label={`${t.viewFull}: ${item.name}`}
                className="group/shot relative block aspect-[4/5] w-full overflow-hidden rounded-3xl border border-transparent bg-surface-2 transition-colors duration-300 hover:border-primary/40 focus-visible:border-primary/40"
              >
                <Image src={item.image} alt="" fill sizes="(min-width: 1024px) 280px, (min-width: 768px) 30vw, 46vw" className="object-cover object-top" />
                {/* The message carries on below the frame, so its foot fades out instead of ending on a cut line */}
                <span aria-hidden className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/55 to-transparent" />
                <span aria-hidden className="absolute bottom-3 right-3 grid size-9 place-items-center rounded-full bg-primary text-white transition-transform duration-300 group-hover/shot:scale-110 group-focus-visible/shot:scale-110">
                  <Maximize2 className="size-4" />
                </span>
              </button>
              <ReviewIdentity item={item} className="mt-4 px-1" />
            </article>
          </li>
        ))}
      </ShowMoreGrid>

      <dialog
        ref={dialog}
        onClose={() => {
          setIndex(null);
          opener.current?.focus({ preventScroll: true });
        }}
        onKeyDown={onKeyDown}
        aria-label={current ? `${t.viewFull}: ${current.name}` : t.viewFull}
        className="review-viewer m-auto w-[min(32rem,calc(94vw/var(--page-zoom)))] overflow-hidden rounded-3xl bg-transparent text-fg backdrop:bg-black/80"
      >
        {current && index !== null && (
          <div className="flex flex-col overflow-hidden rounded-3xl border border-line bg-surface" style={{ maxHeight: 'calc(92svh / var(--page-zoom))' }}>
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <ReviewIdentity item={current} />
              <form method="dialog">
                <button type="submit" aria-label={a11y.close} className={iconButton}>
                  <X aria-hidden className="size-5" />
                </button>
              </form>
            </div>

            {/* Focusable, so a long message can be scrolled with the keyboard too */}
            <div
              ref={scroller}
              tabIndex={0}
              aria-label={current.name}
              onTouchStart={onTouchStart}
              onTouchEnd={onTouchEnd}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-surface-2 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
            >
              <Image key={current.id} src={current.image} alt={`${t.imageEyebrow}: ${current.name}`} width={720} height={1600} sizes="(min-width: 640px) 512px, 94vw" className="review-viewer-image h-auto w-full" />
            </div>

            {many && (
              <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
                <button type="button" onClick={() => go(-1)} aria-label={a11y.previous} className={iconButton}>
                  <ChevronLeft aria-hidden className="size-5" />
                </button>
                <p aria-live="polite" className="text-sm tabular-nums text-muted">
                  {t.counter.replace('{current}', formatNumber(index + 1, locale)).replace('{total}', formatNumber(items.length, locale))}
                </p>
                <button type="button" onClick={() => go(1)} aria-label={a11y.next} className={iconButton}>
                  <ChevronRight aria-hidden className="size-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </dialog>
    </>
  );
};

'use client';

import { Play, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';
import type { Dictionary } from '@/i18n';
import type { Testimonial } from '@/lib/types';

interface TestimonialGridProps {
  testimonials: Testimonial[];
  t: Dictionary['testimonials'];
  a11y: Dictionary['a11y'];
}

const Identity = ({ item }: { item: Testimonial }) => (
  <div className="absolute inset-x-0 bottom-0 flex items-center gap-2.5 bg-gradient-to-t from-black via-black/85 to-transparent p-3 pt-10 text-left text-white">
    {item.avatar && (
      <Image src={item.avatar} alt="" width={36} height={36} sizes="36px" className="size-9 shrink-0 rounded-full bg-white object-cover" />
    )}
    <span className="min-w-0">
      <span translate="no" className="block truncate text-sm font-semibold">{item.name}</span>
      <span className="block truncate text-xs text-white/75">{item.role}</span>
    </span>
  </div>
);

export const TestimonialGrid = ({ testimonials, t, a11y }: TestimonialGridProps) => {
  // Only one video plays at a time: starting another swaps the first back to its poster.
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [resultItem, setResultItem] = useState<Testimonial | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const openResult = (item: Testimonial) => {
    setPlayingId(null);
    setResultItem(item);
    dialog.current?.showModal();
  };

  return (
    <>
      <ul className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto overscroll-x-contain px-5 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {testimonials.map((item) => (
          <li key={item.id} className="relative aspect-[4/5] w-[68%] shrink-0 snap-center overflow-hidden rounded-2xl border border-line bg-surface-2 sm:w-[40%] md:w-auto">
            {item.kind === 'VIDEO' && playingId === item.id && item.videoUrl ? (
              <video src={item.videoUrl} poster={item.image} controls autoPlay playsInline className="size-full bg-black object-contain">
                {t.videoUnsupported}
              </video>
            ) : (
              <button
                type="button"
                onClick={() => (item.kind === 'VIDEO' ? setPlayingId(item.id) : openResult(item))}
                className="group relative block size-full"
              >
                {/* Visible text stays part of the button's name, so voice control users can say what they see */}
                <span className="sr-only">{item.kind === 'VIDEO' ? a11y.playVideo : a11y.viewResult} </span>
                <Image src={item.image} alt="" fill sizes="(min-width: 768px) 280px, 68vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
                {item.kind === 'VIDEO' ? (
                  <span className="absolute left-1/2 top-[42%] grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-white shadow-lg transition-transform duration-200 group-hover:scale-110">
                    <Play aria-hidden className="ml-0.5 size-5 fill-current" />
                  </span>
                ) : (
                  <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-[0.6875rem] font-semibold text-ink shadow">{t.resultChip}</span>
                )}
                <Identity item={item} />
              </button>
            )}
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={() => setResultItem(null)}
        aria-label={resultItem?.name}
        className="m-auto max-h-[calc(92svh/var(--page-zoom))] w-[min(26rem,calc(92vw/var(--page-zoom)))] overflow-hidden rounded-2xl bg-transparent backdrop:bg-black/80 backdrop:backdrop-blur-sm"
      >
        {resultItem && (
          <div className="relative overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(92svh / var(--page-zoom))' }}>
            <form method="dialog" className="sticky top-0 z-10 flex h-0 justify-end">
              <button type="submit" aria-label={a11y.close} className="m-3 grid size-10 place-items-center rounded-full bg-primary text-white transition-colors duration-200 hover:bg-primary">
                <X aria-hidden className="size-5" />
              </button>
            </form>
            <Image src={resultItem.image} alt={`${t.resultChip}: ${resultItem.name}`} width={720} height={1600} sizes="416px" className="w-full" />
          </div>
        )}
      </dialog>
    </>
  );
};

'use client';

import { Play } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { Dictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';
import type { Testimonial } from '@/lib/types';
import { ShowMoreGrid } from '../ui/ShowMoreGrid';
import { ReviewIdentity } from './ReviewIdentity';

interface VideoReviewsProps {
  items: Testimonial[];
  t: Dictionary['reviewsPage'];
  unsupported: string;
  locale: Locale;
}

const VideoCard = ({ item, t, unsupported }: { item: Testimonial; t: Dictionary['reviewsPage']; unsupported: string }) => {
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playing) return;
    const element = video.current;
    // Keyboard users land on the player's controls instead of losing their place
    element?.focus({ preventScroll: true });
    // One voice at a time: starting another review pauses this one
    const onPlay = (event: Event) => {
      if (event.target !== element) element?.pause();
    };
    document.addEventListener('play', onPlay, true);
    return () => document.removeEventListener('play', onPlay, true);
  }, [playing]);

  return (
    <article>
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-transparent bg-surface-2 transition-colors duration-300 hover:border-primary/40 sm:aspect-[3/4]">
        {playing && item.videoUrl ? (
          <video ref={video} src={item.videoUrl} poster={item.image} controls autoPlay playsInline className="size-full bg-black object-contain">
            {unsupported}
          </video>
        ) : (
          <button type="button" onClick={() => setPlaying(true)} aria-label={`${t.play}: ${item.name}`} className="group/play relative block size-full">
            <Image src={item.image} alt="" fill sizes="(min-width: 1280px) 300px, (min-width: 1024px) 380px, (min-width: 640px) 46vw, 92vw" className="object-cover object-top" />
            <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <span aria-hidden className="review-play absolute left-1/2 top-1/2 grid size-[4.5rem] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white transition-colors duration-300 group-hover/play:bg-primary group-focus-visible/play:bg-primary lg:bg-white/20 lg:backdrop-blur-md">
              <Play className="ml-1 size-7 fill-current" />
            </span>
          </button>
        )}
      </div>
      <ReviewIdentity item={item} className="mt-4 px-1" />
    </article>
  );
};

// The page's video reviews: two, three, then four to a row, with a short last row centred, and the same row-by-row
// rise and See More as the other lists
export const VideoReviews = ({ items, t, unsupported, locale }: VideoReviewsProps) => (
  <ShowMoreGrid className="flex flex-wrap justify-center gap-x-5 gap-y-10" moreLabel={t.showMore} statusLabel={t.showingVideos} locale={locale}>
    {items.map((item) => (
      <li key={item.id} className="w-full sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)] xl:w-[calc((100%-3.75rem)/4)]">
        <VideoCard item={item} t={t} unsupported={unsupported} />
      </li>
    ))}
  </ShowMoreGrid>
);

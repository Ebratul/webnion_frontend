import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import type { DeliveryStory } from '@/lib/types';
import { PrimaryLink } from '../ui/Button';
import { DraggableMarquee } from '../ui/DraggableMarquee';
import { LineReveal } from '../ui/LineReveal';
import { LineText } from '../ui/LineText';

interface DeliveryStoriesProps {
  t: Dictionary['delivery'];
  stories: DeliveryStory[];
}

// Enough cards to fill a wide screen before the row repeats, however few stories the admin has added
const MIN_CARDS = 8;
// Each card takes this long to cross, so the speed stays the same as stories are added
const SECONDS_PER_CARD = 5;

const StoryCard = ({ story, copy }: { story: DeliveryStory; copy: boolean }) => (
  <li aria-hidden={copy || undefined} className="mr-5 w-64 shrink-0 sm:w-72 lg:w-80">
    <article className="relative aspect-[4/5] overflow-clip rounded-3xl bg-surface-2">
      <Image src={story.image} alt={copy ? '' : story.title} fill sizes="320px" draggable={false} className="object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-5 pt-20 text-white">
        <h3 className="text-base font-medium tracking-normal">{story.title}</h3>
        <p className="mt-0.5 text-xs text-white/80">{story.caption}</p>
      </div>
    </article>
  </li>
);

export const DeliveryStories = ({ t, stories }: DeliveryStoriesProps) => {
  const repeats = stories.length > 0 ? Math.ceil(MIN_CARDS / stories.length) : 0;
  const row = Array.from({ length: repeats }, () => stories).flat();

  return (
    <section aria-labelledby="delivery-title" className="section-y">
      <div className="container-page">
        <LineReveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <h2 id="delivery-title" className="max-w-2xl text-3xl font-semibold uppercase sm:text-4xl lg:text-[2.75rem]">
            <LineText text={t.title} />
          </h2>
          <div className="max-w-sm">
            <p className="text-sm text-muted">
              <LineText text={t.subtitle} />
            </p>
            <div data-line-item className="mt-4">
              <PrimaryLink href={`#${SECTION_IDS.contact}`}>{t.cta}</PrimaryLink>
            </div>
          </div>
        </LineReveal>
      </div>

      {row.length > 0 && (
        <DraggableMarquee className="mt-12">
          <div className="marquee-wrap fade-edges overflow-hidden">
            {/* The row moves right to left. Two identical halves let it loop, and only the first copy of each story is read out. */}
            <div className="marquee-track" style={{ animationDuration: `${row.length * SECONDS_PER_CARD}s` } as CSSProperties}>
              <ul className="flex">
                {row.map((story, index) => (
                  <StoryCard key={`${story.id}-${index}`} story={story} copy={index >= stories.length} />
                ))}
              </ul>
              <ul aria-hidden className="flex">
                {row.map((story, index) => (
                  <StoryCard key={`${story.id}-copy-${index}`} story={story} copy />
                ))}
              </ul>
            </div>
          </div>
        </DraggableMarquee>
      )}
    </section>
  );
};

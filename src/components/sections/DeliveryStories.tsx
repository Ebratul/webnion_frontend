import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatCounter } from '@/lib/format';
import { SECTION_IDS } from '@/lib/site';
import type { DeliveryStory } from '@/lib/types';
import { PrimaryLink } from '../ui/Button';
import { LineReveal } from '../ui/LineReveal';
import { LineText } from '../ui/LineText';

interface DeliveryStoriesProps {
  locale: Locale;
  t: Dictionary['delivery'];
  stories: DeliveryStory[];
}

export const DeliveryStories = ({ locale, t, stories }: DeliveryStoriesProps) => (
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

      {/* Drawn as the page scrolls, it reads the cards as stages of one journey */}
      <div aria-hidden className="relative mt-12 hidden h-3 lg:block">
        <span className="absolute inset-x-0 top-1/2 h-px bg-line" />
        <span className="story-line absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-primary" />
        <span className="absolute inset-0 grid grid-cols-4 gap-5">
          {stories.map((story) => (
            <span key={story.id} className="size-3 rounded-full bg-primary ring-4 ring-bg" />
          ))}
        </span>
      </div>

      <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:mt-6 lg:grid-cols-4">
        {stories.map((story, index) => (
          <li key={story.id} style={{ '--i': index } as CSSProperties} className="story-card">
            <article className="relative aspect-[4/5] overflow-clip rounded-3xl border border-line bg-surface-2 transition-[border-color] duration-300 hover:border-primary/50">
              <Image src={story.image} alt={story.title} fill sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw" className="story-photo object-cover" />
              <span aria-hidden className="absolute left-4 top-4 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold tabular-nums text-white backdrop-blur-sm">
                {formatCounter(index + 1, locale)}
              </span>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/65 to-transparent p-5 pt-16 text-white">
                <h3 className="text-base font-semibold tracking-normal">{story.title}</h3>
                <p className="mt-0.5 text-xs text-white/80">{story.caption}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

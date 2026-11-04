import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import type { DeliveryStory } from '@/lib/types';
import { PrimaryLink } from '../ui/Button';
import { LineReveal } from '../ui/LineReveal';
import { LineText } from '../ui/LineText';

export const DeliveryStories = ({ t, stories }: { t: Dictionary['delivery']; stories: DeliveryStory[] }) => (
  <section aria-labelledby="delivery-title" className="py-20 lg:py-28">
    <div className="container-page">
      <LineReveal className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <h2 id="delivery-title" className="max-w-2xl text-4xl font-bold uppercase sm:text-5xl">
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

      <ul tabIndex={0} aria-label={t.title} className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
        {stories.map((story) => (
          <li key={story.id} className="reveal w-[72%] shrink-0 snap-center sm:w-[42%] md:w-auto">
            <div className="overflow-hidden rounded-2xl bg-surface-2">
              <Image
                src={story.image}
                alt={story.title}
                width={600}
                height={760}
                sizes="(min-width: 768px) 280px, 72vw"
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            </div>
            <div className="mt-3 flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-bold">{story.title}</h3>
              <p className="text-right text-xs text-muted">{story.caption}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </section>
);

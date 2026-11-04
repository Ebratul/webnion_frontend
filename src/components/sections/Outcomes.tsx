import { Check } from 'lucide-react';
import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { PrimaryLink } from '../ui/Button';
import { LineReveal } from '../ui/LineReveal';
import { LineText } from '../ui/LineText';

const photoClass = 'rounded-2xl object-cover';

export const Outcomes = ({ t }: { t: Dictionary['outcomes'] }) => (
  <section aria-labelledby="outcomes-title" className="section-y bg-[#f7eee8] dark:bg-surface">
    <div className="mx-auto w-[min(62rem,calc(100%-2.5rem))]">
      <div className="grid gap-8 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <div className="flex flex-col justify-between gap-10">
          <LineReveal>
            <h2 id="outcomes-title" className="text-3xl font-medium sm:text-4xl lg:text-[2.75rem]">
              <LineText text={t.title} />
            </h2>
            <div data-line-item className="mt-7">
              <PrimaryLink href={`#${SECTION_IDS.contact}`}>{t.cta}</PrimaryLink>
            </div>
          </LineReveal>

          <div className="reveal grid grid-cols-2 gap-4 sm:gap-5 lg:max-w-[26rem]">
            <Image src="/images/outcomes/founder.webp" alt={t.photoFounder} width={560} height={644} sizes="(min-width: 768px) 210px, 45vw" className={`aspect-[5/6] w-full object-top ${photoClass}`} />
            <Image src="/images/outcomes/client-handover.webp" alt={t.photoHandover} width={560} height={644} sizes="(min-width: 768px) 210px, 45vw" className={`aspect-[5/6] w-full ${photoClass}`} />
          </div>
        </div>

        <div className="reveal relative aspect-[5/6] md:aspect-auto md:min-h-[35rem]">
          <Image src="/images/outcomes/team-at-work.webp" alt={t.photoTeam} fill sizes="(min-width: 768px) 460px, 100vw" className={photoClass} />
        </div>
      </div>

      <ul className="reveal mt-12 grid gap-x-8 gap-y-4 border-t border-fg/15 pt-7 sm:grid-cols-2 lg:grid-cols-4">
        {t.items.map((item) => (
          <li key={item} className="flex items-center gap-2.5 text-sm font-medium">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-white">
              <Check aria-hidden className="size-3.5" strokeWidth={3} />
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  </section>
);

import { Check } from 'lucide-react';
import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { PrimaryLink } from '../ui/Button';
import { LineReveal } from '../ui/LineReveal';
import { LineText } from '../ui/LineText';

const photoClass = 'rounded-2xl object-cover';

export const Outcomes = ({ t }: { t: Dictionary['outcomes'] }) => (
  <section aria-labelledby="outcomes-title" className="section-b">
    <div className="container-page">
      <div className="rounded-[2rem] bg-[#f7eee8] p-6 sm:p-10 lg:p-14 dark:bg-surface">
        <div className="grid gap-10 md:grid-cols-2 lg:gap-14">
          <div className="flex flex-col justify-between gap-10">
            <LineReveal>
              <h2 id="outcomes-title" className="text-3xl font-medium sm:text-4xl lg:text-[2.75rem]">
                <LineText text={t.title} />
              </h2>
              <div data-line-item className="mt-7">
                <PrimaryLink href={`#${SECTION_IDS.contact}`}>{t.cta}</PrimaryLink>
              </div>
            </LineReveal>

            <div className="reveal grid grid-cols-2 gap-5">
              <Image src="/images/outcomes/founder.webp" alt={t.photoFounder} width={560} height={644} sizes="(min-width: 768px) 260px, 45vw" className={`aspect-[5/6] w-full object-top ${photoClass}`} />
              <Image src="/images/outcomes/client-handover.webp" alt={t.photoHandover} width={560} height={644} sizes="(min-width: 768px) 260px, 45vw" className={`aspect-[5/6] w-full ${photoClass}`} />
            </div>
          </div>

          <div className="reveal relative aspect-[5/6] md:aspect-auto md:min-h-[36rem]">
            <Image src="/images/outcomes/team-at-work.webp" alt={t.photoTeam} fill sizes="(min-width: 768px) 520px, 100vw" className={photoClass} />
          </div>
        </div>

        <ul className="reveal mt-10 grid gap-x-5 gap-y-4 border-t border-fg/15 pt-7 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
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
    </div>
  </section>
);

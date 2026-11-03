import { ArrowUp, UserRound } from 'lucide-react';
import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { PrimaryLink } from '../ui/Button';
import { Eyebrow } from '../ui/SectionHeading';

export const Problems = ({ t }: { t: Dictionary['problems'] }) => (
  <section aria-labelledby="problems-title" className="pb-20 lg:pb-28">
    <div className="container-page">
      <div className="reveal grid items-center gap-10 overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-surface-2 via-surface to-tint p-6 sm:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:p-16">
        <div>
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 id="problems-title" className="mt-5 text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
            {t.titleLead} <span className="text-accent">{t.titleAccent}</span>
          </h2>
          <p className="mt-5 max-w-md text-muted">{t.subtitle}</p>
          <PrimaryLink href={`#${SECTION_IDS.contact}`} className="mt-8">
            {t.cta}
          </PrimaryLink>
        </div>

        <div className="relative xl:pt-24">
          <div aria-hidden className="absolute -left-8 top-0 z-10 hidden w-52 rounded-2xl border border-line bg-bg p-4 shadow-soft xl:block">
            <p className="text-xs font-semibold">{t.panelTitle}</p>
            <ul className="mt-3 space-y-2.5">
              {t.panelItems.map((item) => (
                <li key={item} className="flex items-center justify-between text-xs text-muted">
                  {item}
                  <span className="flex h-4 w-7 items-center justify-end rounded-full bg-primary p-0.5">
                    <span className="size-3 rounded-full bg-white" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-line bg-bg p-4 shadow-soft sm:p-5">
            <p className="border-b border-line pb-3 text-sm font-semibold xl:text-right">{t.chatTitle}</p>

            <ol className="mt-4 space-y-3">
              {t.pairs.map((pair) => (
                <li key={pair.problem} className="space-y-3">
                  <div className="flex items-start justify-end gap-2.5">
                    <p className="max-w-[80%] rounded-2xl rounded-tr-sm border border-line bg-surface px-3.5 py-2.5 text-[0.8125rem] leading-relaxed">
                      <span className="sr-only">{t.you}: </span>
                      {pair.problem}
                    </p>
                    <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
                      <UserRound className="size-4" />
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-tint">
                      <Image src="/icon.svg" alt="" width={20} height={20} unoptimized className="size-5 rounded" />
                    </span>
                    <p className="max-w-[80%] rounded-2xl rounded-tl-sm bg-primary px-3.5 py-2.5 text-[0.8125rem] leading-relaxed text-white">
                      <span className="sr-only">{t.webnion}: </span>
                      {pair.solution}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <a
              href={`#${SECTION_IDS.contact}`}
              className="group mt-4 flex items-center justify-between gap-3 rounded-2xl border border-line py-2 pl-4 pr-2 text-sm text-muted transition-colors duration-200 hover:border-accent"
            >
              {t.prompt}
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-white transition-transform duration-200 group-hover:-translate-y-0.5">
                <ArrowUp aria-hidden className="size-4" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

import { ArrowUp, Plus, SlidersHorizontal, Sparkles, UserRound, Zap } from 'lucide-react';
import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { LineReveal } from '../ui/LineReveal';
import { LineText } from '../ui/LineText';

const bubbleClass = 'max-w-[78%] rounded-2xl border border-line bg-bg px-3.5 py-2.5 text-[0.8125rem] leading-relaxed shadow-sm';

export const Problems = ({ t }: { t: Dictionary['problems'] }) => (
  <section aria-labelledby="problems-title" className="pb-20 lg:pb-28">
    <div className="container-page">
      <div className="reveal problems-sky grid items-center gap-10 overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:p-14">
        <LineReveal>
          <h2 id="problems-title" className="text-3xl font-medium sm:text-4xl lg:text-[2.75rem]">
            <span className="block">
              <LineText text={t.titleLead} />
            </span>
            <span className="problems-accent block">
              <LineText text={t.titleAccent} />
            </span>
          </h2>
          <p className="mt-5 max-w-md text-muted">
            <LineText text={t.subtitle} />
          </p>
          <div data-line-item className="mt-7">
            <a
              href={`#${SECTION_IDS.contact}`}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-b from-primary-hover to-primary px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_var(--primary)] transition-[filter] duration-200 hover:brightness-110"
            >
              <Zap aria-hidden className="size-4 fill-current" />
              {t.cta}
            </a>
          </div>
        </LineReveal>

        <div className="relative xl:pt-10">
          <div aria-hidden className="absolute -left-24 top-0 z-10 hidden w-48 rounded-2xl border border-line bg-bg p-3 shadow-soft xl:block">
            <p className="px-1 text-xs font-semibold">{t.panelTitle}</p>
            <ul className="mt-2.5 space-y-1.5">
              {t.panelItems.map((item) => (
                <li key={item} className="flex items-center justify-between gap-2 rounded-lg border border-line px-2.5 py-2 text-xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3 text-accent" />
                    {item}
                  </span>
                  <span className="flex h-4 w-7 items-center justify-end rounded-full bg-primary p-0.5">
                    <span className="size-3 rounded-full bg-white" />
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl bg-bg p-4 shadow-soft sm:p-5">
            <div className="flex items-center justify-between gap-3 pb-3">
              <span aria-hidden className="size-7 xl:hidden" />
              <p className="flex-1 text-center text-sm font-semibold">{t.chatTitle}</p>
              <span aria-hidden className="grid size-7 place-items-center rounded-full bg-gradient-to-br from-pink-300 to-primary">
                <UserRound className="size-3.5 text-white" />
              </span>
            </div>

            <ol tabIndex={0} aria-label={t.chatLabel} className="no-scrollbar max-h-[20rem] space-y-3 overflow-y-auto overscroll-contain rounded-xl py-1">
              {t.pairs.map((pair) => (
                <li key={pair.problem} className="space-y-3">
                  <div className="flex items-end justify-end gap-2">
                    <p className={bubbleClass}>
                      <span className="sr-only">{t.you}: </span>
                      {pair.problem}
                    </p>
                    <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
                      <UserRound className="size-4" />
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-pink-200 to-primary/50">
                      <Image src="/icon.svg" alt="" width={20} height={20} unoptimized className="size-5 rounded" />
                    </span>
                    <p className={bubbleClass}>
                      <span className="sr-only">{t.webnion}: </span>
                      {pair.solution}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <a href={`#${SECTION_IDS.contact}`} className="group mt-4 block rounded-2xl border border-line p-3 transition-colors duration-200 hover:border-accent">
              <span className="block px-1 text-sm text-muted">{t.prompt}</span>
              <span aria-hidden className="mt-3 flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full border border-line"><Plus className="size-4" /></span>
                <span className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-xs"><SlidersHorizontal className="size-3.5" />{t.tools}</span>
                <span className="ml-auto grid size-8 place-items-center rounded-full bg-ink text-white transition-transform duration-200 group-hover:-translate-y-0.5"><ArrowUp className="size-4" /></span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

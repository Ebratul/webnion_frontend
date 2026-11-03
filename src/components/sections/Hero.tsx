import { Check, CloudUpload } from 'lucide-react';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { PrimaryLink, SecondaryLink } from '../ui/Button';

export const Hero = ({ t }: { t: Dictionary['hero'] }) => (
  <section id="top" className="hero-sky relative isolate overflow-hidden">
    <div aria-hidden className="stars -z-10" />
    <div aria-hidden className="planet -z-10" />

    <div className="container-page flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-center pb-16 pt-28 text-center sm:pt-32">
      <p className="inline-flex items-center gap-2 rounded-full border border-line bg-bg/40 px-4 py-1.5 text-xs font-medium backdrop-blur">
        <CloudUpload aria-hidden className="size-4 text-accent" />
        {t.eyebrow}
      </p>

      <h1 className="mt-6 max-w-4xl text-4xl font-semibold sm:text-6xl lg:text-[4.25rem]">{t.title}</h1>

      <p className="mt-6 max-w-2xl text-muted sm:text-lg">{t.subtitle}</p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <PrimaryLink href={`#${SECTION_IDS.contact}`}>{t.primaryCta}</PrimaryLink>
        <SecondaryLink href={`#${SECTION_IDS.portfolio}`}>{t.secondaryCta}</SecondaryLink>
      </div>

      <ul className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-2.5">
        {t.points.map((point) => (
          <li key={point} className="flex items-center gap-2 text-sm font-medium">
            <span className="grid size-5 place-items-center rounded-full bg-tint text-accent">
              <Check aria-hidden className="size-3" strokeWidth={3} />
            </span>
            {point}
          </li>
        ))}
      </ul>
    </div>
  </section>
);

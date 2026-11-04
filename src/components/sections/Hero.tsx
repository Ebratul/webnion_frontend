import { Check, CloudUpload } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { PrimaryLink, SecondaryLink } from '../ui/Button';

// Entrance order in milliseconds: planet and eyebrow, then each heading line, the text, buttons and points.
const EYEBROW_AT = 150;
const TITLE_AT = 350;
const TITLE_STEP = 300;
const LINE_STEP = 130;

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

export const Hero = ({ t }: { t: Dictionary['hero'] }) => {
  const subtitleAt = TITLE_AT + t.titleLines.length * TITLE_STEP + 150;
  const buttonsAt = subtitleAt + t.subtitleLines.length * LINE_STEP + 100;
  const pointsAt = buttonsAt + 200;

  return (
    <section id="top" className="hero-sky relative isolate overflow-hidden">
      <div aria-hidden className="stars -z-10" />
      <div aria-hidden className="planet planet-rise -z-10" />
      <div aria-hidden className="planet-grain -z-10" />

      <div className="container-page flex min-h-[calc(100svh-4.5rem)] flex-col items-center justify-center pb-16 pt-24 text-center sm:pt-28">
        <p style={delay(EYEBROW_AT)} className="hero-fade inline-flex items-center gap-2 rounded-full border border-line bg-bg/40 px-4 py-1.5 text-xs font-medium backdrop-blur">
          <CloudUpload aria-hidden className="size-4 text-accent" />
          {t.eyebrow}
        </p>

        <h1 className="mt-6 text-[clamp(1.75rem,8vw,4.25rem)] font-medium">
          {t.titleLines.map((line, index) => (
            <span key={line} className="hero-line">
              <span style={delay(TITLE_AT + index * TITLE_STEP)}>{line} </span>
            </span>
          ))}
        </h1>

        <p style={delay(subtitleAt)} className="hero-fade hero-subtitle mt-6 max-w-2xl text-muted sm:max-w-none sm:text-lg">
          {t.subtitleLines.map((line, index) => (
            <span key={line} style={delay(subtitleAt + index * LINE_STEP)} className="hero-subline">
              {line}{' '}
            </span>
          ))}
        </p>

        <div style={delay(buttonsAt)} className="hero-fade mt-9 flex flex-wrap items-center justify-center gap-3">
          <PrimaryLink href={`#${SECTION_IDS.contact}`}>{t.primaryCta}</PrimaryLink>
          <SecondaryLink href={`#${SECTION_IDS.portfolio}`}>{t.secondaryCta}</SecondaryLink>
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-x-7 gap-y-2.5">
          {t.points.map((point, index) => (
            <li key={point} style={delay(pointsAt + index * LINE_STEP)} className="hero-fade flex items-center gap-2 text-sm font-medium">
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
};

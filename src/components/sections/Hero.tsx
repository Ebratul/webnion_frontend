import type { CSSProperties } from 'react';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { PrimaryLink } from '../ui/Button';
import { HeroMedia } from './HeroMedia';

// Entrance order in milliseconds: eyebrow, then each heading line, the text and the button.
const EYEBROW_AT = 150;
const TITLE_AT = 350;
const TITLE_STEP = 300;
const LINE_STEP = 130;

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

// background is the image the admin chose under Hero Background, or null for the plain gradient
export const Hero = ({ t, background }: { t: Dictionary['hero']; background: string | null }) => {
  const subtitleAt = TITLE_AT + t.titleLines.length * TITLE_STEP + 150;
  const buttonAt = subtitleAt + t.subtitleLines.length * LINE_STEP + 100;

  return (
    <section id="top" className="hero-sky hero-screen relative isolate flex flex-col justify-center overflow-hidden">
      {background && <HeroMedia src={background} />}
      <div className="container-page flex flex-col items-center pb-16 pt-28 text-center sm:pt-32">
        <p style={delay(EYEBROW_AT)} className="hero-fade rounded-full border border-fg/20 bg-fg/[0.06] px-4 py-1.5 text-[13px] font-medium">
          {t.eyebrow}
        </p>

        <h1 className="mt-7 text-[clamp(1.75rem,7.4vw,4rem)] font-medium leading-none dark:text-white [&:lang(bn)]:leading-[1.28] [&:lang(en)]:tracking-[-0.03em]">
          {t.titleLines.map((line, index) => (
            <span key={line} className="hero-line">
              <span style={delay(TITLE_AT + index * TITLE_STEP)}>{line} </span>
            </span>
          ))}
        </h1>

        <p style={delay(subtitleAt)} className="hero-fade hero-subtitle mt-8 max-w-xl leading-[1.625] text-fg/70 sm:max-w-none">
          {t.subtitleLines.map((line, index) => (
            <span key={line} style={delay(subtitleAt + index * LINE_STEP)} className="hero-subline">
              {line}{' '}
            </span>
          ))}
        </p>

        <div style={delay(buttonAt)} className="hero-fade mt-9">
          <PrimaryLink size="lg" href={`#${SECTION_IDS.contact}`}>{t.primaryCta}</PrimaryLink>
        </div>
      </div>
    </section>
  );
};

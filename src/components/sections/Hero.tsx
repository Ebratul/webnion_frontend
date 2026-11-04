import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import type { ClientLogo } from '@/lib/types';
import { PrimaryLink } from '../ui/Button';

// Entrance order in milliseconds: eyebrow, then each heading line, the text, the button and the logos.
const EYEBROW_AT = 150;
const TITLE_AT = 350;
const TITLE_STEP = 300;
const LINE_STEP = 130;

const VISIBLE_LOGOS = 5;

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

interface HeroProps {
  t: Dictionary['hero'];
  trust: Dictionary['trust'];
  clients: ClientLogo[];
}

export const Hero = ({ t, trust, clients }: HeroProps) => {
  const subtitleAt = TITLE_AT + t.titleLines.length * TITLE_STEP + 150;
  const buttonAt = subtitleAt + t.subtitleLines.length * LINE_STEP + 100;
  const logosAt = buttonAt + 250;

  return (
    <section id="top" className="hero-sky hero-screen relative isolate flex flex-col">
      <div className="container-page flex flex-col items-center pt-32 text-center sm:pt-[clamp(9rem,22svh,12.5rem)]">
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

      {clients.length > 0 && (
        <div style={delay(logosAt)} className="hero-fade container-page mt-auto pb-12 pt-20 text-center">
          <p className="text-sm text-fg/70">{trust.label}</p>
          {/* Shown as one flat colour, so logos need a transparent background */}
          <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 sm:gap-x-14">
            {clients.slice(0, VISIBLE_LOGOS).map((client) => (
              <li key={client.id} className="relative h-7 w-28 sm:h-9 sm:w-36">
                <Image src={client.logo} alt={client.name} fill sizes="144px" className="object-contain opacity-55 brightness-0 dark:opacity-60 dark:invert" />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

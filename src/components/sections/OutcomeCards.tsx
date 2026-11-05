import { Check } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { OutcomeCard } from '@/lib/types';
import { PrimaryLink } from '../ui/Button';

interface OutcomeCardsProps {
  locale: Locale;
  t: Dictionary['outcomeCards'];
  cards: OutcomeCard[];
}

// A saved /page link gets the visitor's language in front, unless it already has one
const buttonHref = (url: string, locale: Locale) => (url.startsWith('/') && !/^\/(en|bn)(\/|$)/.test(url) ? `/${locale}${url}` : url);

export const OutcomeCards = ({ locale, t, cards }: OutcomeCardsProps) => {
  if (cards.length === 0) return null;

  return (
    <section aria-labelledby="outcome-cards-title" className="pt-[var(--section-space)]">
      <h2 id="outcome-cards-title" className="sr-only">{t.label}</h2>
      <div className="container-page">
        <ol className="outcome-stack" style={{ '--steps': Math.max(cards.length - 1, 1) } as CSSProperties}>
          {cards.map((card, index) => {
            // The image changes sides from card to card
            const imageFirst = index % 2 === 0;
            return (
            <li
              key={card.id}
              className="outcome-item"
              style={{ '--i': index, viewTimelineName: `--outcome-${index}`, '--next': `--outcome-${index + 1}` } as CSSProperties}
            >
              <article className={`outcome-card band-light grid gap-6 rounded-2xl border border-line p-5 lg:gap-10 ${imageFirst ? 'lg:grid-cols-[27.5rem_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)_27.5rem]'}`}>
                <div className={`flex min-w-0 flex-col lg:py-2 ${imageFirst ? 'lg:order-2 lg:pr-3' : 'lg:pl-3'}`}>
                  {card.eyebrow && <p className="text-sm font-semibold leading-6 text-accent">{card.eyebrow}</p>}
                  <h3 className="mt-3 text-2xl font-medium sm:text-3xl lg:text-[2.25rem]">{card.title}</h3>
                  <p className="mt-3 text-sm text-muted sm:text-[0.9375rem]">{card.description}</p>

                  {card.points.length > 0 && (
                    <ul className="mt-5 grid gap-x-5 gap-y-2.5 sm:grid-cols-2">
                      {card.points.map((point) => (
                        <li key={point} className="flex items-start gap-2.5 text-[0.8125rem] font-medium leading-snug">
                          <span aria-hidden className="mt-px grid size-[1.125rem] shrink-0 place-items-center rounded-full bg-primary text-white">
                            <Check className="size-3" strokeWidth={3} />
                          </span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}

                  {card.buttonLabel && card.buttonUrl && (
                    <div className="mt-6 lg:mt-auto lg:pt-6">
                      <PrimaryLink href={buttonHref(card.buttonUrl, locale)}>{card.buttonLabel}</PrimaryLink>
                    </div>
                  )}
                </div>

                <div className={`relative aspect-[5/4] overflow-clip rounded-xl bg-[#f3f0fb] lg:aspect-auto ${imageFirst ? 'lg:order-1' : ''}`}>
                  <Image src={card.image} alt="" fill sizes="(min-width: 1024px) 484px, 100vw" className="outcome-image object-cover" />
                </div>
              </article>
            </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

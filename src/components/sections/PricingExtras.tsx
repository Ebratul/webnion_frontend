import { Check, ClipboardCheck, Headphones, MessagesSquare, PenTool, Rocket, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Dictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';
import { formatNumber } from '@/lib/format';
import { SECTION_IDS } from '@/lib/site';
import { PrimaryLink } from '../ui/Button';
import { Eyebrow } from '../ui/SectionHeading';

interface PricingExtrasProps {
  locale: Locale;
  t: Dictionary['pricingPage'];
  included: string[];
  steps: { title: string; text: string }[];
  extras: string[];
  // The plan cards, shown first on the same band
  plans: ReactNode;
}

// One icon per step, in order: the call, the plan, the build, the launch, then support for any extra steps
const STEP_ICONS: LucideIcon[] = [MessagesSquare, ClipboardCheck, PenTool, Rocket, Headphones];

// Below the plans on the Pricing page: what every project includes, what happens after booking, and the other services.
// The band stays dark in both themes, like the brand band, so the light pricing cards above stand out.
export const PricingExtras = ({ locale, t, included, steps, extras, plans }: PricingExtrasProps) => (
  <section id={SECTION_IDS.pricing} aria-labelledby="pricing-title" className="band-dark pricing-night section-y relative isolate overflow-hidden">
    <div className="container-page">
      {plans}

      {included.length > 0 && (
        <div className="reveal mt-10 flex flex-col gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-5 py-4 text-[0.8125rem] sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-4 sm:gap-y-2 sm:rounded-full sm:px-6 sm:py-3.5">
          <p className="font-semibold text-white">{t.includedLabel}:</p>
          {/* A list down the side on phones, one line on wide screens; long items wrap rather than overflow */}
          <ul className="flex flex-col gap-2.5 sm:contents">
            {included.map((item) => (
              <li key={item} className="inline-flex items-center gap-1.5 whitespace-nowrap text-white/75">
                <span aria-hidden className="grid size-4 shrink-0 place-items-center rounded-full bg-primary text-white">
                  <Check className="size-2.5" strokeWidth={3.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <section aria-labelledby="after-booking-title" className="reveal pricing-panel relative mt-8 overflow-hidden rounded-[1.75rem] p-6 sm:p-8 lg:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 id="after-booking-title" className="text-[1.75rem] font-medium sm:text-4xl">
            {t.stepsTitleLead} <span className="pricing-accent">{t.stepsTitleAccent}</span>
          </h2>
          <p className="mt-3 text-sm text-muted sm:text-base">{t.stepsSubtitle}</p>
        </div>

        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[index] ?? Headphones;
            return (
              <li key={`${index}-${step.title}`} className="pricing-step group relative flex flex-col rounded-2xl p-5">
                <div className="flex items-center justify-between">
                  <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-primary/15 text-accent ring-1 ring-inset ring-white/10 transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-xs font-medium tabular-nums text-white/45">
                    {t.step} {formatNumber(index + 1, locale)}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold leading-snug">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{step.text}</p>
              </li>
            );
          })}
        </ol>
      </section>

      {extras.length > 0 && (
        <div className="mt-16 lg:mt-20">
          <div className="reveal mx-auto max-w-2xl text-center">
            <Eyebrow>{t.extrasEyebrow}</Eyebrow>
            <h2 className="mt-5 text-3xl font-medium sm:text-4xl lg:text-[2.75rem]">
              <span className="block">{t.extrasTitleLead}</span>
              <span className="problems-accent block">{t.extrasTitleAccent}</span>
            </h2>
          </div>

          <div className="reveal pricing-glass mt-8 rounded-[1.75rem] p-6 sm:p-8 lg:mt-10 lg:p-10">
            <ul className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
              {extras.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[0.9375rem] leading-snug text-white/85">
                  <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.5} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col items-start gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
              <p className="max-w-xl text-sm text-muted">{t.extrasText}</p>
              <PrimaryLink href={`/${locale}/contact`}>{t.extrasCta}</PrimaryLink>
            </div>
          </div>
        </div>
      )}
    </div>
  </section>
);

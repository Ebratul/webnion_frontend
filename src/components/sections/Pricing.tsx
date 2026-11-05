import { ArrowDown, ArrowRight, Check, Zap } from 'lucide-react';
import type { CSSProperties } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatPrice } from '@/lib/format';
import { SECTION_IDS } from '@/lib/site';
import type { PricingPlan } from '@/lib/types';
import { SectionHeading } from '../ui/SectionHeading';
import { ServiceLink } from '../ui/ServiceLink';

interface PricingProps {
  locale: Locale;
  t: Dictionary['pricing'];
  plans: PricingPlan[];
}

// Colours follow the client's image and stay the same in both themes.
const monoLabel = 'uppercase text-[#666] [&:lang(en)]:font-mono';

// Slides in beside the label on hover and on keyboard focus
const ButtonArrow = () => (
  <ArrowRight
    aria-hidden
    className="ml-0 size-4 w-0 opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:w-4 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:w-4 group-focus-visible:opacity-100"
  />
);

// Every plan has the same rows, so they line up across the cards. The highlighted plan adds its icon and badge above them.
const Plan = ({ plan, t, locale }: { plan: PricingPlan; t: Dictionary['pricing']; locale: Locale }) => (
  <li
    className={`flex flex-col rounded-2xl bg-white ${
      plan.isFeatured ? 'border-2 border-primary p-[calc(1.25rem-1px)] shadow-[0_24px_56px_-18px_rgb(130_36_227/0.5)] lg:-mb-4 lg:-mt-14' : 'border border-[#ececec] p-5 shadow-[0_14px_40px_-24px_rgb(0_0_0/0.2)]'
    }`}
  >
    {plan.isFeatured && (
      <div className="mb-3 flex h-11 items-center justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-full border border-[#dedede] text-accent">
          <Zap aria-hidden className="size-5 fill-current" strokeWidth={1.5} />
        </span>
        {plan.badge && <span className="whitespace-nowrap rounded-full border border-primary/30 bg-tint px-3 py-1 text-[13px] font-medium text-accent">{plan.badge}</span>}
      </div>
    )}

    <h3 className="text-lg font-medium text-[#2b2b2b]">{plan.name}</h3>
    <p className="mt-1 text-[13px] leading-snug text-[#6f6f6f] lg:min-h-[3.25rem]">{plan.tagline}</p>

    <p className="mt-6 flex items-center gap-2">
      <span className="text-[1.875rem] font-medium leading-none tabular-nums text-[#111]">{formatPrice(plan.price, plan.currency, locale)}</span>
      {plan.price > 0 && <span className={`text-[10px] ${monoLabel}`}>{t.starting}</span>}
    </p>

    <ServiceLink
      slug={plan.slug}
      className="plan-btn group mt-3 flex min-h-10 items-center justify-center rounded-[5px] bg-primary text-sm font-medium text-white hover:bg-primary-hover hover:shadow-[0_12px_24px_-10px_var(--primary)] focus-visible:bg-primary-hover"
    >
      {t.cta}
      <ButtonArrow />
    </ServiceLink>

    <div className="mt-7 flex-1">
      <p className={`text-[11px] ${monoLabel}`}>{t.included}</p>
      <ul className="mt-3.5 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-[13.5px] leading-snug text-[#444]">
            <Check aria-hidden className={`mt-0.5 size-3.5 shrink-0 ${plan.isFeatured ? 'text-accent' : 'text-[#9a9a9a]'}`} strokeWidth={plan.isFeatured ? 2.5 : 1.75} />
            {feature}
          </li>
        ))}
      </ul>
    </div>

    <ServiceLink slug={plan.slug} className="group mt-8 inline-flex items-center gap-2 self-start py-1 text-xs text-[#6f6f6f] transition-colors duration-200 hover:text-accent">
      <ArrowDown aria-hidden className="size-3.5 transition-transform duration-200 group-hover:translate-y-0.5" strokeWidth={1.75} />
      {t.askPlan}
    </ServiceLink>
  </li>
);

export const Pricing = ({ locale, t, plans }: PricingProps) => (
  <section id={SECTION_IDS.pricing} aria-labelledby="pricing-title" className="band-light section-y flush-light">
    <div className="container-page">
      <div className="[&_h2]:font-semibold [&_h2]:text-[#1a1a1a]">
        <SectionHeading id="pricing-title" title={t.title} />
      </div>

      {/* Separate cards with one gap. The highlighted plan reaches above the others by the height of its icon row, which this margin allows for. */}
      <div className="reveal mt-12 lg:mt-[6.5rem]">
        <ul style={{ '--plan-count': plans.length } as CSSProperties} className="grid gap-5 lg:grid-cols-[repeat(var(--plan-count),minmax(0,1fr))]">
          {plans.map((plan) => (
            <Plan key={plan.id} plan={plan} t={t} locale={locale} />
          ))}
        </ul>
      </div>

      <p className="reveal mx-auto mt-12 max-w-2xl text-center lg:mt-16 text-xs leading-relaxed text-[#6f6f6f]">{t.note}</p>
    </div>
  </section>
);

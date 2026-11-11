import { ArrowRight, Check } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatPriceParts } from '@/lib/format';
import { SECTION_IDS } from '@/lib/site';
import type { PricingPlan } from '@/lib/types';
import { SectionHeading } from '../ui/SectionHeading';
import { ServiceLink } from '../ui/ServiceLink';

interface PricingProps {
  locale: Locale;
  t: Dictionary['pricing'];
  plans: PricingPlan[];
}

// Slides in beside the label on hover and on keyboard focus
const ButtonArrow = () => (
  <ArrowRight
    aria-hidden
    className="ml-0 size-4 w-0 opacity-0 transition-all duration-300 group-hover:ml-2 group-hover:w-4 group-hover:opacity-100 group-focus-visible:ml-2 group-focus-visible:w-4 group-focus-visible:opacity-100"
  />
);

const Price = ({ plan, locale }: { plan: PricingPlan; locale: Locale }) => {
  const { symbol, amount, symbolFirst } = formatPriceParts(plan.price, plan.currency, locale);
  const sign = <span className="self-start pt-1 text-xl font-medium text-[#555]">{symbol}</span>;

  return (
    <p className="mt-7 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
      <span className="inline-flex items-baseline gap-0.5">
        {symbolFirst && sign}
        <span className="text-5xl font-medium leading-none tabular-nums text-[#111]">{amount}</span>
        {!symbolFirst && sign}
      </span>
      {plan.priceLabel && <span className="ml-1 text-sm text-[#6f6f6f]">{plan.priceLabel}</span>}
    </p>
  );
};

// Laid out like the reference: name and badge, tagline, price, the button, what the plan offers, and an optional note
// at the foot. Every card has the same rows, so they line up, and the highlighted plan stands out through colour alone.
const Plan = ({ plan, t, locale }: { plan: PricingPlan; t: Dictionary['pricing']; locale: Locale }) => (
  <li
    className={`flex flex-col rounded-3xl border p-7 lg:p-8 ${
      plan.isFeatured ? 'border-primary bg-[color-mix(in_srgb,var(--primary)_4%,white)] shadow-[0_24px_56px_-24px_color-mix(in_srgb,var(--primary)_45%,transparent)] ring-1 ring-primary' : 'border-[#e8e8e8] bg-white shadow-[0_14px_40px_-28px_rgb(0_0_0/0.25)]'
    }`}
  >
    <div className="flex min-h-8 items-center justify-between gap-3">
      <h3 className="text-xl font-semibold text-[#1a1a1a]">{plan.name}</h3>
      {plan.badge && <span className="whitespace-nowrap rounded-full border border-primary/30 bg-tint px-3 py-1 text-xs font-medium text-accent">{plan.badge}</span>}
    </div>
    <p className="mt-2 text-sm leading-snug text-[#6f6f6f] lg:min-h-10">{plan.tagline}</p>

    <Price plan={plan} locale={locale} />

    <ServiceLink
      slug={plan.slug}
      className="plan-btn group mt-7 flex min-h-12 items-center justify-center rounded-full bg-primary px-5 text-[0.9375rem] font-medium text-white hover:bg-primary-hover hover:shadow-[0_12px_24px_-10px_var(--primary)] focus-visible:bg-primary-hover"
    >
      {plan.buttonLabel ?? t.cta}
      <ButtonArrow />
    </ServiceLink>

    <ul className="mt-8 flex-1 space-y-3.5 border-t border-[#ececec] pt-7">
      {plan.features.map((feature) => (
        <li key={feature} className="flex items-start gap-3 text-[0.9375rem] leading-snug text-[#3d3d3d]">
          <span aria-hidden className={`mt-px grid size-5 shrink-0 place-items-center rounded-full ${plan.isFeatured ? 'bg-primary text-white' : 'bg-tint text-accent'}`}>
            <Check className="size-3" strokeWidth={3} />
          </span>
          {feature}
        </li>
      ))}
    </ul>

    {plan.note && <p className="mt-8 text-xs leading-relaxed text-[#6f6f6f]">{plan.note}</p>}
  </li>
);

export const Pricing = ({ locale, t, plans }: PricingProps) => (
  <section id={SECTION_IDS.pricing} aria-labelledby="pricing-title" className="band-light section-y flush-light">
    <div className="container-page">
      <div className="[&_h2]:font-semibold [&_h2]:text-[#1a1a1a]">
        <SectionHeading id="pricing-title" title={t.title} />
      </div>

      <ul className="reveal mx-auto mt-12 grid max-w-xl gap-5 lg:max-w-none lg:grid-cols-3">
        {plans.map((plan) => (
          <Plan key={plan.id} plan={plan} t={t} locale={locale} />
        ))}
      </ul>

      <p className="reveal mx-auto mt-12 max-w-2xl text-center text-xs leading-relaxed text-[#6f6f6f]">{t.note}</p>
    </div>
  </section>
);

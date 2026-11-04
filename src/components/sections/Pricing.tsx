import { ArrowUpRight, Check, Zap } from 'lucide-react';
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

const PlanSummary = ({ plan, t, locale }: { plan: PricingPlan; t: Dictionary['pricing']; locale: Locale }) => (
  <>
    <h3 className="text-xl font-semibold">{plan.name}</h3>
    <p className="mt-1 min-h-11 text-sm text-muted">{plan.tagline}</p>
    <p className="mt-4 flex items-baseline gap-2">
      <span className="text-4xl font-semibold tabular-nums sm:text-5xl">{formatPrice(plan.price, plan.currency, locale)}</span>
      <span className="text-sm text-muted">{t.starting}</span>
    </p>
  </>
);

const PlanFeatures = ({ plan, t }: { plan: PricingPlan; t: Dictionary['pricing'] }) => (
  <>
    <p className="text-xs font-semibold uppercase text-muted [&:lang(en)]:tracking-wider">{t.included}</p>
    <ul className="mt-4 space-y-3">
      {plan.features.map((feature) => (
        <li key={feature} className="flex items-start gap-2.5 text-sm">
          <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2.5} />
          {feature}
        </li>
      ))}
    </ul>
  </>
);

const planLinkClass = 'flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors duration-200';

export const Pricing = ({ locale, t, plans }: PricingProps) => (
  <section id={SECTION_IDS.pricing} aria-labelledby="pricing-title" className="section-y">
    <div className="container-page">
      <SectionHeading id="pricing-title" eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

      {/* Desktop: plans share one table-like card, and the highlighted plan lifts out of it */}
      <div className="reveal relative mt-12 lg:mt-24">
        <div aria-hidden className="absolute inset-0 hidden rounded-3xl border border-line bg-bg shadow-soft lg:block" />
        <ul
          style={{ '--plan-count': plans.length } as CSSProperties}
          className="relative grid gap-6 lg:grid-cols-[repeat(var(--plan-count),minmax(0,1fr))] lg:gap-0"
        >
          {plans.map((plan) =>
            plan.isFeatured ? (
              <li key={plan.id} className="relative z-10 flex flex-col rounded-[2rem] border-2 border-primary bg-surface p-3 shadow-soft lg:-mb-4 lg:-mt-14">
                <div className="p-4 sm:p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-full border border-line bg-bg text-accent">
                      <Zap aria-hidden className="size-5 fill-current" />
                    </span>
                    {plan.badge && <span className="rounded-full border border-primary/40 bg-tint px-3 py-1 text-xs font-semibold text-accent">{plan.badge}</span>}
                  </div>
                  <PlanSummary plan={plan} t={t} locale={locale} />
                </div>
                <div className="flex flex-1 flex-col rounded-3xl bg-bg p-4 sm:p-5">
                  <PlanFeatures plan={plan} t={t} />
                  <div className="mt-auto pt-6">
                    <ServiceLink slug={plan.slug} className={`${planLinkClass} bg-gradient-to-b from-primary-hover to-primary text-white hover:from-primary hover:to-primary`}>
                      {t.cta}
                      <ArrowUpRight aria-hidden className="size-4" />
                    </ServiceLink>
                  </div>
                </div>
              </li>
            ) : (
              <li key={plan.id} className="rounded-3xl border border-line bg-bg p-6 sm:p-8 lg:rounded-none lg:border-0 lg:bg-transparent">
                <PlanSummary plan={plan} t={t} locale={locale} />
                <ServiceLink slug={plan.slug} className={`${planLinkClass} mt-5 bg-tint text-accent hover:bg-primary hover:text-white`}>
                  {t.cta}
                  <ArrowUpRight aria-hidden className="size-4" />
                </ServiceLink>
                <div className="mt-7">
                  <PlanFeatures plan={plan} t={t} />
                </div>
              </li>
            ),
          )}
        </ul>
      </div>

      <p className="reveal mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted">{t.note}</p>

      <div className="reveal mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6 text-center md:flex-row md:text-left">
        <p className="font-medium">{t.customTitle}</p>
        <a
          href={`#${SECTION_IDS.contact}`}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-accent transition-transform duration-200 hover:translate-x-0.5"
        >
          {t.customCta}
          <ArrowUpRight aria-hidden className="size-4" />
        </a>
      </div>
    </div>
  </section>
);

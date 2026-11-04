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

const PlanName = ({ plan }: { plan: PricingPlan }) => (
  <>
    <h3 className="text-xl font-semibold">{plan.name}</h3>
    <p className="mt-1 min-h-11 text-sm text-muted">{plan.tagline}</p>
  </>
);

const PlanPrice = ({ plan, t, locale }: { plan: PricingPlan; t: Dictionary['pricing']; locale: Locale }) => (
  <p className="flex items-baseline gap-2">
    <span className="text-4xl font-semibold tabular-nums">{formatPrice(plan.price, plan.currency, locale)}</span>
    <span className="text-xs font-medium uppercase text-muted [&:lang(en)]:tracking-wide">{t.starting}</span>
  </p>
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

const buttonClass = 'flex items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white transition-colors duration-200';

export const Pricing = ({ locale, t, plans }: PricingProps) => (
  <section id={SECTION_IDS.pricing} aria-labelledby="pricing-title" className="section-y">
    <div className="container-page">
      <SectionHeading id="pricing-title" title={t.title} />

      {/* Desktop: plans share one table, and the highlighted plan lifts out of it as its own card */}
      <div className="reveal relative mt-12 lg:mt-24">
        <div aria-hidden className="absolute inset-0 hidden rounded-2xl border border-line bg-bg shadow-soft lg:block" />
        <ul
          style={{ '--plan-count': plans.length } as CSSProperties}
          className="relative grid gap-6 lg:grid-cols-[repeat(var(--plan-count),minmax(0,1fr))] lg:gap-0"
        >
          {plans.map((plan) =>
            plan.isFeatured ? (
              <li key={plan.id} className="relative z-10 flex flex-col rounded-[2.25rem] border-4 border-bg bg-surface-2 p-2 shadow-soft ring-1 ring-primary/40 lg:-mb-5 lg:-mt-14">
                <div className="p-4 sm:p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="grid size-11 place-items-center rounded-full border border-line bg-bg text-accent">
                      <Zap aria-hidden className="size-5 fill-current" />
                    </span>
                    {plan.badge && <span className="rounded-full border border-primary/40 bg-tint px-3 py-1 text-xs font-semibold text-accent">{plan.badge}</span>}
                  </div>
                  <PlanName plan={plan} />
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <PlanPrice plan={plan} t={t} locale={locale} />
                    <span className="max-w-24 text-right text-xs leading-snug text-muted">{t.projectBased}</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col rounded-[1.75rem] bg-bg p-4 shadow-soft sm:p-5">
                  <PlanFeatures plan={plan} t={t} />
                  <div className="mt-auto pt-6">
                    <ServiceLink slug={plan.slug} className={`${buttonClass} min-h-14 rounded-full bg-gradient-to-b from-primary-hover to-primary hover:from-primary hover:to-primary`}>
                      {t.cta}
                    </ServiceLink>
                  </div>
                </div>
              </li>
            ) : (
              <li key={plan.id} className="flex flex-col rounded-2xl border border-line bg-bg p-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:[&:not(:first-child)]:border-l">
                <PlanName plan={plan} />
                <div className="mt-4">
                  <PlanPrice plan={plan} t={t} locale={locale} />
                </div>
                <ServiceLink slug={plan.slug} className={`${buttonClass} mt-4 min-h-10 bg-primary hover:bg-primary-hover`}>
                  {t.cta}
                </ServiceLink>
                <div className="mt-7 flex-1">
                  <PlanFeatures plan={plan} t={t} />
                </div>
                <ServiceLink slug={plan.slug} className="mt-7 inline-flex items-center gap-1.5 self-start py-1 text-xs font-medium text-muted transition-colors duration-200 hover:text-accent">
                  <ArrowUpRight aria-hidden className="size-3.5" />
                  {t.askPlan}
                </ServiceLink>
              </li>
            ),
          )}
        </ul>
      </div>

      <p className="reveal mx-auto mt-12 max-w-2xl text-center text-xs leading-relaxed text-muted">{t.note}</p>
    </div>
  </section>
);

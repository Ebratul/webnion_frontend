import { ArrowUpRight, Check, Zap } from 'lucide-react';
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

export const Pricing = ({ locale, t, plans }: PricingProps) => (
  <section id={SECTION_IDS.pricing} aria-labelledby="pricing-title" className="section-y">
    <div className="container-page">
      <SectionHeading id="pricing-title" eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />

      <ul className="reveal mt-12 grid items-center gap-6 lg:grid-cols-3 lg:gap-0">
        {plans.map((plan, index) => {
          const featured = plan.isFeatured;
          return (
            <li
              key={plan.id}
              className={
                featured
                  ? 'relative z-10 rounded-3xl border-2 border-primary bg-surface p-3 shadow-soft lg:-my-4'
                  : `border border-line bg-bg p-3 ${index === 0 ? 'rounded-3xl lg:rounded-r-none lg:border-r-0' : 'rounded-3xl lg:rounded-l-none lg:border-l-0'}`
              }
            >
              <div className="p-4 sm:p-5">
                <div className="flex min-h-11 items-start justify-between gap-3">
                  {featured ? (
                    <span className="grid size-11 place-items-center rounded-full bg-tint text-accent">
                      <Zap aria-hidden className="size-5 fill-current" />
                    </span>
                  ) : (
                    <span aria-hidden />
                  )}
                  {plan.badge && <span className="rounded-full border border-primary/40 bg-tint px-3 py-1 text-xs font-semibold text-accent">{plan.badge}</span>}
                </div>
                <h3 className="mt-3 text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 min-h-11 text-sm text-muted">{plan.tagline}</p>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-semibold tabular-nums sm:text-5xl">{formatPrice(plan.price, plan.currency, locale)}</span>
                  <span className="text-sm text-muted">{t.starting}</span>
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted">{t.note}</p>
              </div>

              <div className={`rounded-2xl p-4 sm:p-5 ${featured ? 'bg-bg' : ''}`}>
                <p className="text-xs font-semibold uppercase text-muted [&:lang(en)]:tracking-wider">{t.included}</p>
                <ul className="mt-4 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2.5} />
                      {feature}
                    </li>
                  ))}
                </ul>
                <ServiceLink
                  slug={plan.slug}
                  className={`group mt-6 flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors duration-200 ${
                    featured
                      ? 'bg-gradient-to-b from-primary-hover to-primary text-white hover:from-primary hover:to-primary'
                      : 'border border-line text-fg hover:border-accent hover:text-accent'
                  }`}
                >
                  {t.cta}
                  <ArrowUpRight aria-hidden className="size-4" />
                </ServiceLink>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="reveal mt-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-line bg-surface p-6 text-center md:flex-row md:text-left">
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

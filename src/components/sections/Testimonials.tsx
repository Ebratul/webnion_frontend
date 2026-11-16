import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import type { Testimonial } from '@/lib/types';
import { SectionHeading } from '../ui/SectionHeading';
import { RatingSummary } from './RatingSummary';
import { TestimonialGrid } from './TestimonialGrid';

interface TestimonialsProps {
  locale: Locale;
  t: Dictionary['testimonials'];
  a11y: Dictionary['a11y'];
  testimonials: Testimonial[];
}

export const Testimonials = ({ locale, t, a11y, testimonials }: TestimonialsProps) => (
  <section aria-labelledby="testimonials-title" className="pt-[var(--section-space)]">
    <div className="container-page">
      <SectionHeading id="testimonials-title" title={t.title} subtitle={t.subtitle} />
    </div>

    <div className="section-y mt-12 bg-[#f7f7fe] dark:bg-surface">
      <div className="container-page">
        <RatingSummary locale={locale} t={t} a11y={a11y} testimonials={testimonials} />

        <div className="mt-10">
          <TestimonialGrid testimonials={testimonials} t={t} a11y={a11y} />
        </div>

        <div className="mt-10 text-center">
          <Link href={`/${locale}/reviews`} className="group/all inline-flex min-h-11 items-center gap-2 px-2 text-[0.9375rem] font-semibold transition-colors duration-300 hover:text-accent">
            <span className="relative">
              {t.seeAll}
              <span aria-hidden className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/all:scale-x-100 group-focus-visible/all:scale-x-100" />
            </span>
            <ArrowRight aria-hidden className="size-4 transition-transform duration-300 group-hover/all:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

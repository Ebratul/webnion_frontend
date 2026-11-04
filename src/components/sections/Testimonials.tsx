import { Star } from 'lucide-react';
import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { formatScore } from '@/lib/format';
import type { Testimonial } from '@/lib/types';
import { SectionHeading } from '../ui/SectionHeading';
import { TestimonialGrid } from './TestimonialGrid';

interface TestimonialsProps {
  locale: Locale;
  t: Dictionary['testimonials'];
  a11y: Dictionary['a11y'];
  testimonials: Testimonial[];
}

export const Testimonials = ({ locale, t, a11y, testimonials }: TestimonialsProps) => {
  const avatars = testimonials.filter((item) => item.avatar).slice(0, 5);

  return (
    <section aria-labelledby="testimonials-title" className="pt-20 lg:pt-24">
      <div className="container-page">
        <SectionHeading id="testimonials-title" eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
      </div>

      <div className="mt-10 bg-[#f7f7fe] py-10 lg:py-14 dark:bg-surface">
        <div className="container-page">
        <div className="reveal flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <div aria-hidden className="flex items-center">
            {avatars.map((item) => (
              <Image key={item.id} src={item.avatar!} alt="" width={36} height={36} sizes="36px" className="-ml-2 size-9 rounded-full border-2 border-white bg-white dark:border-bg object-cover first:ml-0" />
            ))}
            <span className="-ml-2 grid size-9 place-items-center rounded-full border-2 border-white bg-primary dark:border-bg text-[0.625rem] font-semibold text-white">{t.happyCount}</span>
          </div>
          {t.ratings.map((rating) => (
            <p key={rating.label} className="flex items-center gap-2 text-sm">
              <span className="font-medium">{rating.label}</span>
              <span aria-hidden className="flex text-amber-400">
                {Array.from({ length: 5 }, (_, index) => (
                  <Star key={index} className="size-3.5 fill-current" />
                ))}
              </span>
              <span className="sr-only">{a11y.rated}</span>
              <span className="font-semibold tabular-nums">{formatScore(rating.score, locale)}</span>
            </p>
          ))}
        </div>

        <div className="mt-10">
          <TestimonialGrid testimonials={testimonials} t={t} a11y={a11y} />
        </div>
        </div>
      </div>
    </section>
  );
};

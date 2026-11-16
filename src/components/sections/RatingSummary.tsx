import { Star } from 'lucide-react';
import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import type { Locale } from '@/i18n/config';
import { formatScore } from '@/lib/format';
import type { Testimonial } from '@/lib/types';

interface RatingSummaryProps {
  locale: Locale;
  t: Dictionary['testimonials'];
  a11y: Dictionary['a11y'];
  testimonials: Testimonial[];
}

// Client faces and the overall ratings, shown above the reviews on the homepage and the Reviews page
export const RatingSummary = ({ locale, t, a11y, testimonials }: RatingSummaryProps) => {
  const avatars = testimonials.filter((item) => item.avatar).slice(0, 5);

  return (
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
  );
};

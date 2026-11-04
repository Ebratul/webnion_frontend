import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import { formatNumber } from '@/lib/format';

interface PaginationProps {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
  locale: Locale;
  label: string;
  previous: string;
  next: string;
}

const arrowClass = 'grid size-10 place-items-center rounded-full bg-primary text-white';

export const Pagination = ({ page, pageCount, hrefFor, locale, label, previous, next }: PaginationProps) => {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={label} className="mt-12">
      <ul className="flex items-center justify-center gap-2">
        <li>
          {page > 1 ? (
            <Link href={hrefFor(page - 1)} aria-label={previous} className={`${arrowClass} transition-colors duration-200 hover:bg-primary-hover`}>
              <ChevronLeft aria-hidden className="size-4" />
            </Link>
          ) : (
            <span aria-hidden className={`${arrowClass} opacity-40`}><ChevronLeft className="size-4" /></span>
          )}
        </li>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((number) => (
          <li key={number}>
            <Link
              href={hrefFor(number)}
              aria-label={`${label} ${formatNumber(number, locale)}`}
              aria-current={number === page ? 'page' : undefined}
              className={`grid size-10 place-items-center rounded-full text-sm font-medium transition-colors duration-200 ${number === page ? 'bg-primary text-white' : 'bg-tint text-accent hover:bg-primary hover:text-white'}`}
            >
              {formatNumber(number, locale)}
            </Link>
          </li>
        ))}
        <li>
          {page < pageCount ? (
            <Link href={hrefFor(page + 1)} aria-label={next} className={`${arrowClass} transition-colors duration-200 hover:bg-primary-hover`}>
              <ChevronRight aria-hidden className="size-4" />
            </Link>
          ) : (
            <span aria-hidden className={`${arrowClass} opacity-40`}><ChevronRight className="size-4" /></span>
          )}
        </li>
      </ul>
    </nav>
  );
};

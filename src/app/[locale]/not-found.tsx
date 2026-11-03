'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';

export default function NotFound() {
  const { locale } = useParams<{ locale: string }>();
  const safeLocale = isLocale(locale) ? locale : 'en';
  const { error } = getDictionary(safeLocale);

  return (
    <main className="container-page grid min-h-svh place-content-center text-center">
      <h1 className="text-3xl font-semibold">{error.notFoundTitle}</h1>
      <p className="mt-3 text-muted">{error.notFoundText}</p>
      <Link
        href={`/${safeLocale}`}
        className="mx-auto mt-6 inline-flex min-h-12 items-center rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
      >
        {error.backHome}
      </Link>
    </main>
  );
}

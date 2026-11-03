'use client';

import { useParams } from 'next/navigation';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';

export default function ErrorPage({ reset }: { reset: () => void }) {
  const { locale } = useParams<{ locale: string }>();
  const { error } = getDictionary(isLocale(locale) ? locale : 'en');

  return (
    <main className="container-page grid min-h-svh place-content-center text-center">
      <h1 className="text-3xl font-semibold">{error.title}</h1>
      <p className="mt-3 text-muted">{error.text}</p>
      <button
        type="button"
        onClick={reset}
        className="mx-auto mt-6 min-h-12 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
      >
        {error.retry}
      </button>
    </main>
  );
}

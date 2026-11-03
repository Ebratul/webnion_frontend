'use client';

import Link from 'next/link';
import { LOCALE_COOKIE, type Locale } from '@/i18n/config';

const ONE_YEAR = 60 * 60 * 24 * 365;

export const LanguageSwitch = ({ locale, text, label }: { locale: Locale; text: string; label: string }) => {
  const target: Locale = locale === 'en' ? 'bn' : 'en';

  return (
    <Link
      href={`/${target}`}
      hrefLang={target}
      lang={target}
      scroll={false}
      aria-label={label}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
      }}
      className="inline-flex h-9 items-center rounded-full border border-line px-3 text-sm sm:h-10 sm:px-4 font-medium text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
    >
      {text}
    </Link>
  );
};

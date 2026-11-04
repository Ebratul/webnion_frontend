'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LOCALE_COOKIE, type Locale } from '@/i18n/config';

const ONE_YEAR = 60 * 60 * 24 * 365;

export const LanguageSwitch = ({ locale, text, label }: { locale: Locale; text: string; label: string }) => {
  const target: Locale = locale === 'en' ? 'bn' : 'en';
  // Stays on the same page when switching language, not just the homepage
  const pathname = usePathname();

  return (
    <Link
      href={pathname.replace(/^\/[^/]+/, `/${target}`)}
      hrefLang={target}
      lang={target}
      scroll={false}
      aria-label={label}
      onClick={() => {
        document.cookie = `${LOCALE_COOKIE}=${target}; path=/; max-age=${ONE_YEAR}; samesite=lax`;
      }}
      className="inline-flex h-9 items-center rounded-full px-3 text-sm font-medium sm:h-10 sm:px-4 bg-primary text-white transition-colors duration-200 hover:bg-primary-hover"
    >
      {text}
    </Link>
  );
};

import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from '@/i18n/config';

const detectLocale = (request: NextRequest) => {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved)) return saved;

  const preferred = request.headers.get('accept-language')?.split(',')[0]?.trim().slice(0, 2).toLowerCase();
  return preferred && isLocale(preferred) ? preferred : DEFAULT_LOCALE;
};

export const proxy = (request: NextRequest) => {
  const url = request.nextUrl.clone();
  url.pathname = `/${detectLocale(request)}`;
  return NextResponse.redirect(url);
};

export const config = { matcher: '/' };

import { NextResponse, type NextRequest } from 'next/server';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from '@/i18n/config';
import { ADMIN_COOKIE, ADMIN_LOGIN_PATH } from '@/lib/admin/constants';

const detectLocale = (request: NextRequest) => {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved)) return saved;

  const preferred = request.headers.get('accept-language')?.split(',')[0]?.trim().slice(0, 2).toLowerCase();
  return preferred && isLocale(preferred) ? preferred : DEFAULT_LOCALE;
};

export const proxy = (request: NextRequest) => {
  const url = request.nextUrl.clone();

  // A quick gate only. The admin layout checks the token with the API on every page.
  if (url.pathname.startsWith('/admin')) {
    if (url.pathname === ADMIN_LOGIN_PATH || request.cookies.has(ADMIN_COOKIE)) return NextResponse.next();
    url.pathname = ADMIN_LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  url.pathname = `/${detectLocale(request)}`;
  return NextResponse.redirect(url);
};

export const config = { matcher: ['/', '/admin/:path*'] };

import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';

export const Logo = ({ locale, className = '' }: { locale: Locale; className?: string }) => (
  <Link href={`/${locale}`} aria-label="Webnion" className={`inline-flex shrink-0 ${className}`}>
    <Image src="/images/brand/logo-white.png" alt="" width={273} height={42} priority className="hidden h-[1.125rem] w-auto min-[380px]:h-[26px] dark:block" />
    <Image src="/images/brand/logo-dark.png" alt="" width={273} height={42} priority className="h-[1.125rem] w-auto min-[380px]:h-[26px] dark:hidden" />
  </Link>
);

import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { BrandSettings } from '@/lib/site';

// Uploaded logos can have any width, so the height is fixed and the width follows the image.
// They are not resized by the image service, which could soften a logo's thin lines.
export const Logo = ({ locale, brand, className = '' }: { locale: Locale; brand: Pick<BrandSettings, 'siteName' | 'logoOnDark' | 'logoOnLight'>; className?: string }) => (
  <Link href={`/${locale}`} aria-label={brand.siteName} className={`inline-flex min-h-6 shrink-0 items-center ${className}`}>
    <Image src={brand.logoOnDark} alt="" width={229} height={42} priority unoptimized className="hidden h-[1.125rem] w-auto max-w-[11rem] object-contain min-[380px]:h-[26px] dark:block" />
    <Image src={brand.logoOnLight} alt="" width={229} height={42} priority unoptimized className="h-[1.125rem] w-auto max-w-[11rem] object-contain min-[380px]:h-[26px] dark:hidden" />
  </Link>
);

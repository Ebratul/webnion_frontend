import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type LinkHref = ComponentProps<typeof Link>['href'];

const base =
  'inline-flex items-center justify-center gap-3 rounded-full font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98]';

// xs is the header size. lg is the hero size, measured from the live site
const PRIMARY_SIZES = {
  xs: { link: 'min-h-10 gap-2 pl-4 pr-1 text-[0.8125rem]', circle: 'size-8', icon: 'size-4' },
  sm: { link: 'min-h-12 pl-6 pr-1.5 text-sm', circle: 'size-9', icon: 'size-[18px]' },
  md: { link: 'min-h-12 pl-6 pr-[5px] text-sm', circle: 'size-[38px]', icon: 'size-[18px]' },
  lg: { link: 'min-h-14 pl-[30px] pr-[5px] text-base', circle: 'size-[46px]', icon: 'size-[18px]' },
};

const SECONDARY_SIZES = {
  sm: 'min-h-12 px-6 text-sm',
  lg: 'min-h-14 px-[30px] text-base',
};

interface PrimaryLinkProps {
  href: LinkHref;
  children: ReactNode;
  className?: string;
  size?: keyof typeof PRIMARY_SIZES;
}

export const PrimaryLink = ({ href, children, className = '', size = 'sm' }: PrimaryLinkProps) => (
  <Link
    href={href}
    className={`group ${base} ${PRIMARY_SIZES[size].link} bg-primary text-white hover:bg-primary-hover ${className}`}
  >
    {children}
    <span className={`grid shrink-0 place-items-center rounded-full bg-ink text-white ${PRIMARY_SIZES[size].circle}`}>
      <ArrowUpRight aria-hidden strokeWidth={2.5} className={`${PRIMARY_SIZES[size].icon} transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px`} />
    </span>
  </Link>
);

interface SecondaryLinkProps {
  href: LinkHref;
  children: ReactNode;
  className?: string;
  size?: keyof typeof SECONDARY_SIZES;
}

export const SecondaryLink = ({ href, children, className = '', size = 'sm' }: SecondaryLinkProps) => (
  <Link href={href} className={`${base} ${SECONDARY_SIZES[size]} bg-primary text-white hover:bg-primary-hover ${className}`}>
    {children}
  </Link>
);

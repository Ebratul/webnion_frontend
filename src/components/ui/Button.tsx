import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

type LinkHref = ComponentProps<typeof Link>['href'];

const base =
  'inline-flex min-h-12 items-center justify-center gap-3 rounded-full text-sm font-semibold transition-[background-color,border-color,color,transform] duration-200 active:scale-[0.98]';

export const PrimaryLink = ({ href, children, className = '' }: { href: LinkHref; children: ReactNode; className?: string }) => (
  <Link
    href={href}
    className={`group ${base} border border-primary bg-primary py-1.5 pl-6 pr-1.5 text-white hover:border-primary-hover hover:bg-primary-hover ${className}`}
  >
    {children}
    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white">
      <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px" />
    </span>
  </Link>
);

export const SecondaryLink = ({ href, children, className = '' }: { href: LinkHref; children: ReactNode; className?: string }) => (
  <Link href={href} className={`${base} border border-line bg-bg/40 px-6 text-fg hover:border-accent hover:text-accent ${className}`}>
    {children}
  </Link>
);

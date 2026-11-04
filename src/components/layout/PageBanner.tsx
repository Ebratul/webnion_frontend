import { ChevronRight, House } from 'lucide-react';
import Link from 'next/link';
import type { CSSProperties } from 'react';

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

interface PageBannerProps {
  titleLines: string[];
  subtitle?: string;
  homeHref: string;
  homeLabel: string;
  crumb: string;
}

export const PageBanner = ({ titleLines, subtitle, homeHref, homeLabel, crumb }: PageBannerProps) => (
  <section id="top" aria-label={crumb} className="px-3 pt-3">
    <div className="rounded-2xl bg-[#9835cb] px-5 py-16 text-center text-white sm:py-20 lg:py-24">
      <h1 className="text-3xl font-medium sm:text-4xl lg:text-5xl">
        {titleLines.map((line, index) => (
          <span key={line} className="hero-line">
            <span style={delay(150 + index * 260)}>{line} </span>
          </span>
        ))}
      </h1>
      {subtitle && <p style={delay(700)} className="hero-fade mx-auto mt-5 max-w-xl text-sm text-white">{subtitle}</p>}
      <nav style={delay(850)} aria-label={crumb} className="hero-fade mt-6">
        <ol className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs">
          <li>
            <Link href={homeHref} className="inline-flex items-center gap-1.5 text-white underline-offset-2 hover:underline">
              <House aria-hidden className="size-3.5" />
              {homeLabel}
            </Link>
          </li>
          <li aria-hidden><ChevronRight className="size-3" /></li>
          <li aria-current="page">{crumb}</li>
        </ol>
      </nav>
    </div>
  </section>
);

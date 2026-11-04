import { ChevronRight, House } from 'lucide-react';
import Link from 'next/link';

interface PageHeroProps {
  title: string;
  homeHref: string;
  homeLabel: string;
  crumb: string;
  translateTitle?: boolean;
}

export const PageHero = ({ title, homeHref, homeLabel, crumb, translateTitle = true }: PageHeroProps) => (
  <div className="band-dark relative overflow-hidden border-b border-line px-5 py-16 text-center sm:py-20 lg:py-24">
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_60%_90%_at_50%_-10%,rgb(124_58_237/0.28),transparent_70%)]" />
    <div className="relative">
      <h1 translate={translateTitle ? undefined : 'no'} className="mx-auto max-w-4xl text-3xl font-semibold sm:text-4xl lg:text-5xl">
        {title}
      </h1>
      <nav aria-label={crumb} className="mt-6">
        <ol className="inline-flex items-center gap-2 rounded-full border border-line bg-white/5 px-4 py-1.5 text-xs text-muted">
          <li>
            <Link href={homeHref} className="inline-flex items-center gap-1.5 py-1 transition-colors duration-200 hover:text-fg">
              <House aria-hidden className="size-3.5" />
              {homeLabel}
            </Link>
          </li>
          <li aria-hidden>
            <ChevronRight className="size-3" />
          </li>
          <li aria-current="page" className="text-fg">{crumb}</li>
        </ol>
      </nav>
    </div>
  </div>
);

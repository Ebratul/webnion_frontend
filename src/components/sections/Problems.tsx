import { Zap } from 'lucide-react';
import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { getSiteImages } from '@/lib/siteSettings';
import { LineReveal } from '../ui/LineReveal';
import { LineText } from '../ui/LineText';

// The picture is set under Contact & Links in the admin panel. Any shape works: it is cropped to 3:2.
export const Problems = async ({ t }: { t: Dictionary['problems'] }) => {
  const images = await getSiteImages();

  return (
    <section aria-labelledby="problems-title" className="section-b">
      <div className="container-page">
        <div className="reveal problems-sky grid items-center gap-10 overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:p-14">
          <LineReveal>
            <h2 id="problems-title" className="text-3xl font-medium sm:text-4xl lg:text-[2.75rem]">
              <span className="block">
                <LineText text={t.titleLead} />
              </span>
              <span className="problems-accent block">
                <LineText text={t.titleAccent} />
              </span>
            </h2>
            <p className="mt-5 max-w-md text-muted">
              <LineText text={t.subtitle} />
            </p>
            <div data-line-item className="mt-7">
              <a
                href={`#${SECTION_IDS.contact}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-b from-primary-hover to-primary px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_var(--primary)] transition-[filter] duration-200 hover:brightness-110"
              >
                <Zap aria-hidden className="size-4 fill-current" />
                {t.cta}
              </a>
            </div>
          </LineReveal>

          <figure className="problems-picture relative">
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-2 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.7)]">
              <Image
                src={images.problems}
                alt={t.imageAlt}
                width={1400}
                height={933}
                sizes="(min-width: 1024px) 560px, 100vw"
                className="aspect-[3/2] w-full rounded-[1.1rem] object-cover"
              />
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
};

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

const COVER_SIZES = '(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw';

// A card's picture in a fixed frame (4:3 unless `wide`). Pictures come square or wide, so the whole picture is shown and a blurred copy of it
// fills the rest of the frame: nothing is cut off at the top or sides. Both use the same size, so it downloads once.
// `wide` (3:2) suits case studies, whose pictures are mostly landscape.
export const CardCover = ({ src, href, priority = false, wide = false, children }: { src: string | null | undefined; href: string; priority?: boolean; wide?: boolean; children?: ReactNode }) => (
  <div className="relative">
    <Link href={href} tabIndex={-1} aria-hidden className={`relative block overflow-hidden ${wide ? 'aspect-[3/2]' : 'aspect-[4/3]'}`}>
      {src ? (
        <>
          <Image src={src} alt="" fill sizes={COVER_SIZES} className="scale-125 object-cover opacity-60 blur-2xl saturate-150" />
          <Image src={src} alt="" fill priority={priority} sizes={COVER_SIZES} className="object-contain transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100" />
        </>
      ) : (
        <div className="size-full bg-[radial-gradient(80%_120%_at_20%_0%,color-mix(in_srgb,var(--primary)_55%,transparent),transparent),linear-gradient(135deg,#1a1d2b,#0d0f18)]" />
      )}
    </Link>
    {children}
  </div>
);

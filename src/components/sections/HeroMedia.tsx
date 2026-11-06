'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { useOffscreen } from '@/lib/useOffscreen';

// The hero background, under a veil in the theme's colour that is clearer at the edges than behind the heading and
// fades into the page below. Its slow drift stops once the hero has scrolled away.
export const HeroMedia = ({ src }: { src: string }) => {
  const box = useRef<HTMLDivElement>(null);
  useOffscreen(box);

  return (
    <div ref={box} aria-hidden className="hero-media absolute inset-0 -z-10">
      <Image src={src} alt="" fill priority sizes="100vw" className="hero-media-image object-cover" />
    </div>
  );
};

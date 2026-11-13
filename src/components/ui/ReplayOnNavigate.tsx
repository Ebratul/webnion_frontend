'use client';

import { useEffect } from 'react';
import { watchReveal } from './LineReveal';

// The hero's entrance is plain CSS, so replaying it means rewinding its running animations.
const replayHero = (section: HTMLElement) => {
  const animations = section
    .getAnimations({ subtree: true })
    .filter((animation) => (animation as CSSAnimation).animationName?.startsWith('hero-'));
  if (animations.length === 0) return;

  animations.forEach((animation) => {
    animation.currentTime = 0;
    animation.pause();
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return;
      animations.forEach((animation) => animation.play());
      observer.disconnect();
    },
    { threshold: 0.3 },
  );
  observer.observe(section);
};

// When a link jumps to a section on this page, its text comes in line by line again on arrival.
export const ReplayOnNavigate = () => {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
      // A filter or page link (?tag=, ?page=) changes the list, not the section, so it must not jump to the top
      if (!link || link.pathname !== window.location.pathname || link.search !== window.location.search) return;

      // Home and the logo link to this page without a hash, which lands on the hero
      const section = document.getElementById(link.hash.slice(1) || 'top');
      if (section?.tagName !== 'SECTION') return;

      // Next.js does not scroll for a link to the URL already open, so a plain Home click would stay put
      if (!link.hash) window.scrollTo({ top: 0 });

      section.querySelectorAll<HTMLElement>('[data-line-reveal]').forEach(watchReveal);
      replayHero(section);
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
};

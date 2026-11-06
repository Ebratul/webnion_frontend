'use client';

import { useEffect, type RefObject } from 'react';

// Marks the element with data-offscreen while it is out of view, so CSS can pause its animations. Moving rows that
// keep running off screen still cost the phone's GPU work on every frame of a scroll.
export const useOffscreen = (ref: RefObject<HTMLElement | null>, onChange?: (offscreen: boolean) => void) => {
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const offscreen = !entry.isIntersecting;
        if (offscreen) element.dataset.offscreen = '';
        else delete element.dataset.offscreen;
        onChange?.(offscreen);
      },
      // A little early, so a row is already moving when it scrolls into view
      { rootMargin: '200px 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
    // onChange is a state setter or a stable callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
};

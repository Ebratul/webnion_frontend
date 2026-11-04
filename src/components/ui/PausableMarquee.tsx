'use client';

import { Pause, Play } from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface PausableMarqueeProps {
  pauseLabel: string;
  playLabel: string;
  className?: string;
  buttonClassName: string;
  children: ReactNode;
}

export const PausableMarquee = ({ pauseLabel, playLabel, className = '', buttonClassName, children }: PausableMarqueeProps) => {
  const [paused, setPaused] = useState(false);

  return (
    <div data-paused={paused} className={`relative ${className}`}>
      {children}
      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? playLabel : pauseLabel}
        className={`marquee-pause absolute grid size-10 place-items-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur transition-colors duration-200 hover:bg-primary ${buttonClassName}`}
      >
        {paused ? <Play aria-hidden className="size-4" /> : <Pause aria-hidden className="size-4" />}
      </button>
    </div>
  );
};

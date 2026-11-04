'use client';

import { Pause, Play } from 'lucide-react';
import { useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from 'react';

interface PausableMarqueeProps {
  pauseLabel: string;
  playLabel: string;
  className?: string;
  buttonClassName: string;
  children: ReactNode;
}

interface Drag {
  animation: Animation;
  startX: number;
  startTime: number;
  duration: number;
  msPerPixel: number;
}

const DRAG_THRESHOLD = 5;

export const PausableMarquee = ({ pauseLabel, playLabel, className = '', buttonClassName, children }: PausableMarqueeProps) => {
  const [paused, setPaused] = useState(false);
  const drag = useRef<Drag | null>(null);
  const dragged = useRef(false);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    dragged.current = false;
    if (event.button !== 0) return;

    const track = (event.target as Element).closest<HTMLElement>('.marquee-track');
    const animation = track?.getAnimations()[0];
    const duration = animation?.effect?.getTiming().duration;
    if (!track || !animation || typeof duration !== 'number') return;

    // Rows move by rewinding their CSS animation: half the track's width is one full loop.
    // A forward row moves left as time passes, so dragging right means going back in time.
    const direction = track.dataset.direction === 'reverse' ? 1 : -1;
    drag.current = {
      animation,
      duration,
      startX: event.clientX,
      startTime: Number(animation.currentTime),
      msPerPixel: (duration / (track.offsetWidth / 2)) * direction,
    };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current) return;

    const distance = event.clientX - current.startX;
    if (!dragged.current) {
      // A small movement is still a click on a card
      if (Math.abs(distance) < DRAG_THRESHOLD) return;
      dragged.current = true;
      event.currentTarget.dataset.dragging = 'true';
      event.currentTarget.setPointerCapture(event.pointerId);
    }

    const time = current.startTime + distance * current.msPerPixel;
    current.animation.currentTime = ((time % current.duration) + current.duration) % current.duration;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
  };

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragged.current) return;
    dragged.current = false;
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      data-marquee
      data-paused={paused}
      className={`relative ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
    >
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

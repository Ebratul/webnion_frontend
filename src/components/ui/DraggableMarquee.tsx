'use client';

import { useRef, type MouseEvent, type PointerEvent, type ReactNode } from 'react';

interface DraggableMarqueeProps {
  className?: string;
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

// offsetWidth ignores the page's CSS zoom, so it is converted to compare with pointer positions
const pageZoom = () => parseFloat(getComputedStyle(document.documentElement).zoom) || 1;

// Moving rows with no pause button, by the owner's choice. They stop under the mouse, can be dragged by hand,
// and stand still for anyone who asks their system for reduced motion.
export const DraggableMarquee = ({ className = '', children }: DraggableMarqueeProps) => {
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
      msPerPixel: (duration / ((track.offsetWidth * pageZoom()) / 2)) * direction,
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
      className={`relative ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
    >
      {children}
    </div>
  );
};

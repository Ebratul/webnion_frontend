'use client';

import { Check } from 'lucide-react';
import Image from 'next/image';
import { useState, type KeyboardEvent } from 'react';
import type { Dictionary } from '@/i18n';

type Outcome = Dictionary['outcomes']['items'][number];

const imageFor = (key: string) => `/images/outcomes/${key}.webp`;

export const OutcomeTabs = ({ items, children }: { items: Outcome[]; children: React.ReactNode }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex]!;

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const next = (activeIndex + step + items.length) % items.length;
    setActiveIndex(next);
    event.currentTarget.querySelectorAll('button')[next]?.focus();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
      <div className="flex flex-col justify-between gap-10">
        {children}

        <div role="tablist" aria-orientation="horizontal" onKeyDown={onKeyDown} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {items.map((item, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={item.key}
                type="button"
                role="tab"
                id={`outcome-tab-${item.key}`}
                aria-selected={selected}
                aria-controls="outcome-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveIndex(index)}
                className={`rounded-2xl border p-2 text-left transition-colors duration-200 ${selected ? 'border-primary bg-tint' : 'border-line bg-bg hover:border-accent'}`}
              >
                <Image src={imageFor(item.key)} alt="" width={240} height={180} sizes="160px" className="aspect-[4/3] w-full rounded-xl bg-white object-cover" />
                <span className="mt-2 block px-1 pb-1 text-xs font-semibold leading-snug">{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        role="tabpanel"
        id="outcome-panel"
        aria-labelledby={`outcome-tab-${active.key}`}
        className="overflow-hidden rounded-3xl border border-line bg-bg shadow-soft"
      >
        <div className="bg-white">
          <Image
            key={active.key}
            src={imageFor(active.key)}
            alt=""
            width={1400}
            height={1050}
            sizes="(min-width: 1024px) 560px, 100vw"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <div className="p-6 sm:p-8">
          <h3 className="text-xl font-semibold sm:text-2xl">{active.title}</h3>
          <p className="mt-2 text-sm text-muted">{active.description}</p>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {active.points.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm">
                <Check aria-hidden className="mt-1 size-4 shrink-0 text-accent" strokeWidth={2.5} />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import { PausableMarquee } from '../ui/PausableMarquee';
import { SectionHeading } from '../ui/SectionHeading';

type Technology = Dictionary['technologies']['items'][number];

const TechList = ({ items, hidden }: { items: Technology[]; hidden?: boolean }) => (
  // The second copy exists only to make the loop seamless, so screen readers skip it
  <ul aria-hidden={hidden || undefined} className="flex">
    {items.map((item) => (
      <li key={item.name} className="mr-5 flex w-72 shrink-0 gap-3 rounded-xl border border-primary bg-surface p-4 transition-colors duration-200 hover:border-accent">
        <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-lg bg-white">
          <Image src={`/images/tech/${item.logo}.webp`} alt="" width={44} height={44} sizes="44px" draggable={false} className="size-full object-contain p-0.5" />
        </span>
        <span className="min-w-0">
          <span translate="no" className="block text-sm font-semibold">{item.name}</span>
          <span className="mt-1 block text-xs leading-relaxed text-muted">{item.description}</span>
        </span>
      </li>
    ))}
  </ul>
);

const Row = ({ items, direction }: { items: Technology[]; direction?: 'reverse' }) => (
  <div className="marquee-track" data-direction={direction}>
    <TechList items={items} />
    <TechList items={items} hidden />
  </div>
);

export const Technologies = ({ t }: { t: Dictionary['technologies'] }) => {
  const middle = Math.ceil(t.items.length / 2);

  return (
    <section aria-labelledby="technologies-title" className="section-y flush-light">
      <div className="container-page">
        <SectionHeading id="technologies-title" title={t.title} />

        <PausableMarquee pauseLabel={t.pause} playLabel={t.play} className="mt-12 pb-16" buttonClassName="bottom-0 left-1/2 -translate-x-1/2">
          <div className="marquee-wrap fade-edges flex flex-col gap-5 overflow-hidden">
            <Row items={t.items.slice(0, middle)} />
            <Row items={t.items.slice(middle)} direction="reverse" />
          </div>
        </PausableMarquee>
      </div>
    </section>
  );
};

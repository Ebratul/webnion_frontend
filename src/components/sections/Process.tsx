import { CalendarCheck, PencilRuler, Rocket } from 'lucide-react';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { PrimaryLink } from '../ui/Button';
import { SectionHeading } from '../ui/SectionHeading';

const STEP_ICONS = [CalendarCheck, PencilRuler, Rocket];

// Node and text positions are percentages of the 1200 x 440 line artwork at desktop width.
const DESKTOP_LAYOUT = [
  { node: { left: '16.5%', top: '59.5%' }, text: { left: '4%', top: '4%' }, number: { left: '30%', top: '-3%' } },
  { node: { left: '49%', top: '9%' }, text: { left: '37%', top: '53%' }, number: { left: '65%', top: '59%' } },
  { node: { left: '87%', top: '20%' }, text: { left: '70%', top: '64%' }, number: { left: '94%', top: '55%' } },
];

export const Process = ({ t }: { t: Dictionary['process'] }) => (
  <section aria-labelledby="process-title" className="section-y dark:bg-surface">
    <div className="container-page">
      <SectionHeading id="process-title" eyebrow={t.eyebrow} title={t.title} subtitle={t.subtitle} />
      <div className="reveal mt-7 flex justify-center">
        <PrimaryLink href={`#${SECTION_IDS.contact}`}>{t.cta}</PrimaryLink>
      </div>

      {/* Desktop: the steps sit around one continuous curved line */}
      <div className="relative mt-14 hidden aspect-[1200/440] lg:block">
        <svg aria-hidden viewBox="0 0 1200 440" fill="none" className="absolute inset-0 size-full">
          <path
            pathLength={1}
            className="process-line"
            d="M0 200C70 215 120 240 198 262 C340 300 430 40 588 40 C730 40 770 270 900 250 C990 236 985 100 1044 88 C1095 78 1150 105 1200 125"
            stroke="var(--primary)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <ol>
          {t.steps.map((step, index) => {
            const Icon = STEP_ICONS[index]!;
            const layout = DESKTOP_LAYOUT[index]!;
            return (
              <li key={step.title}>
                <span aria-hidden className="absolute grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl border border-line bg-bg text-accent shadow-soft" style={layout.node}>
                  <Icon className="size-6" />
                </span>
                <span aria-hidden className="absolute select-none text-8xl font-bold text-fg/[0.07]" style={layout.number}>
                  {index + 1}
                </span>
                <div className="absolute w-[27%]" style={layout.text}>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Mobile and tablet: the same steps as a vertical timeline */}
      <ol className="mt-12 lg:hidden">
        {t.steps.map((step, index) => {
          const Icon = STEP_ICONS[index]!;
          return (
            <li key={step.title} className="relative flex gap-4 pb-10 last:pb-0">
              {index < t.steps.length - 1 && <span aria-hidden className="absolute bottom-0 left-6 top-12 w-0.5 -translate-x-1/2 bg-primary" />}
              <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-2xl border border-line bg-bg text-accent shadow-soft">
                <Icon className="size-5" />
              </span>
              <div className="pt-1">
                <h3 className="text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{step.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  </section>
);

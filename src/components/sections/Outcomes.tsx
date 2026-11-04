import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { PrimaryLink } from '../ui/Button';
import { LineReveal } from '../ui/LineReveal';
import { LineText } from '../ui/LineText';
import { Eyebrow } from '../ui/SectionHeading';
import { OutcomeTabs } from './OutcomeTabs';

export const Outcomes = ({ t }: { t: Dictionary['outcomes'] }) => (
  <section aria-labelledby="outcomes-title" className="section-y bg-[#f7eee8] dark:bg-surface">
    <div className="container-page">
      <OutcomeTabs items={t.items}>
        <LineReveal>
          <div data-line-item>
            <Eyebrow>{t.eyebrow}</Eyebrow>
          </div>
          <h2 id="outcomes-title" className="mt-5 text-4xl font-semibold lg:text-5xl">
            <LineText text={t.title} />
          </h2>
          <p className="mt-5 max-w-lg text-muted">
            <LineText text={t.subtitle} />
          </p>
          <div data-line-item className="mt-8">
            <PrimaryLink href={`#${SECTION_IDS.contact}`}>{t.cta}</PrimaryLink>
          </div>
        </LineReveal>
      </OutcomeTabs>
    </div>
  </section>
);

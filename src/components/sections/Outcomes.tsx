import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { PrimaryLink } from '../ui/Button';
import { Eyebrow } from '../ui/SectionHeading';
import { OutcomeTabs } from './OutcomeTabs';

export const Outcomes = ({ t }: { t: Dictionary['outcomes'] }) => (
  <section aria-labelledby="outcomes-title" className="section-y bg-surface">
    <div className="container-page">
      <OutcomeTabs items={t.items}>
        <div className="reveal">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <h2 id="outcomes-title" className="mt-5 text-4xl font-semibold lg:text-5xl">
            {t.title}
          </h2>
          <p className="mt-5 max-w-lg text-muted">{t.subtitle}</p>
          <PrimaryLink href={`#${SECTION_IDS.contact}`} className="mt-8">
            {t.cta}
          </PrimaryLink>
        </div>
      </OutcomeTabs>
    </div>
  </section>
);

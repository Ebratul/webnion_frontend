import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import type { Service } from '@/lib/types';
import { SectionHeading } from '../ui/SectionHeading';
import { ServiceCard } from '../ui/ServiceCard';

export const Services = ({ locale, t, services }: { locale: Locale; t: Dictionary['services']; services: Service[] }) => (
  <section id={SECTION_IDS.services} aria-labelledby="services-title" className="action-violet pb-20 lg:pb-28">
    <div className="container-page">
      <SectionHeading id="services-title" eyebrow={t.eyebrow} title={t.title} />

      <ul className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service.id} className="reveal">
            <ServiceCard locale={locale} service={service} cta={t.cta} heading="h3" />
          </li>
        ))}
      </ul>

      <div className="mt-6 text-center">
        <Link href={`/${locale}/service`} className="inline-block py-1.5 text-xs font-semibold underline underline-offset-4 transition-colors duration-200 hover:text-accent">
          {t.seeAll}
        </Link>
      </div>
    </div>
  </section>
);

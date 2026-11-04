import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import type { Service } from '@/lib/types';
import { SectionHeading } from '../ui/SectionHeading';
import { ServiceLink } from '../ui/ServiceLink';

export const Services = ({ locale, t, services }: { locale: Locale; t: Dictionary['services']; services: Service[] }) => (
  <section id={SECTION_IDS.services} aria-labelledby="services-title" className="pb-20 lg:pb-28">
    <div className="container-page">
      <SectionHeading id="services-title" eyebrow={t.eyebrow} title={t.title} />

      <ul className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <li key={service.id} className="reveal flex flex-col rounded-3xl border border-line bg-surface p-3 shadow-soft">
            <Link href={`/${locale}/services/${service.slug}`} tabIndex={-1} aria-hidden className="block overflow-hidden rounded-2xl bg-white">
              <Image
                src={service.image}
                alt=""
                width={1400}
                height={1050}
                sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
                className="aspect-[4/3] w-full object-cover"
              />
            </Link>
            <div className="flex flex-1 flex-col p-4">
              <h3 className="text-lg font-semibold">
                <Link href={`/${locale}/services/${service.slug}`} className="transition-colors duration-200 hover:text-accent">{service.title}</Link>
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted">{service.description}</p>
              <ServiceLink
                slug={service.slug}
                className="group mt-5 flex items-center justify-between gap-3 text-sm font-semibold text-accent"
              >
                {t.cta}
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-white transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                  <ArrowUpRight aria-hidden className="size-4" />
                </span>
              </ServiceLink>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 text-center">
        <Link href={`/${locale}/service`} className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
          {t.seeAll}
        </Link>
      </div>
    </div>
  </section>
);

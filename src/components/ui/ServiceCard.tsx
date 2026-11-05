import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Service } from '@/lib/types';
import { ServiceLink } from './ServiceLink';

interface ServiceCardProps {
  locale: Locale;
  service: Service;
  cta: string;
  heading: 'h2' | 'h3';
}

export const ServiceCard = ({ locale, service, cta, heading: Heading }: ServiceCardProps) => {
  const href = `/${locale}/services/${service.slug}`;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-transparent bg-surface p-2.5 shadow-soft transition-[border-color] duration-300 hover:border-primary/40">
      <Link href={href} tabIndex={-1} aria-hidden className="block overflow-hidden rounded-xl bg-tint">
        <Image
          src={service.image}
          alt=""
          width={1400}
          height={1050}
          sizes="(min-width: 1024px) 370px, (min-width: 768px) 50vw, 100vw"
          className="aspect-[8/5] w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col p-2.5 pt-4">
        <Heading className="text-lg font-medium">
          <Link href={href} className="transition-colors duration-200 hover:text-accent">{service.title}</Link>
        </Heading>
        <p className="mt-2 line-clamp-3 flex-1 text-sm text-muted">{service.description}</p>
        <ServiceLink slug={service.slug} className="group/link mt-5 flex min-h-11 w-full items-center justify-between gap-3 rounded-full bg-primary py-1 pl-5 pr-1 text-left text-sm font-medium text-white transition-colors duration-200 hover:bg-primary-hover">
          {cta}
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink text-white">
            <ArrowUpRight aria-hidden className="size-4 transition-transform duration-200 group-hover/link:translate-x-px group-hover/link:-translate-y-px" strokeWidth={2.5} />
          </span>
        </ServiceLink>
      </div>
    </article>
  );
};

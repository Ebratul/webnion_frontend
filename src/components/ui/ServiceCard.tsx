import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Locale } from '@/i18n/config';
import type { Service } from '@/lib/types';
import { imageCardBodyClass, imageCardClass } from './imageCard';
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
    <article className={imageCardClass}>
      <Link href={href} tabIndex={-1} aria-hidden className="block bg-white">
        <Image src={service.image} alt="" width={1400} height={1050} sizes="(min-width: 1024px) 420px, (min-width: 768px) 50vw, 100vw" className="aspect-[4/3] w-full object-cover" />
      </Link>
      <div className={imageCardBodyClass}>
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

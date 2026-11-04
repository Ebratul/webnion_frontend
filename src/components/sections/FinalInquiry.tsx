import { Send } from 'lucide-react';
import Image from 'next/image';
import type { CSSProperties } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { CONTACT, SECTION_IDS } from '@/lib/site';
import type { PricingPlan, Service } from '@/lib/types';
import { WhatsAppIcon } from '../ui/BrandIcons';
import { LineReveal } from '../ui/LineReveal';
import { LineText } from '../ui/LineText';
import { InquiryButton, InquiryDialog } from './InquiryDialog';

interface FinalInquiryProps {
  locale: Locale;
  t: Dictionary['inquiry'];
  closeLabel: string;
  services: Service[];
  plans: PricingPlan[];
}

// Live mobile screens of client sites. Sizes are in --u, about 1% of the screen width, so the fan scales as one piece.
const FAN = [
  { image: 'tasin', width: 14, x: -34, y: 11, rotate: -4, opacity: 0.6, z: 1 },
  { image: 'saltfoodmart', width: 18, x: -19, y: 5, rotate: -7, opacity: 0.92, z: 2 },
  { image: 'sabazarshop', width: 22, x: 0, y: 0, rotate: 0, opacity: 1, z: 3 },
  { image: 'neqvix', width: 18, x: 19, y: 5, rotate: 7, opacity: 0.92, z: 2 },
  { image: 'gigaloy', width: 14, x: 34, y: 11, rotate: 4, opacity: 0.6, z: 1 },
];

const badgeClass =
  'flex min-h-12 items-center gap-2.5 rounded-xl border border-white/15 bg-ink px-4 py-1.5 text-left text-white transition-colors duration-200 hover:border-accent';

export const inquiryOptions = (services: Service[], plans: PricingPlan[]) => [
  ...services.map((service) => ({ slug: service.slug, label: service.title })),
  ...plans.map((plan) => ({ slug: plan.slug, label: plan.name })),
];

export const FinalInquiry = ({ locale, t, closeLabel, services, plans }: FinalInquiryProps) => {
  return (
    <section id={SECTION_IDS.contact} aria-labelledby="inquiry-title" className="overflow-hidden bg-[#faf2e6] pt-20 lg:pt-24 dark:bg-surface">
      <LineReveal className="container-page text-center">
        <h2 id="inquiry-title" className="mx-auto max-w-3xl text-3xl font-semibold sm:text-4xl lg:text-5xl">
          <LineText text={t.title} />
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-sm text-fg/80 sm:text-base">
          <LineText text={t.subtitle} />
        </p>

        <div data-line-item className="mt-7 flex flex-wrap justify-center gap-3">
          <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className={badgeClass}>
            <WhatsAppIcon className="size-6 text-whatsapp" />
            <span>
              <span className="block text-[0.625rem] leading-tight text-white/75">{t.whatsappSmall}</span>
              <span className="block text-sm font-semibold leading-tight">{t.whatsappBig}</span>
            </span>
          </a>
          <InquiryButton className={badgeClass}>
            <Send aria-hidden className="size-6 text-[#fb923c]" />
            <span>
              <span className="block text-[0.625rem] leading-tight text-white/75">{t.inquirySmall}</span>
              <span className="block text-sm font-semibold leading-tight">{t.inquiryBig}</span>
            </span>
          </InquiryButton>
        </div>

        <div data-line-item aria-hidden className="fan relative left-1/2 mt-12 -translate-x-1/2 lg:mt-16">
          {FAN.map((card) => (
            <div
              key={card.image}
              className="absolute left-1/2 top-0 overflow-hidden rounded-t-[1.75rem] bg-white shadow-soft"
              style={
                {
                  width: `calc(var(--u) * ${card.width})`,
                  marginLeft: `calc(var(--u) * ${card.width / -2})`,
                  transform: `translate(calc(var(--u) * ${card.x}), calc(var(--u) * ${card.y})) rotate(${card.rotate}deg)`,
                  opacity: card.opacity,
                  zIndex: card.z,
                } as CSSProperties
              }
            >
              <Image src={`/images/fan/${card.image}.webp`} alt="" width={660} height={880} sizes="(min-width: 1024px) 320px, 30vw" className="w-full" />
            </div>
          ))}
        </div>
      </LineReveal>

      <InquiryDialog locale={locale} t={t} closeLabel={closeLabel} options={inquiryOptions(services, plans)} />
    </section>
  );
};

import { Send } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { SECTION_IDS } from '@/lib/site';
import { getContact } from '@/lib/siteSettings';
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

const badgeClass =
  'flex min-h-12 items-center gap-2.5 rounded-xl border border-white/15 bg-white/[0.06] px-4 py-1.5 text-left text-white backdrop-blur-sm transition-colors duration-200 hover:border-accent hover:bg-white/10';

export const inquiryOptions = (services: Service[], plans: PricingPlan[]) => [
  ...services.map((service) => ({ slug: service.slug, label: service.title })),
  ...plans.map((plan) => ({ slug: plan.slug, label: plan.name })),
];

export const FinalInquiry = async ({ locale, t, closeLabel, services, plans }: FinalInquiryProps) => {
  const contact = await getContact();

  return (
    <section id={SECTION_IDS.contact} aria-labelledby="inquiry-title" className="section-y flush-dark bg-[#faf2e6] dark:bg-surface">
      <div className="container-page">
        {/* A dark panel in both themes, lit by two curved purple lines rising from its lower corners and a short line at the top */}
        <div className="inquiry-panel band-dark relative isolate overflow-hidden rounded-[2rem] px-5 py-20 text-center sm:px-10 lg:py-28">
          <span aria-hidden className="inquiry-arc inquiry-arc-left" />
          <span aria-hidden className="inquiry-arc inquiry-arc-right" />
          <span aria-hidden className="absolute left-1/2 top-0 h-0.5 w-20 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_24px_4px_color-mix(in_srgb,var(--primary)_70%,transparent)]" />

          <LineReveal>
            <h2 id="inquiry-title" className="mx-auto max-w-3xl text-3xl font-medium text-white sm:text-4xl lg:text-[2.75rem]">
              <LineText text={t.title} />
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-white/75 sm:text-base">
              <LineText text={t.subtitle} />
            </p>

            <div data-line-item className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer" className={badgeClass}>
                <WhatsAppIcon className="size-6 text-whatsapp" />
                <span>
                  <span className="block text-[0.6875rem] leading-tight text-white/75">{t.whatsappSmall}</span>
                  <span className="block text-sm font-semibold leading-tight">{t.whatsappBig}</span>
                </span>
              </a>
              <InquiryButton className={badgeClass}>
                <Send aria-hidden className="size-6 text-accent" />
                <span>
                  <span className="block text-[0.6875rem] leading-tight text-white/75">{t.inquirySmall}</span>
                  <span className="block text-sm font-semibold leading-tight">{t.inquiryBig}</span>
                </span>
              </InquiryButton>
            </div>
          </LineReveal>
        </div>
      </div>

      <InquiryDialog locale={locale} t={t} closeLabel={closeLabel} options={inquiryOptions(services, plans)} />
    </section>
  );
};

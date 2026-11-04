import Image from 'next/image';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { CONTACT, SECTION_IDS } from '@/lib/site';
import type { PricingPlan, Service } from '@/lib/types';
import { LineReveal } from '../ui/LineReveal';
import { LineText } from '../ui/LineText';
import { inquiryOptions } from './FinalInquiry';
import { InquiryButton, InquiryDialog } from './InquiryDialog';

interface ClosingCardProps {
  locale: Locale;
  t: Dictionary['closing'];
  inquiry: Dictionary['inquiry'];
  closeLabel: string;
  services: Service[];
  plans: PricingPlan[];
}

const buttonClass = 'inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors duration-200';

// A light card on a dark band in both themes, as the preview image is made for a light background
export const ClosingCard = ({ locale, t, inquiry, closeLabel, services, plans }: ClosingCardProps) => (
  <section id={SECTION_IDS.contact} aria-labelledby="closing-title" className="band-dark px-4 pt-10">
    <div className="band-light mx-auto max-w-5xl overflow-hidden rounded-t-2xl">
      <div className="bg-gradient-to-b from-[#ececec] to-white px-5 pt-10 text-center sm:pt-12">
        <LineReveal>
          <p data-line-item className="inline-block rounded-full bg-black/5 px-3 py-1 text-xs font-semibold">{t.eyebrow}</p>
          <h2 id="closing-title" className="mx-auto mt-4 max-w-2xl text-3xl font-medium sm:text-4xl lg:text-[2.75rem]">
            <LineText text={t.title} />
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm text-muted sm:text-base">
            <LineText text={t.subtitle} />
          </p>
          <div data-line-item className="mt-6 flex flex-wrap justify-center gap-3">
            <InquiryButton className={`${buttonClass} bg-primary text-white shadow-[0_10px_24px_-10px_var(--primary)] hover:bg-primary-hover`}>{t.book}</InquiryButton>
            <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" className={`${buttonClass} border border-line bg-white text-accent hover:border-accent`}>
              {t.whatsapp}
            </a>
          </div>
        </LineReveal>
        <Image src="/images/fan/preview.webp" alt="" width={1600} height={400} sizes="(min-width: 1024px) 1024px, 100vw" className="reveal mx-auto mt-8 w-full max-w-4xl" />
      </div>
    </div>
    <InquiryDialog locale={locale} t={inquiry} closeLabel={closeLabel} options={inquiryOptions(services, plans)} />
  </section>
);

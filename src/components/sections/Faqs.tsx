import { Plus } from 'lucide-react';
import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import { CONTACT } from '@/lib/site';
import type { Faq, TeamMember } from '@/lib/types';
import { WhatsAppIcon } from '../ui/BrandIcons';
import { Eyebrow } from '../ui/SectionHeading';

interface FaqsProps {
  t: Dictionary['faq'];
  faqs: Faq[];
  founder?: TeamMember;
}

export const Faqs = ({ t, faqs, founder }: FaqsProps) => (
  <section aria-labelledby="faq-title" className="section-y">
    <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
      <div className="reveal">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h2 id="faq-title" className="mt-5 text-3xl font-semibold sm:text-4xl lg:text-[2.75rem]">
          {t.title}
        </h2>

        <div className="mt-8 rounded-3xl border border-line bg-gradient-to-br from-surface to-tint p-6 shadow-soft sm:p-7">
          {founder && <Image src={founder.photo} alt="" width={64} height={64} sizes="64px" className="size-16 rounded-full object-cover object-top" />}
          <h3 className="mt-4 text-xl font-semibold">{t.cardTitle}</h3>
          <p className="mt-2 text-sm text-muted">{t.cardText}</p>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover"
          >
            <WhatsAppIcon className="size-4" />
            {t.cardCta}
          </a>
        </div>
      </div>

      <div className="reveal space-y-3">
        {faqs.map((faq, index) => (
          <details key={faq.id} name="faq" open={index === 0} className="group rounded-2xl border border-line bg-surface transition-colors duration-200 open:border-primary/40">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-5 font-medium">
              {faq.question}
              <Plus aria-hidden className="size-5 shrink-0 text-accent transition-transform duration-200 group-open:rotate-45" />
            </summary>
            <p className="px-5 pb-5 text-sm text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

import { Plus } from 'lucide-react';
import Image from 'next/image';
import type { Dictionary } from '@/i18n';
import { CONTACT } from '@/lib/site';
import type { Faq, TeamMember } from '@/lib/types';
import { LineReveal } from '../ui/LineReveal';
import { LineText } from '../ui/LineText';

interface FaqsProps {
  t: Dictionary['faq'];
  faqs: Faq[];
  founder?: TeamMember;
}

export const Faqs = ({ t, faqs, founder }: FaqsProps) => (
  <section aria-labelledby="faq-title" className="section-y relative isolate overflow-hidden bg-surface">
    <div aria-hidden className="absolute -right-24 top-10 -z-10 size-96 rounded-full bg-primary/10 blur-3xl" />
    <div aria-hidden className="absolute -left-24 top-1/4 -z-10 size-80 rounded-full bg-primary/10 blur-3xl" />

    <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
      <LineReveal>
        <p data-line-item className="flex items-center gap-2 text-sm font-medium">
          <span aria-hidden className="size-1.5 rounded-full bg-primary" />
          {t.eyebrow}
        </p>
        <h2 id="faq-title" className="mt-4 text-3xl font-medium sm:text-4xl">
          <LineText text={t.title} />
        </h2>

        <div data-line-item className="mt-8 rounded-3xl bg-gradient-to-br from-bg via-bg to-surface-2 p-6 shadow-soft sm:p-7">
          {founder && <Image src={founder.photo} alt="" width={64} height={64} sizes="64px" className="size-16 rounded-full object-cover object-top" />}
          <h3 className="mt-4 text-2xl font-medium">{t.cardTitle}</h3>
          <p className="mt-2 text-sm text-muted">{t.cardText}</p>
          <a
            href={CONTACT.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex min-h-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-[0_12px_28px_-10px_var(--primary)] transition-colors duration-200 hover:bg-primary-hover"
          >
            {t.cardCta}
          </a>
        </div>
      </LineReveal>

      <div className="reveal space-y-3">
        {faqs.map((faq, index) => (
          <details key={faq.id} name="faq" open={index === 0} className="group rounded-2xl bg-gradient-to-r from-bg via-bg to-surface-2 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl p-5 font-medium">
              {faq.question}
              <Plus aria-hidden className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-45" />
            </summary>
            <p className="px-5 pb-5 text-sm text-muted">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  </section>
);

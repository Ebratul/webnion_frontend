import { ArrowRight, ChevronDown, Clock, Mail, MapPin, MessageCircle, Phone, type LucideIcon } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { CSSProperties, ReactNode } from 'react';
import { PageShell } from '@/components/layout/PageShell';
import { ContactForm } from '@/components/sections/ContactForm';
import { LineReveal } from '@/components/ui/LineReveal';
import { LineText } from '@/components/ui/LineText';
import { isLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n';
import { CONTACT } from '@/lib/site';

const FORM_ID = 'project-form';

type PageProps = { params: Promise<{ locale: string }> };

const delay = (ms: number) => ({ '--delay': `${ms}ms` }) as CSSProperties;

// Same width as the live page: 1320px, with a small margin on narrower screens
const wrap = 'mx-auto w-[min(82.5rem,calc(100%-2.5rem))]';
const violetCard = 'bg-[radial-gradient(circle_at_85%_15%,rgb(255_255_255/0.14),transparent_30%),linear-gradient(145deg,#7c3aed,#5b21b6)] text-white';
const lightCard = 'border border-line bg-white dark:bg-surface';
const softShadow = 'shadow-[0_28px_85px_rgb(20_13_38/0.12)]';

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = getDictionary(locale).contactPage;

  return {
    title: t.metaTitle,
    description: t.subtitle,
    alternates: { canonical: `/${locale}/contact`, languages: { en: '/en/contact', bn: '/bn/contact', 'x-default': '/en/contact' } },
    openGraph: { title: t.metaTitle, description: t.subtitle, url: `/${locale}/contact`, siteName: 'Webnion', type: 'website' },
  };
};

const QuickFact = ({ Icon, label, children }: { Icon: LucideIcon; label: string; children: ReactNode }) => (
  <li className="flex items-center gap-4 p-5 lg:px-[30px] lg:py-[25px]">
    <span className="grid h-[60px] w-[46px] shrink-0 place-items-center rounded-[14px] bg-primary text-white">
      <Icon aria-hidden className="size-5" />
    </span>
    <div className="min-w-0">
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-0.5 text-[17px] text-muted [overflow-wrap:anywhere]">{children}</div>
    </div>
  </li>
);

const InfoRow = ({ Icon, label, children }: { Icon: LucideIcon; label: string; children: ReactNode }) => (
  <li className="flex gap-3 border-t border-white/20 py-4">
    <Icon aria-hidden className="mt-1 size-4 shrink-0" />
    <div className="min-w-0">
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-0.5 text-[13px] text-white/80 [overflow-wrap:anywhere]">{children}</div>
    </div>
  </li>
);

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = getDictionary(locale);
  const t = dictionary.contactPage;
  const whatsappHref = `${CONTACT.whatsapp}?text=${encodeURIComponent(t.chat.message)}`;

  return (
    <PageShell locale={locale}>
      <div className="bg-[#f8f7fa] dark:bg-bg">
        <section
          id="top"
          aria-label={t.crumb}
          className="band-dark bg-[#0c0915]! bg-[radial-gradient(circle_at_15%_20%,rgb(124_58_237/0.24),transparent_32%),radial-gradient(circle_at_86%_80%,rgb(124_58_237/0.14),transparent_30%)]! px-5 pb-[185px] pt-16 text-center xl:pt-[79px]"
        >
          <p style={delay(100)} className="hero-fade inline-block rounded-full bg-white/[0.08] px-3.5 py-2 text-xs font-medium leading-[22px] text-[#ddd6fe]">{t.badge}</p>
          <h1 className="mt-[27px] text-[clamp(2rem,7.5vw,4.25rem)] font-medium leading-[1.02] text-white [&:lang(bn)]:leading-[1.3] [&:lang(en)]:tracking-[-0.04em]">
            {t.titleLines.map((line, index) => (
              <span key={line} className="hero-line">
                <span style={delay(250 + index * 280)}>{line} </span>
              </span>
            ))}
          </h1>
          <p style={delay(800)} className="hero-fade mx-auto mt-[31px] max-w-[45rem] leading-[1.75] text-white/70 sm:text-lg">{t.subtitle}</p>
          <nav style={delay(950)} aria-label={t.crumb} className="hero-fade mt-[26px]">
            <ol className="flex flex-wrap items-center justify-center gap-2 text-[13px] text-white/70">
              <li><Link href={`/${locale}`} className="underline-offset-2 hover:text-white hover:underline">{dictionary.nav.home}</Link></li>
              <li aria-hidden>/</li>
              <li aria-current="page" className="text-white">{t.crumb}</li>
            </ol>
          </nav>
        </section>

        <div className={`${wrap} relative -mt-[6.625rem] grid gap-[22px] md:grid-cols-2`}>
          <article className={`reveal flex flex-col rounded-[28px] p-6 sm:p-[42px] lg:min-h-[401px] ${violetCard} ${softShadow}`}>
            <p className="self-start rounded-full bg-white/[0.13] px-3.5 py-2 text-xs font-medium">{t.meeting.badge}</p>
            <h2 className="mt-5 text-3xl font-medium leading-[1.08] xl:text-[2.5rem] [&:lang(en)]:tracking-[-0.04em]">{t.meeting.title}</h2>
            <p className="mt-4 flex-1 text-[15px] leading-[1.7] text-white/85">{t.meeting.text}</p>
            <a href={`#${FORM_ID}`} className="group mt-8 flex items-center justify-between gap-4 border-t border-white/20 pt-[22px] font-medium">
              {t.meeting.action}
              <ArrowRight aria-hidden className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
            <p className="mt-3.5 text-xs text-white/75">{t.meeting.note}</p>
          </article>

          <article className={`reveal flex flex-col rounded-[28px] p-6 sm:p-[42px] lg:min-h-[401px] ${lightCard} ${softShadow}`}>
            <p className="self-start rounded-full bg-tint px-3.5 py-2 text-xs font-medium text-accent">{t.chat.badge}</p>
            <h2 className="mt-5 text-3xl font-medium leading-[1.08] xl:text-[2.5rem] [&:lang(en)]:tracking-[-0.04em]">{t.chat.title}</h2>
            <p className="mt-4 flex-1 text-[15px] leading-[1.7] text-muted">{t.chat.text}</p>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="group mt-8 flex items-center justify-between gap-4 border-t border-line pt-[22px] font-medium">
              {t.chat.action}
              <ArrowRight aria-hidden className="size-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            </a>
          </article>
        </div>

        <ul className={`${wrap} reveal mt-[51px] grid divide-y divide-line rounded-[22px] md:grid-cols-3 md:divide-x md:divide-y-0 ${lightCard} shadow-[0_18px_50px_rgb(20_13_38/0.05)]`}>
          <QuickFact Icon={Clock} label={t.responseLabel}>{t.responseValue}</QuickFact>
          <QuickFact Icon={Mail} label={t.emailLabel}>
            <a href={`mailto:${CONTACT.email}`} className="transition-colors duration-200 hover:text-accent">{CONTACT.email}</a>
          </QuickFact>
          <QuickFact Icon={Phone} label={t.callLabel}>
            <a href={`tel:${CONTACT.phoneLocal}`} dir="ltr" className="transition-colors duration-200 hover:text-accent">{CONTACT.phoneLocal}</a>
          </QuickFact>
        </ul>

        <section id={FORM_ID} aria-labelledby="contact-form-title" className={`${wrap} grid scroll-mt-24 items-start gap-[30px] pb-20 pt-20 lg:grid-cols-[503fr_787fr] lg:pb-[120px] lg:pt-[115px]`}>
          <div className={`reveal rounded-[26px] p-6 sm:p-[45px] ${violetCard}`}>
            <p className="inline-block rounded-full bg-white/[0.13] px-3.5 py-2 text-xs font-medium">{t.formBadge}</p>
            <h2 id="contact-form-title" className="mt-5 text-3xl font-medium leading-[1.08] xl:text-[2.875rem] [&:lang(en)]:tracking-[-0.04em]">{t.formTitle}</h2>
            <p className="mt-4 leading-[1.7] text-white/85">{t.formText}</p>
            <ul className="mt-6 [&>li:last-child]:pb-0">
              <InfoRow Icon={MapPin} label={t.locationLabel}>{t.locationValue}</InfoRow>
              <InfoRow Icon={Mail} label={t.emailRowLabel}>
                <a href={`mailto:${CONTACT.email}`} className="underline-offset-2 hover:underline">{CONTACT.email}</a>
              </InfoRow>
              <InfoRow Icon={Phone} label={t.callRowLabel}>
                <a href={`tel:${CONTACT.phoneLocal}`} dir="ltr" className="underline-offset-2 hover:underline">{CONTACT.phoneLocal}</a>
              </InfoRow>
              <InfoRow Icon={MessageCircle} label={t.whatsappRowLabel}>
                <a href={whatsappHref} target="_blank" rel="noopener noreferrer" dir="ltr" className="underline-offset-2 hover:underline">{CONTACT.phoneBdLabel}</a>
              </InfoRow>
            </ul>
          </div>

          <div className={`reveal rounded-[26px] p-6 sm:p-[42px] ${lightCard} shadow-[0_28px_85px_rgb(20_13_38/0.07)]`}>
            <ContactForm locale={locale} t={t.form} inquiry={dictionary.inquiry} />
          </div>
        </section>

        <section aria-labelledby="contact-faq-title" className="px-5 pb-20 lg:pb-[120px] lg:pt-[120px]">
          <LineReveal className="text-center">
            <p data-line-item className="text-[15px] font-medium uppercase text-accent [&:lang(en)]:tracking-[0.15em]">{t.faqEyebrow}</p>
            <h2 id="contact-faq-title" className="mt-2 text-3xl font-medium sm:text-[2.75rem] [&:lang(en)]:tracking-[-0.03em]">
              <LineText text={t.faqTitle} />
            </h2>
          </LineReveal>

          <div className="reveal mx-auto mt-10 max-w-[61.5rem] lg:mt-[52px] overflow-hidden rounded-md border border-line bg-white dark:bg-surface">
            {t.faqs.map((faq, index) => (
              <details key={faq.question} name="contact-faq" open={index === 0} className="group border-line [&:not(:first-child)]:border-t">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 transition-colors duration-200 group-open:bg-[#cfe2ff] group-open:text-[#052c65] dark:group-open:bg-tint dark:group-open:text-fg">
                  {faq.question}
                  <ChevronDown aria-hidden className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <p className="px-5 py-4">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

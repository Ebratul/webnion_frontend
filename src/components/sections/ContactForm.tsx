'use client';

import { ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { InquiryHoneypot, useInquirySubmit, type InquiryField } from './useInquirySubmit';

interface ContactFormProps {
  locale: Locale;
  t: Dictionary['contactPage']['form'];
  inquiry: Dictionary['inquiry'];
}

const labelClass = 'mb-1 block text-[13px] font-semibold';
const fieldClass =
  'w-full border border-line bg-bg text-fg outline-none transition-colors duration-200 placeholder:text-muted hover:border-accent/60 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 aria-invalid:border-red-500';
const inputClass = `${fieldClass} h-12 rounded-lg px-5 text-sm`;
const selectClass = `${fieldClass} h-[54px] rounded-xl px-4 text-sm`;

export const ContactForm = ({ locale, t, inquiry }: ContactFormProps) => {
  const { form, errors, formError, status, onSubmit, reset } = useInquirySubmit(locale, inquiry.errors, ['email']);

  if (status === 'success') {
    return (
      <div role="status" className="py-16 text-center">
        <CheckCircle2 aria-hidden className="mx-auto size-12 text-accent" />
        <h3 className="mt-4 text-2xl font-semibold">{inquiry.successTitle}</h3>
        <p className="mt-2 text-muted">{inquiry.successText}</p>
        <button type="button" onClick={reset} className="mt-6 min-h-12 rounded-xl border border-line px-6 text-sm font-semibold transition-colors duration-200 hover:border-accent hover:text-accent">
          {inquiry.sendAnother}
        </button>
      </div>
    );
  }

  const errorFor = (field: InquiryField) => errors[field] && <p id={`${field}-error`} className="mt-1.5 text-xs text-red-500">{errors[field]}</p>;
  const errorProps = (field: InquiryField) => ({ 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? `${field}-error` : undefined });

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="grid gap-x-[18px] gap-y-5 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className={labelClass}>{t.name}</label>
        <input id="name" name="name" type="text" autoComplete="name" placeholder={t.namePlaceholder} {...errorProps('name')} className={inputClass} />
        {errorFor('name')}
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>{t.email} <span aria-hidden>*</span></label>
        <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" spellCheck={false} placeholder={t.emailPlaceholder} {...errorProps('email')} className={inputClass} />
        {errorFor('email')}
      </div>
      <div>
        <label htmlFor="phone" className={labelClass}>{t.phone}</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder={t.phonePlaceholder} {...errorProps('phone')} className={inputClass} />
        {errorFor('phone')}
      </div>
      <div>
        <label htmlFor="company" className={labelClass}>{t.company}</label>
        <input id="company" name="company" type="text" autoComplete="organization" placeholder={t.companyPlaceholder} className={inputClass} />
      </div>
      <div>
        <label htmlFor="service" className={labelClass}>{t.service}</label>
        <select id="service" name="service" defaultValue="" className={selectClass}>
          <option value="">{t.servicePlaceholder}</option>
          {t.services.map((service) => <option key={service} value={service}>{service}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="budget" className={labelClass}>{t.budget}</label>
        <select id="budget" name="budget" defaultValue="" className={selectClass}>
          <option value="">{t.budgetPlaceholder}</option>
          {t.budgets.map((budget) => <option key={budget} value={budget}>{budget}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="country" className={labelClass}>{t.country}</label>
        <input id="country" name="country" type="text" autoComplete="country-name" placeholder={t.countryPlaceholder} className={inputClass} />
      </div>
      <div>
        <label htmlFor="existingWebsite" className={labelClass}>{t.website}</label>
        <input id="existingWebsite" name="existingWebsite" type="text" inputMode="url" autoComplete="url" spellCheck={false} placeholder={t.websitePlaceholder} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className={labelClass}>{t.message}</label>
        <textarea id="message" name="message" placeholder={t.messagePlaceholder} {...errorProps('message')} className={`${fieldClass} h-[145px] resize-y rounded-xl px-5 py-3 text-sm`} />
        {errorFor('message')}
      </div>

      <InquiryHoneypot label={inquiry.fields.honeypot} />

      <div className="mt-1 sm:col-span-2">
        <div aria-live="polite">{formError && <p className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">{formError}</p>}</div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors duration-200 hover:bg-primary-hover disabled:opacity-70"
        >
          {status === 'submitting' ? inquiry.submitting : t.submit}
          {status === 'submitting' ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <ArrowRight aria-hidden className="size-4" />}
        </button>
        <p className="mt-3 text-xs text-muted">{t.privacy}</p>
      </div>
    </form>
  );
};

'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { InquiryHoneypot, useInquirySubmit, type InquiryField } from './useInquirySubmit';

type FieldName = InquiryField;

interface ServiceOption {
  slug: string;
  label: string;
}

interface InquiryFormProps {
  locale: Locale;
  t: Dictionary['inquiry'];
  options: ServiceOption[];
}

const inputClass =
  'w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-fg outline-none transition-colors duration-200 placeholder:text-muted hover:border-accent/60 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 aria-invalid:border-red-500';

export const InquiryForm = ({ locale, t, options }: InquiryFormProps) => {
  const preselected = useSearchParams().get('service');
  const { form, errors, formError, status, onSubmit, reset } = useInquirySubmit(locale, t.errors, ['name', 'email', 'phone', 'message']);

  if (status === 'success') {
    return (
      <div role="status" className="py-12 text-center">
        <CheckCircle2 aria-hidden className="mx-auto size-12 text-accent" />
        <h3 className="mt-4 text-2xl font-semibold">{t.successTitle}</h3>
        <p className="mt-2 text-muted">{t.successText}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 min-h-12 rounded-full px-6 text-sm font-semibold bg-primary text-white transition-colors duration-200 hover:bg-primary-hover"
        >
          {t.sendAnother}
        </button>
      </div>
    );
  }

  const fieldError = (field: FieldName) =>
    errors[field] && (
      <p id={`${field}-error`} className="mt-1.5 text-xs text-red-500">
        {errors[field]}
      </p>
    );

  const describedBy = (field: FieldName) => (errors[field] ? `${field}-error` : undefined);

  return (
    <form ref={form} onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">{t.fields.name}</label>
        <input id="name" name="name" type="text" autoComplete="name" placeholder={t.fields.namePlaceholder} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy('name')} className={inputClass} />
        {fieldError('name')}
      </div>
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">{t.fields.email}</label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" spellCheck={false} placeholder={t.fields.emailPlaceholder} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy('email')} className={inputClass} />
        {fieldError('email')}
      </div>
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">{t.fields.phone}</label>
        <input id="phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder={t.fields.phonePlaceholder} aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy('phone')} className={inputClass} />
        {fieldError('phone')}
      </div>
      <div>
        <label htmlFor="company" className="mb-1.5 block text-sm font-medium">
          {t.fields.company} <span className="font-normal text-muted">({t.fields.optional})</span>
        </label>
        <input id="company" name="company" type="text" autoComplete="organization" placeholder={t.fields.companyPlaceholder} className={inputClass} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="service" className="mb-1.5 block text-sm font-medium">
          {t.fields.service} <span className="font-normal text-muted">({t.fields.optional})</span>
        </label>
        {/* Keyed so a CTA that preselects a service updates this uncontrolled field */}
        <select key={preselected} id="service" name="service" defaultValue={options.find((option) => option.slug === preselected)?.label ?? ''} className={inputClass}>
          <option value="">{t.fields.servicePlaceholder}</option>
          {options.map((option) => (
            <option key={option.slug} value={option.label}>{option.label}</option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium">{t.fields.message}</label>
        <textarea id="message" name="message" rows={4} placeholder={t.fields.messagePlaceholder} aria-invalid={Boolean(errors.message)} aria-describedby={describedBy('message')} className={`${inputClass} resize-y`} />
        {fieldError('message')}
      </div>

      <InquiryHoneypot label={t.fields.honeypot} />

      <div className="sm:col-span-2">
        <div aria-live="polite">{formError && <p className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">{formError}</p>}</div>
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover disabled:opacity-70 sm:w-auto"
        >
          {status === 'submitting' && <Loader2 aria-hidden className="size-4 animate-spin" />}
          {status === 'submitting' ? t.submitting : t.submit}
        </button>
      </div>
    </form>
  );
};

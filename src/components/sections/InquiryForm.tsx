'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRef, useState, type FormEvent } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { toAsciiDigits } from '@/lib/format';

type FieldName = 'name' | 'email' | 'phone' | 'message';
type FieldErrors = Partial<Record<FieldName, string>>;

interface ServiceOption {
  slug: string;
  label: string;
}

interface InquiryFormProps {
  locale: Locale;
  t: Dictionary['inquiry'];
  options: ServiceOption[];
}

const FIELD_ORDER: FieldName[] = ['name', 'email', 'phone', 'message'];
const PHONE_PATTERN = /^\+?[0-9][0-9\s()-]{6,18}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass =
  'w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-fg outline-none transition-colors duration-200 placeholder:text-muted hover:border-accent/60 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30 aria-invalid:border-red-500';

export const InquiryForm = ({ locale, t, options }: InquiryFormProps) => {
  const preselected = useSearchParams().get('service');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const form = useRef<HTMLFormElement>(null);

  const validate = (values: Record<string, string>) => {
    const found: FieldErrors = {};
    if ((values.name ?? '').length < 2) found.name = t.errors.name;
    if (!EMAIL_PATTERN.test(values.email ?? '')) found.email = t.errors.email;
    if (!PHONE_PATTERN.test(values.phone ?? '')) found.phone = t.errors.phone;
    if ((values.message ?? '').length < 10) found.message = t.errors.message;
    return found;
  };

  const showErrors = (found: FieldErrors) => {
    setErrors(found);
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');

    const entries = [...new FormData(event.currentTarget).entries()].map(([key, value]) => [key, String(value).trim()]);
    const values: Record<string, string> = Object.fromEntries(entries);
    // Bangla keyboards produce Bengali digits, which the API's phone format does not accept
    values.phone = toAsciiDigits(values.phone ?? '');

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      showErrors(found);
      return;
    }

    setErrors({});
    setStatus('submitting');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, locale }),
      });

      if (response.ok) {
        setStatus('success');
        return;
      }

      setStatus('idle');
      if (response.status === 429) {
        setFormError(t.errors.rateLimited);
        return;
      }

      const body: { errors?: { path: string }[] } = await response.json().catch(() => ({}));
      const fromServer: FieldErrors = {};
      for (const { path } of body.errors ?? []) {
        if ((FIELD_ORDER as string[]).includes(path)) fromServer[path as FieldName] = t.errors[path as FieldName];
      }
      if (Object.keys(fromServer).length > 0) showErrors(fromServer);
      else setFormError(t.errors.generic);
    } catch {
      setStatus('idle');
      setFormError(t.errors.generic);
    }
  };

  if (status === 'success') {
    return (
      <div role="status" className="py-12 text-center">
        <CheckCircle2 aria-hidden className="mx-auto size-12 text-accent" />
        <h3 className="mt-4 text-2xl font-semibold">{t.successTitle}</h3>
        <p className="mt-2 text-muted">{t.successText}</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 min-h-12 rounded-full border border-line px-6 text-sm font-semibold transition-colors duration-200 hover:border-accent hover:text-accent"
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

      {/* Honeypot: off-screen for people and screen readers, tempting for bots */}
      <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
        <label htmlFor="website">{t.fields.honeypot}</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

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

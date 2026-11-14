'use client';

import { useRef, useState, type FormEvent } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { toAsciiDigits } from '@/lib/format';
import { inquiryRuleMessage, type InquiryErrorBody } from '@/lib/inquiryErrors';

export type InquiryField = 'name' | 'email' | 'phone' | 'message';
type FieldErrors = Partial<Record<InquiryField, string>>;

const FIELD_ORDER: InquiryField[] = ['name', 'email', 'phone', 'message'];

const IS_VALID: Record<InquiryField, (value: string) => boolean> = {
  name: (value) => value.length >= 2,
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  phone: (value) => /^\+?[0-9][0-9\s()-]{6,18}$/.test(value),
  message: (value) => value.length >= 10,
};

// Validates and sends an inquiry. Fields left out of `required` may be blank, but are checked when filled in.
export const useInquirySubmit = (locale: Locale, messages: Dictionary['inquiry']['errors'], required: InquiryField[]) => {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const form = useRef<HTMLFormElement>(null);

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

    const found: FieldErrors = {};
    for (const field of FIELD_ORDER) {
      const value = values[field] ?? '';
      if ((value || required.includes(field)) && !IS_VALID[field](value)) found[field] = messages[field];
    }
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
      const body: InquiryErrorBody & { errors?: { path: string }[] } = await response.json().catch(() => ({}));
      // A spam rule a real person can fix, such as sending twice within five minutes
      const rule = inquiryRuleMessage(body, messages, locale);
      if (rule) {
        setFormError(rule);
        return;
      }
      if (response.status === 429) {
        setFormError(messages.rateLimited);
        return;
      }

      const fromServer: FieldErrors = {};
      for (const { path } of body.errors ?? []) {
        if ((FIELD_ORDER as string[]).includes(path)) fromServer[path as InquiryField] = messages[path as InquiryField];
      }
      if (Object.keys(fromServer).length > 0) showErrors(fromServer);
      else setFormError(messages.generic);
    } catch {
      setStatus('idle');
      setFormError(messages.generic);
    }
  };

  return { form, errors, formError, status, onSubmit, reset: () => setStatus('idle') };
};

// Off-screen for people and screen readers, tempting for bots
export const InquiryHoneypot = ({ label }: { label: string }) => (
  <div aria-hidden className="absolute -left-[9999px] size-px overflow-hidden">
    <label htmlFor="website">{label}</label>
    <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
  </div>
);

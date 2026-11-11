'use client';

import { Check } from 'lucide-react';
import { useId, useState, type FormEvent } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n';
import { toAsciiDigits } from '@/lib/format';
import type { InquiryProposal } from './useChat';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9][0-9\s()-]{6,18}$/;

const inputClass =
  'mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors duration-200 placeholder:text-muted focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30';

// What the assistant gathered, shown back to the visitor. It is sent only when they press Send, through the same endpoint
// as the inquiry form, so it is checked, rate limited and logged like any other inquiry.
export const InquiryCard = ({ proposal, locale, t, onDone }: { proposal: InquiryProposal; locale: Locale; t: Dictionary['chat']; onDone: (state: 'sent' | 'dismissed') => void }) => {
  const id = useId();
  const [values, setValues] = useState({ name: proposal.name, email: proposal.email, phone: proposal.phone, message: [proposal.service, proposal.message].filter(Boolean).join(' - ') });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState('');

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const phone = toAsciiDigits(values.phone.trim());
    const message = values.message.trim().slice(0, 2000);
    const name = values.name.trim();
    if (!EMAIL.test(values.email.trim()) || message.length < 10 || (phone && !PHONE.test(phone)) || (name && name.length < 2)) {
      setError(t.inquiryInvalid);
      return;
    }
    setError('');
    setStatus('sending');
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: values.email.trim(), phone, message, locale, source: 'chat' }),
      });
      if (!response.ok) {
        const body: { message?: string } = await response.json().catch(() => ({}));
        setStatus('idle');
        setError(response.status === 400 ? t.inquiryInvalid : body.message || t.error);
        return;
      }
      setStatus('sent');
      onDone('sent');
    } catch {
      setStatus('idle');
      setError(t.error);
    }
  };

  if (status === 'sent') {
    return (
      <p role="status" className="mt-2 flex items-start gap-2 rounded-2xl border border-line bg-tint p-3 text-sm">
        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" />
        {t.inquirySent}
      </p>
    );
  }

  const field = (key: keyof typeof values, label: string, type = 'text') => (
    <label className="block text-xs font-medium text-muted" htmlFor={`${id}-${key}`}>
      {label}
      {key === 'message' ? (
        <textarea id={`${id}-${key}`} rows={3} maxLength={2000} value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} className={inputClass} />
      ) : (
        <input id={`${id}-${key}`} type={type} maxLength={200} value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} className={inputClass} />
      )}
    </label>
  );

  return (
    <form onSubmit={submit} className="mt-2 space-y-2.5 rounded-2xl border border-primary/30 bg-surface p-3.5" aria-labelledby={`${id}-title`}>
      <p id={`${id}-title`} className="text-sm font-semibold">{t.inquiryTitle}</p>
      <p className="text-xs text-muted">{t.inquiryHint}</p>
      {field('name', t.inquiryName)}
      {field('email', t.inquiryEmail, 'email')}
      {field('phone', t.inquiryPhone, 'tel')}
      {field('message', t.inquiryMessage)}
      {error && <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex flex-wrap gap-2 pt-1">
        <button type="submit" disabled={status === 'sending'} className="inline-flex min-h-10 items-center rounded-full bg-primary px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover disabled:opacity-60">
          {status === 'sending' ? t.inquirySending : t.inquirySend}
        </button>
        <button type="button" onClick={() => onDone('dismissed')} className="inline-flex min-h-10 items-center rounded-full border border-line px-4 text-sm transition-colors duration-200 hover:border-primary">
          {t.inquiryCancel}
        </button>
      </div>
    </form>
  );
};

import { formatNumber } from '@/lib/format';
import type { Locale } from '@/i18n/config';

export interface InquiryErrorBody {
  code?: string;
  details?: { minutes?: number; maxLinks?: number };
}

interface Messages {
  cooldown: string;
  disposableEmail: string;
  tooManyLinks: string;
}

// The API names the spam rules a real person can run into, so the site words them in the visitor's language.
// Returns undefined for anything else, which the form handles as before.
export const inquiryRuleMessage = (body: InquiryErrorBody, messages: Messages, locale: Locale) => {
  const number = (value: number | undefined, fallback: number) => formatNumber(value ?? fallback, locale);
  if (body.code === 'INQUIRY_COOLDOWN') return messages.cooldown.replace('{minutes}', number(body.details?.minutes, 5));
  if (body.code === 'DISPOSABLE_EMAIL') return messages.disposableEmail;
  if (body.code === 'TOO_MANY_LINKS') return messages.tooManyLinks.replace('{max}', number(body.details?.maxLinks, 3));
  return undefined;
};

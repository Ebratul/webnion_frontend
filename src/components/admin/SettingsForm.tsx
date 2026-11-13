'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import type { LocalizedValue } from '@/lib/admin/resources';
import { DEFAULT_IMAGES, type ContactSettings, type ImageSettings } from '@/lib/site';
import { DEFAULT_TAKA_PRICES } from '@/lib/format';
import type { SiteOptions } from '@/lib/siteSettings';
import { FeaturesField, ImageField, inputClass, labelClass } from './fields';
import { cardClass, cardPadding, SaveBar } from './ui';

const CONTACT_SECTIONS: { title: string; description: string; fields: { name: keyof ContactSettings; label: string; hint?: string; type?: string }[] }[] = [
  {
    title: 'Phone And Email',
    description: 'Shown in the footer, on the contact page and on every service page.',
    fields: [
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phoneBdLabel', label: 'Main phone', hint: 'Written as it should appear, for example +880 1774-029768. Also on every service page.' },
      { name: 'phoneItLabel', label: 'Second phone (optional)', hint: 'Leave empty to show only the main phone.' },
      { name: 'phoneLocal', label: 'Phone on the contact page', hint: 'For example 01774029768.' },
      { name: 'whatsappNumber', label: 'WhatsApp number', hint: 'With the country code. Every WhatsApp button on the site uses it.' },
    ],
  },
  {
    title: 'Privacy Policy',
    description: 'The page the footer links to. Social links are under Menu & Footer.',
    fields: [
      { name: 'privacy', label: 'Privacy Policy page', type: 'url' },
    ],
  },
];

const IMAGE_FIELDS: { name: keyof ImageSettings; label: string; hint: string }[] = [
  { name: 'problems', label: 'Homepage: picture beside “Is Your Website Holding Your Business Back?”', hint: 'Landscape, at least 1200 × 800 px. It is cropped to 3:2. Describe it under Website Text → Problems → Image Alt.' },
  { name: 'outcomeFounder', label: 'Founder photo', hint: 'Portrait, at least 560 × 650 px.' },
  { name: 'outcomeHandover', label: 'Client handover photo', hint: 'Portrait, at least 560 × 650 px.' },
  { name: 'outcomeTeam', label: 'Team at work photo', hint: 'Tall, at least 1040 × 1200 px.' },
  { name: 'serviceContactCard', label: 'Service pages: contact card picture', hint: 'Shown beside the phone number on every service page. About 600 × 505 px.' },
  { name: 'servicesClosingPreview', label: 'Services page: closing card picture', hint: 'The wide picture at the end of the services page. About 1600 × 400 px.' },
];

interface SettingsFormProps {
  contact: ContactSettings;
  images: ImageSettings;
  options: SiteOptions;
  mailConfigured: boolean;
}

export const SettingsForm = ({ contact: initialContact, images: initialImages, options: initialOptions, mailConfigured }: SettingsFormProps) => {
  const router = useRouter();
  const [contact, setContact] = useState(initialContact);
  const [images, setImages] = useState(initialImages);
  const [whatsappButton, setWhatsappButton] = useState(initialOptions.whatsappButton);
  const [taka, setTaka] = useState({ ...DEFAULT_TAKA_PRICES, ...initialOptions.takaPrices, usdToBdt: String(initialOptions.takaPrices?.usdToBdt ?? DEFAULT_TAKA_PRICES.usdToBdt) });
  const [emailsText, setEmailsText] = useState(initialOptions.inquiryEmails.join('\n'));
  const [budgets, setBudgets] = useState<LocalizedValue[]>(initialOptions.budgets);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const touch = () => {
    setDone(false);
    setError(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    touch();
    setErrors({});
    // A photo that was removed goes back to the original
    const filled = Object.fromEntries((Object.keys(images) as (keyof ImageSettings)[]).map((key) => [key, images[key] || DEFAULT_IMAGES[key]]));

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact,
          images: filled,
          options: {
            whatsappButton,
            inquiryEmails: emailsText.split(/[\s,;]+/).map((email) => email.trim()).filter(Boolean),
            budgets: budgets.map((row) => ({ en: row.en.trim() || row.bn.trim(), bn: row.bn.trim() || row.en.trim() })).filter((row) => row.en),
            takaPrices: { showTakaInBangla: taka.showTakaInBangla, usdToBdt: Number(taka.usdToBdt), roundTo: taka.roundTo },
          },
        }),
      });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      const body: { message?: string; errors?: { path: string; message: string }[] } = await response.json();
      if (!response.ok) {
        const found: Record<string, string> = {};
        for (const issue of body.errors ?? []) {
          const parts = issue.path.split('.');
          found[parts.includes('inquiryEmails') ? 'inquiryEmails' : parts.includes('budgets') ? 'budgets' : parts.includes('takaPrices') ? 'takaPrices' : parts.at(-1)!] ??= issue.message;
        }
        setErrors(found);
        setError(body.message ?? 'Could not save. Please try again.');
        return;
      }
      setImages(filled as ImageSettings);
      setDone(true);
      router.refresh();
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-4xl space-y-5 pb-24">
      {CONTACT_SECTIONS.map((section) => (
        <section key={section.title} className={`${cardClass} ${cardPadding}`}>
          <h2 className="text-base font-semibold">{section.title}</h2>
          <p className="mt-1 text-sm text-muted">{section.description}</p>
          <div className="mt-6 grid gap-x-5 gap-y-6 sm:grid-cols-2">
            {section.fields.map((field) => (
              <div key={field.name}>
                <label htmlFor={field.name} className={`${labelClass} mb-1.5`}>{field.label}</label>
                <input
                  id={field.name}
                  type={field.type ?? 'text'}
                  dir="ltr"
                  value={contact[field.name]}
                  onChange={(event) => {
                    touch();
                    setContact((current) => ({ ...current, [field.name]: event.target.value }));
                  }}
                  className={inputClass}
                />
                {field.hint && <p className="mt-1.5 text-xs text-muted">{field.hint}</p>}
                {errors[field.name] && <p role="alert" className="mt-1.5 text-xs text-red-400">{errors[field.name]}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className={`${cardClass} ${cardPadding}`}>
        <h2 className="text-base font-semibold">WhatsApp Button</h2>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={whatsappButton} onChange={(event) => { touch(); setWhatsappButton(event.target.checked); }} className="mt-0.5 size-4 accent-primary" />
          <span>
            <span className="block text-sm font-medium">Show the round WhatsApp button in the corner of every page</span>
            <span className="mt-0.5 block text-xs text-muted">The WhatsApp links in the page sections stay either way.</span>
          </span>
        </label>
      </section>

      <section className={`${cardClass} ${cardPadding}`}>
        <h2 className="text-base font-semibold">Prices In Taka</h2>
        <p className="mt-1 text-sm text-muted">Prices are entered in dollars. On the Bangla site, the pricing plans and products can show them in Taka at your rate.</p>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <input type="checkbox" checked={taka.showTakaInBangla} onChange={(event) => { touch(); setTaka((current) => ({ ...current, showTakaInBangla: event.target.checked })); }} className="mt-0.5 size-4 accent-primary" />
          <span>
            <span className="block text-sm font-medium">Show prices in Taka (৳) on the Bangla site</span>
            <span className="mt-0.5 block text-xs text-muted">Off: the Bangla site shows dollars, like the English one.</span>
          </span>
        </label>
        <div className="mt-6 grid max-w-xl gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="usdToBdt" className={`${labelClass} mb-1.5`}>1 US dollar = how many Taka</label>
            <input id="usdToBdt" type="number" inputMode="decimal" min={1} max={1000} step="0.01" dir="ltr" value={taka.usdToBdt} disabled={!taka.showTakaInBangla} onChange={(event) => { touch(); setTaka((current) => ({ ...current, usdToBdt: event.target.value })); }} className={inputClass} />
            <p className="mt-1.5 text-xs text-muted">Check today&apos;s rate and update it here when it changes.</p>
          </div>
          <div>
            <label htmlFor="roundTo" className={`${labelClass} mb-1.5`}>Round prices to the nearest</label>
            <select id="roundTo" value={taka.roundTo} disabled={!taka.showTakaInBangla} onChange={(event) => { touch(); setTaka((current) => ({ ...current, roundTo: Number(event.target.value) })); }} className={inputClass}>
              {[1, 10, 50, 100, 500, 1000].map((step) => <option key={step} value={step}>৳{step.toLocaleString('en-US')}</option>)}
            </select>
            <p className="mt-1.5 text-xs text-muted">So a price reads ৳24,300 rather than ৳24,278.</p>
          </div>
        </div>
        {taka.showTakaInBangla && Number(taka.usdToBdt) > 0 && (
          <p className="mt-4 text-sm text-muted">
            Example: $199 becomes <span className="font-medium text-fg">৳{(Math.round((199 * Number(taka.usdToBdt)) / taka.roundTo) * taka.roundTo).toLocaleString('en-IN')}</span> on the Bangla site.
          </p>
        )}
        {errors.takaPrices && <p role="alert" className="mt-2 text-xs text-red-400">{errors.takaPrices}</p>}
      </section>

      <section className={`${cardClass} ${cardPadding}`}>
        <h2 className="text-base font-semibold">Inquiry Emails</h2>
        <p className="mt-1 text-sm text-muted">Who gets an email when someone sends an inquiry. Every inquiry is also kept under Inquiries.</p>
        {!mailConfigured && (
          <p role="status" className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
            No email service is connected to the website yet, so no emails are sent. Inquiries still arrive under Inquiries. Ask your developer to connect one, for example Resend or a Gmail app password.
          </p>
        )}
        <div className="mt-6 max-w-md">
          <label htmlFor="inquiryEmails" className={`${labelClass} mb-1.5`}>Email addresses</label>
          <textarea id="inquiryEmails" rows={3} dir="ltr" spellCheck={false} value={emailsText} onChange={(event) => { touch(); setEmailsText(event.target.value); }} className={inputClass} />
          <p className="mt-1.5 text-xs text-muted">One per line, up to ten.</p>
          {errors.inquiryEmails && <p role="alert" className="mt-1.5 text-xs text-red-400">{errors.inquiryEmails}</p>}
        </div>
      </section>

      <section className={`${cardClass} ${cardPadding}`}>
        <h2 className="text-base font-semibold">Budget Choices</h2>
        <p className="mt-1 text-sm text-muted">The list a visitor picks from in the contact page form. Add, remove or rename them.</p>
        <div className="mt-6">
          <FeaturesField value={budgets} onChange={(value) => { touch(); setBudgets(value); }} />
          {errors.budgets && <p role="alert" className="mt-1.5 text-xs text-red-400">{errors.budgets}</p>}
        </div>
      </section>

      <section className={`${cardClass} ${cardPadding}`}>
        <h2 className="text-base font-semibold">Section Photos</h2>
        <p className="mt-1 text-sm text-muted">Photos that are not part of a list elsewhere. Removing one brings the original back when you save.</p>
        <div className="mt-6 space-y-6">
          {IMAGE_FIELDS.map((field) => (
            <div key={field.name}>
              <label htmlFor={field.name} className={`${labelClass} mb-1.5`}>{field.label}</label>
              <ImageField
                id={field.name}
                value={images[field.name]}
                onChange={(value) => {
                  touch();
                  setImages((current) => ({ ...current, [field.name]: value }));
                }}
              />
              <p className="mt-1.5 text-xs text-muted">{field.hint}</p>
            </div>
          ))}
        </div>
      </section>

      <SaveBar saving={saving} saved={done} error={error} label="Save Changes" />
    </form>
  );
};

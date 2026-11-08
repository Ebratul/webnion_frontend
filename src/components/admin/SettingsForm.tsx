'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import { DEFAULT_IMAGES, type ContactSettings, type ImageSettings } from '@/lib/site';
import { ImageField, inputClass, labelClass } from './fields';
import { cardClass, cardPadding, SaveBar } from './ui';

const CONTACT_SECTIONS: { title: string; description: string; fields: { name: keyof ContactSettings; label: string; hint?: string; type?: string }[] }[] = [
  {
    title: 'Phone And Email',
    description: 'Shown in the footer, on the contact page and on every service page.',
    fields: [
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phoneBdLabel', label: 'Bangladesh phone', hint: 'Written as it should appear, for example +880 1774-029768.' },
      { name: 'phoneItLabel', label: 'Italy phone', hint: 'Written as it should appear, for example +39 344 489 9827.' },
      { name: 'phoneLocal', label: 'Phone on the contact page', hint: 'For example 01774029768.' },
      { name: 'whatsappNumber', label: 'WhatsApp number', hint: 'With the country code. Every WhatsApp button on the site uses it.' },
    ],
  },
  {
    title: 'Links',
    description: 'Each must be a full address starting with https://',
    fields: [
      { name: 'facebook', label: 'Facebook page', type: 'url' },
      { name: 'instagram', label: 'Instagram page', type: 'url' },
      { name: 'privacy', label: 'Privacy Policy page', type: 'url' },
    ],
  },
];

const IMAGE_FIELDS: { name: keyof ImageSettings; label: string; hint: string }[] = [
  { name: 'outcomeFounder', label: 'Founder photo', hint: 'Portrait, at least 560 × 650 px.' },
  { name: 'outcomeHandover', label: 'Client handover photo', hint: 'Portrait, at least 560 × 650 px.' },
  { name: 'outcomeTeam', label: 'Team at work photo', hint: 'Tall, at least 1040 × 1200 px.' },
];

export const SettingsForm = ({ contact: initialContact, images: initialImages }: { contact: ContactSettings; images: ImageSettings }) => {
  const router = useRouter();
  const [contact, setContact] = useState(initialContact);
  const [images, setImages] = useState(initialImages);
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
        body: JSON.stringify({ contact, images: filled }),
      });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      const body: { message?: string; errors?: { path: string; message: string }[] } = await response.json();
      if (!response.ok) {
        const found: Record<string, string> = {};
        for (const issue of body.errors ?? []) found[issue.path.split('.').at(-1)!] ??= issue.message;
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
        <h2 className="text-base font-semibold">Expert Insights Photos</h2>
        <p className="mt-1 text-sm text-muted">The three photos in that section of the homepage. Removing one brings the original back when you save.</p>
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

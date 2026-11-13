'use client';

import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import type { LocalizedValue } from '@/lib/admin/resources';
import type { PricingPageSettings } from '@/lib/pricingPage';
import { FeaturesField, LocalizedField } from './fields';
import { cardClass, cardPadding, quietButton, SaveBar } from './ui';

const iconButton = 'grid size-10 shrink-0 place-items-center rounded-lg text-muted transition-colors duration-200 hover:bg-white/[0.06] hover:text-white disabled:opacity-30';

// A missing Bangla text uses the English one, and the other way round
const clean = ({ en, bn }: LocalizedValue) => ({ en: en.trim() || bn.trim(), bn: bn.trim() || en.trim() });
const filled = (value: LocalizedValue) => Boolean(value.en.trim() || value.bn.trim());

const Card = ({ title, description, children }: { title: string; description: string; children: React.ReactNode }) => (
  <section className={`${cardClass} ${cardPadding}`}>
    <h2 className="text-base font-semibold">{title}</h2>
    <p className="mt-1 text-sm text-muted">{description}</p>
    <div className="mt-6">{children}</div>
  </section>
);

export const PricingPageForm = ({ initial }: { initial: PricingPageSettings }) => {
  const router = useRouter();
  const [value, setValue] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof PricingPageSettings>(key: K, next: PricingPageSettings[K]) => {
    setDone(false);
    setError(null);
    setValue((current) => ({ ...current, [key]: next }));
  };

  const moveStep = (index: number, by: number) => {
    const steps = [...value.steps];
    const [step] = steps.splice(index, 1);
    steps.splice(index + by, 0, step!);
    set('steps', steps);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const payload: PricingPageSettings = {
      included: value.included.filter(filled).map(clean),
      steps: value.steps.filter((step) => filled(step.title)).map((step) => ({ title: clean(step.title), text: filled(step.text) ? clean(step.text) : clean(step.title) })),
      extras: value.extras.filter(filled).map(clean),
    };
    if (payload.steps.length === 0) {
      setError('Keep at least one step.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/site-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pricingPage: payload }) });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      const body: { message?: string } = await response.json();
      if (!response.ok) {
        setError(body.message ?? 'Could not save. Please try again.');
        return;
      }
      setValue(payload);
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
      <Card title="Every Project Includes" description="The short list in the dashed strip under the plans. Keep each item to a few words. Up to ten.">
        <FeaturesField value={value.included} onChange={(next) => set('included', next)} />
      </Card>

      <Card title="What Happens After You Book" description="The steps in the panel under the strip, in order. Each gets an icon: a call, a plan, the build, the launch, then support. Up to six.">
        <ol className="space-y-4">
          {value.steps.map((step, index) => (
            <li key={index} className="rounded-xl border border-line bg-surface-2/40 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-accent">Step {index + 1}</p>
                <div className="flex">
                  <button type="button" disabled={index === 0} onClick={() => moveStep(index, -1)} aria-label={`Move step ${index + 1} up`} className={iconButton}><ArrowUp aria-hidden className="size-4" /></button>
                  <button type="button" disabled={index === value.steps.length - 1} onClick={() => moveStep(index, 1)} aria-label={`Move step ${index + 1} down`} className={iconButton}><ArrowDown aria-hidden className="size-4" /></button>
                  <button type="button" disabled={value.steps.length <= 1} onClick={() => set('steps', value.steps.filter((_, position) => position !== index))} aria-label={`Remove step ${index + 1}`} className={`${iconButton} hover:text-red-400`}><Trash2 aria-hidden className="size-4" /></button>
                </div>
              </div>
              <div className="space-y-3">
                <LocalizedField id={`step-${index}-title`} value={step.title} onChange={(title) => set('steps', value.steps.map((item, position) => (position === index ? { ...item, title } : item)))} />
                <LocalizedField id={`step-${index}-text`} multiline value={step.text} onChange={(text) => set('steps', value.steps.map((item, position) => (position === index ? { ...item, text } : item)))} />
              </div>
            </li>
          ))}
        </ol>
        {value.steps.length < 6 && (
          <button type="button" onClick={() => set('steps', [...value.steps, { title: { en: '', bn: '' }, text: { en: '', bn: '' } }])} className={`${quietButton} mt-4`}>
            <Plus aria-hidden className="size-4" />
            Add Step
          </button>
        )}
      </Card>

      <Card title="We Also Provide" description="The other services in the grid at the bottom of the page. Up to forty.">
        <FeaturesField value={value.extras} onChange={(next) => set('extras', next)} />
      </Card>

      <SaveBar saving={saving} saved={done} error={error} label="Save Pricing Page" />
    </form>
  );
};

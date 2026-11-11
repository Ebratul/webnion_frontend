'use client';

import { ArrowUpRight, Check, Eye, EyeOff, Lock, Type } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import { HOME_SECTIONS } from '@/lib/homeSections';
import { cardClass } from './ui';

const smallButton =
  'inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-xs font-medium transition-[border-color,background-color,color] duration-200 hover:border-accent/60 hover:bg-tint hover:text-white';

// Every homepage section in page order. Showing or hiding one saves at once; each links to where its words and items are edited.
export const HomepageSections = ({ hidden: initial }: { hidden: string[] }) => {
  const router = useRouter();
  const [hidden, setHidden] = useState(() => new Set(initial));
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const toggle = async (key: string, label: string) => {
    const next = new Set(hidden);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSaving(key);
    setMessage(null);
    try {
      const response = await fetch('/api/admin/site-settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ homepage: { hidden: [...next] } }) });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      if (!response.ok) throw new Error();
      setHidden(next);
      setMessage({ ok: true, text: `${label} is now ${next.has(key) ? 'hidden from' : 'shown on'} the homepage.` });
      router.refresh();
    } catch {
      setMessage({ ok: false, text: 'Could not save. Please try again.' });
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="max-w-4xl">
      <p role="status" aria-live="polite" className={`mb-4 min-h-6 text-sm ${message?.ok === false ? 'text-red-400' : 'text-muted'}`}>
        {message && (
          <span className="inline-flex items-center gap-1.5">
            {message.ok && <Check aria-hidden className="size-4 text-accent" />}
            {message.text}
          </span>
        )}
      </p>
      <ol className="space-y-3">
        {HOME_SECTIONS.map((section, index) => {
          const isHidden = hidden.has(section.key);
          return (
            <li key={section.key} className={`flex flex-wrap items-center gap-x-5 gap-y-4 p-5 transition-[border-color,background-color] duration-200 hover:border-accent/40 sm:px-6 ${cardClass} ${isHidden ? 'opacity-70' : ''}`}>
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-tint text-sm font-semibold tabular-nums text-accent">{index + 1}</span>
              <div className="min-w-0 flex-1 basis-56">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold">{section.label}</h2>
                  {isHidden && <span className="rounded-full border border-line px-2 py-0.5 text-[0.6875rem] text-muted">Hidden</span>}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{section.description}</p>
              </div>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                {section.textGroup && (
                  <Link href={`/admin/website-text?group=${section.textGroup}`} className={smallButton}>
                    <Type aria-hidden className="size-3.5" />
                    Text
                  </Link>
                )}
                {section.manage && (
                  <Link href={section.manage.href} className={smallButton}>
                    {section.manage.label}
                    <ArrowUpRight aria-hidden className="size-3.5" />
                  </Link>
                )}
                {section.canHide ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={!isHidden}
                    aria-label={`Show ${section.label} on the homepage`}
                    disabled={saving !== null}
                    onClick={() => void toggle(section.key, section.label)}
                    className={`inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-colors duration-200 disabled:opacity-60 ${isHidden ? 'border border-line text-muted hover:text-white' : 'bg-primary text-white hover:bg-primary-hover'}`}
                  >
                    {isHidden ? <EyeOff aria-hidden className="size-3.5" /> : <Eye aria-hidden className="size-3.5" />}
                    {saving === section.key ? 'Saving…' : isHidden ? 'Hidden' : 'Shown'}
                  </button>
                ) : (
                  <span title="Buttons across the site lead here" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-4 text-xs text-muted">
                    <Lock aria-hidden className="size-3.5" />
                    Always shown
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

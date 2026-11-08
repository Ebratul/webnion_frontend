'use client';

import { ChevronDown, RotateCcw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import { TEXT_GROUPS, textLabel } from '@/lib/admin/textGroups';
import type { FlatText, TextOverrides } from '@/lib/siteText';
import { inputClass } from './fields';
import { cardClass, SaveBar } from './ui';

type Language = 'en' | 'bn';
const LANGUAGES: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'bn', label: 'বাংলা' },
];

interface TextEditorProps {
  defaults: Record<Language, FlatText>;
  saved: Record<Language, TextOverrides>;
}

const startingValues = (defaults: FlatText, saved: TextOverrides) => Object.fromEntries(Object.entries(defaults).map(([path, value]) => [path, saved[path] ?? String(value)]));

// Rows only render when their group is open or matches a search: the whole site is several hundred fields
export const TextEditor = ({ defaults, saved }: TextEditorProps) => {
  const router = useRouter();
  const [values, setValues] = useState<Record<Language, Record<string, string>>>(() => ({ en: startingValues(defaults.en, saved.en), bn: startingValues(defaults.bn, saved.bn) }));
  const [open, setOpen] = useState<string | null>('hero');
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paths = useMemo(() => Object.keys(defaults.en), [defaults.en]);
  const isChanged = (code: Language, path: string) => values[code][path] !== String(defaults[code][path]);
  const groupPaths = (key: string) => paths.filter((path) => path.split('.')[0] === key);

  const needle = query.trim().toLowerCase();
  const matches = (path: string) =>
    !needle || textLabel(path).toLowerCase().includes(needle) || values.en[path]?.toLowerCase().includes(needle) || values.bn[path]?.toLowerCase().includes(needle);

  const setValue = (code: Language, path: string, value: string) => {
    setDone(false);
    setError(null);
    setValues((current) => ({ ...current, [code]: { ...current[code], [path]: value } }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setDone(false);

    // Only what differs from the built-in text is stored. An emptied box goes back to it.
    const collect = (code: Language) => Object.fromEntries(paths.flatMap((path) => {
      const value = values[code][path]?.trim();
      return value && value !== String(defaults[code][path]) ? [[path, value]] : [];
    }));

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: { en: collect('en'), bn: collect('bn') } }),
      });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      if (!response.ok) {
        const body: { message?: string } = await response.json().catch(() => ({}));
        setError(body.message ?? 'Could not save. Please try again.');
        return;
      }
      setDone(true);
      router.refresh();
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderRow = (path: string) => (
    <div key={path} className="py-5 first:pt-0 last:pb-0">
      <p className="mb-2.5 text-sm font-medium">{textLabel(path)}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {LANGUAGES.map(({ code, label }) => {
          const id = `${code}-${path}`;
          const value = values[code][path] ?? '';
          const long = String(defaults[code][path]).length > 70;
          return (
            <div key={code}>
              <div className="mb-1.5 flex min-h-6 items-center justify-between gap-2">
                <label htmlFor={id} className="text-xs text-muted">{label}</label>
                {isChanged(code, path) && (
                  <button type="button" onClick={() => setValue(code, path, String(defaults[code][path]))} className="inline-flex min-h-6 items-center gap-1 text-xs text-accent transition-colors duration-200 hover:text-white">
                    <RotateCcw aria-hidden className="size-3" />
                    Original
                  </button>
                )}
              </div>
              {long ? (
                <textarea id={id} lang={code} rows={Math.min(Math.ceil(value.length / 55) + 1, 7)} value={value} onChange={(event) => setValue(code, path, event.target.value)} className={inputClass} />
              ) : (
                <input id={id} lang={code} value={value} onChange={(event) => setValue(code, path, event.target.value)} className={inputClass} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="pb-24">
      <div className="relative mb-5 sm:max-w-sm">
        <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search any text on the website" aria-label="Search website text" className={`${inputClass} pl-10`} />
      </div>

      <div className="space-y-3">
        {TEXT_GROUPS.map((group) => {
          const rows = groupPaths(group.key).filter(matches);
          if (rows.length === 0) return null;
          const changed = groupPaths(group.key).filter((path) => isChanged('en', path) || isChanged('bn', path)).length;
          const expanded = needle ? true : open === group.key;

          return (
            <section key={group.key} className={`overflow-hidden transition-colors duration-200 hover:border-accent/40 ${cardClass}`}>
              <h2>
                <button type="button" aria-expanded={expanded} disabled={Boolean(needle)} onClick={() => setOpen(expanded ? null : group.key)} className="flex min-h-[4.5rem] w-full items-center gap-4 px-5 py-4 text-left sm:px-7">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{group.label}</span>
                    <span className="mt-0.5 block text-xs text-muted">{group.hint}</span>
                  </span>
                  {changed > 0 && <span className="shrink-0 rounded-full bg-tint px-2.5 py-0.5 text-[0.6875rem] font-semibold text-accent">{changed} edited</span>}
                  <ChevronDown aria-hidden className={`size-4 shrink-0 text-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                </button>
              </h2>
              {expanded && <div className="divide-y divide-line border-t border-line px-5 py-5 sm:px-7 sm:py-6">{rows.map(renderRow)}</div>}
            </section>
          );
        })}
      </div>

      <SaveBar saving={saving} saved={done} error={error} label="Save Text" />
    </form>
  );
};

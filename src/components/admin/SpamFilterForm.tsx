'use client';

import { Ban, Clock, MessageSquareX, Plus, ShieldCheck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useMemo, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import { isBlocked, isValidBlockEntry, normalizeBlockEntry, type SpamFilter, type SpamFilterData } from '@/lib/admin/spamFilter';
import { inputClass, labelClass, Toggle } from './fields';
import { cardClass, cardPadding, EmptyState, quietButton, SaveBar } from './ui';

const Card = ({ title, description, Icon, children }: { title: string; description: string; Icon: typeof Ban; children: ReactNode }) => (
  <section className={`${cardClass} ${cardPadding}`}>
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-tint text-accent">
        <Icon aria-hidden className="size-4" />
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-0.5 text-sm text-muted">{description}</p>
      </div>
    </div>
    <div className="mt-6">{children}</div>
  </section>
);

// A list of short entries shown as chips. Several can be pasted at once, separated by commas, spaces or new lines.
const ChipList = ({
  label,
  placeholder,
  values,
  onChange,
  clean,
  validate,
  invalidMessage,
}: {
  label: string;
  placeholder: string;
  values: string[];
  onChange: (next: string[]) => void;
  clean: (value: string) => string;
  validate: (value: string) => boolean;
  invalidMessage: string;
}) => {
  const id = useId();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const add = () => {
    const entries = draft.split(/[\n,;]+/).map(clean).filter(Boolean);
    if (entries.length === 0) return;
    const wrong = entries.filter((entry) => !validate(entry));
    if (wrong.length > 0) {
      setError(`${invalidMessage}: ${wrong.slice(0, 3).join(', ')}`);
      return;
    }
    setError('');
    setDraft('');
    onChange([...new Set([...entries, ...values])]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      add();
    }
  };

  const shown = query ? values.filter((value) => value.includes(query.trim().toLowerCase())) : values;

  return (
    <div>
      <label htmlFor={id} className={labelClass}>{label}</label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={id}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setError('');
          }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={inputClass}
        />
        <button type="button" onClick={add} className={`${quietButton} shrink-0`}>
          <Plus aria-hidden className="size-4" />
          Add
        </button>
      </div>
      {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-400">{error}</p>}

      {values.length > 0 ? (
        <>
          {values.length > 12 && (
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${values.length} entries`}
              aria-label={`Search ${label.toLowerCase()}`}
              className={`${inputClass} mt-4 max-w-xs`}
            />
          )}
          <ul className="mt-4 flex max-h-72 flex-wrap gap-2 overflow-y-auto">
            {shown.map((value) => (
              <li key={value} className="inline-flex max-w-full items-center gap-1 rounded-full border border-line bg-surface-2 py-1 pl-3 pr-1 text-sm">
                <span className="truncate">{value}</span>
                <button
                  type="button"
                  onClick={() => onChange(values.filter((item) => item !== value))}
                  aria-label={`Remove ${value}`}
                  className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition-colors duration-200 hover:bg-red-500/15 hover:text-red-300"
                >
                  <X aria-hidden className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-line px-4 py-5 text-center text-xs text-muted">Nothing blocked yet.</p>
      )}
    </div>
  );
};

const NumberField = ({ label, hint, value, min, max, suffix, onChange }: { label: string; hint: string; value: number; min: number; max: number; suffix: string; onChange: (value: number) => void }) => {
  const id = useId();
  return (
    <div className="rounded-xl border border-line bg-surface-2/50 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="min-w-0">
          <span className="block text-sm font-medium">{label}</span>
          <span className="mt-0.5 block text-xs text-muted">{hint}</span>
        </label>
        <div className="flex shrink-0 items-center gap-2 text-sm text-muted">
          <input
            id={id}
            type="number"
            inputMode="numeric"
            min={min}
            max={max}
            value={value}
            onChange={(event) => onChange(Math.min(Math.max(Math.round(Number(event.target.value) || 0), min), max))}
            className={`${inputClass} w-20 text-center tabular-nums`}
          />
          {suffix}
        </div>
      </div>
    </div>
  );
};

const timeAgo = (iso: string, now: number) => {
  const minutes = Math.round((now - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

export const SpamFilterForm = ({ initial }: { initial: SpamFilterData }) => {
  const router = useRouter();
  const [filter, setFilter] = useState<SpamFilter>(initial.filter);
  const [saved, setSaved] = useState(initial.filter);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Set after mount, so the server and the browser render the same times
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);

  const dirty = useMemo(() => JSON.stringify(filter) !== JSON.stringify(saved), [filter, saved]);

  const set = <K extends keyof SpamFilter>(key: K, value: SpamFilter[K]) => {
    setDone(false);
    setError(null);
    setFilter((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/inquiries/spam-filter', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(filter) });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      const result: { message?: string; errors?: { message: string }[]; data?: SpamFilterData } = await response.json().catch(() => ({}));
      if (!response.ok || !result.data) throw new Error(result.errors?.[0]?.message ?? result.message ?? 'Could not save. Please try again.');
      setFilter(result.data.filter);
      setSaved(result.data.filter);
      setDone(true);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-28">
      <Card title="Rules for every message" description="Checked before a message is saved or emailed to you." Icon={ShieldCheck}>
        <div className="grid gap-3 lg:grid-cols-2">
          <NumberField
            label="Wait between messages"
            hint="One message per email address in this time. 0 turns it off."
            value={filter.cooldownMinutes}
            min={0}
            max={1440}
            suffix="min"
            onChange={(value) => set('cooldownMinutes', value)}
          />
          <NumberField
            label="Links allowed in a message"
            hint="Spam is full of links. Real clients rarely send more than one or two."
            value={filter.maxLinks}
            min={0}
            max={20}
            suffix="links"
            onChange={(value) => set('maxLinks', value)}
          />
          <Toggle label="Refuse throwaway inboxes" hint="Addresses such as mailinator.com or yopmail.com, which nobody reads later." checked={filter.blockDisposable} onChange={(value) => set('blockDisposable', value)} />
          <Toggle label="Drop copied messages" hint="The same text sent from a different address within a day." checked={filter.blockDuplicates} onChange={(value) => set('blockDuplicates', value)} />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          A visitor who waits too little, uses a throwaway inbox or adds too many links is told what to fix. Blocked addresses, blocked words, links typed into
          the name and copied messages are dropped quietly: the sender sees the usual thank-you, and nothing reaches your inbox.
        </p>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Blocked emails and domains" description="An address blocks one sender. A domain such as spam-site.com blocks everyone writing from it." Icon={Ban}>
          <ChipList
            label="Email or domain"
            placeholder="name@example.com or example.com"
            values={filter.blockedEmails}
            onChange={(value) => set('blockedEmails', value)}
            clean={normalizeBlockEntry}
            validate={isValidBlockEntry}
            invalidMessage="Not an email address or domain"
          />
        </Card>
        <Card title="Blocked words" description="A message containing one of these is dropped. Use words only spam would use, such as casino or backlinks." Icon={MessageSquareX}>
          <ChipList
            label="Word or phrase"
            placeholder="backlinks, crypto investment"
            values={filter.blockedWords}
            onChange={(value) => set('blockedWords', value)}
            clean={(value) => value.trim().toLowerCase()}
            validate={(value) => value.length >= 2 && value.length <= 80}
            invalidMessage="Use 2 to 80 characters"
          />
        </Card>
      </div>

      <Card title="Recently stopped" description="The last messages the filter stopped. If a real client is here, unblock them and save." Icon={Clock}>
        {initial.blocked.length === 0 ? (
          <EmptyState>Nothing stopped yet.</EmptyState>
        ) : (
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {initial.blocked.map((entry) => {
              const blocked = isBlocked(entry.email, filter.blockedEmails);
              return (
                <li key={`${entry.at}-${entry.email}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                  <span className="min-w-0 flex-1 basis-48 truncate font-medium">{entry.email}</span>
                  <span className="text-xs text-muted">{entry.reason}</span>
                  <span className="w-20 text-right text-xs tabular-nums text-muted">{now ? timeAgo(entry.at, now) : ''}</span>
                  {blocked && (
                    <button
                      type="button"
                      onClick={() => set('blockedEmails', filter.blockedEmails.filter((item) => !isBlocked(entry.email, [item])))}
                      className="min-h-9 rounded-full border border-line px-3 text-xs font-medium transition-colors duration-200 hover:border-accent hover:text-white"
                    >
                      Unblock
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <SaveBar saving={saving} saved={done && !dirty} error={error} label="Save Filter" note={dirty ? <span className="text-xs text-muted">Unsaved changes</span> : undefined} />
    </form>
  );
};

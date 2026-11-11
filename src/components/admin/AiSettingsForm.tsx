'use client';

import { AlertTriangle, CheckCircle2, CircleSlash, FlaskConical, KeyRound, Loader2, RefreshCw, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { MODEL_EXAMPLES, providerLabel, SLOTS, type AiSettingsData, type MaskedSlot, type ModelSlot, type SiteTextDocument } from '@/lib/admin/ai';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import { inputClass, labelClass } from './fields';
import { cardClass, cardPadding, quietButton, SaveBar } from './ui';

type Settings = AiSettingsData['settings'];

interface SlotDraft {
  provider: string;
  model: string;
  apiKey: string;
  clearApiKey: boolean;
  baseUrl: string;
  hfProvider: string;
  inputPerMillion: string;
  outputPerMillion: string;
  perPicture: string;
}

interface TestResult {
  ok: boolean;
  answers?: boolean;
  tools?: boolean | null;
  structured?: boolean | null;
  dimension?: number | null;
  picture?: boolean | null;
  latency_ms?: number;
  error?: { code: string; message: string } | null;
  saved?: boolean;
  message?: string;
}

const toDraft = (slot: MaskedSlot): SlotDraft => ({
  provider: slot.provider,
  model: slot.model,
  apiKey: '',
  clearApiKey: false,
  baseUrl: slot.baseUrl ?? '',
  hfProvider: slot.hfProvider ?? '',
  inputPerMillion: slot.pricing?.inputPerMillion?.toString() ?? '',
  outputPerMillion: slot.pricing?.outputPerMillion?.toString() ?? '',
  perPicture: slot.pricing?.perPicture?.toString() ?? '',
});

const price = (value: string) => (value.trim() === '' ? undefined : Math.max(0, Number(value)));

const Card = ({ title, description, children, aside }: { title: string; description?: string; children: ReactNode; aside?: ReactNode }) => (
  <section className={`${cardClass} ${cardPadding}`}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="max-w-2xl">
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {aside}
    </div>
    <div className="mt-6">{children}</div>
  </section>
);

const Toggle = ({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (value: boolean) => void }) => {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-line bg-surface-2/50 px-4 py-3">
      <label htmlFor={id} className="min-w-0 cursor-pointer">
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-muted">{hint}</span>}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-primary' : 'bg-white/15'}`}
      >
        <span className={`inline-block size-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );
};

const Field = ({ label, hint, children, id }: { label: string; hint?: string; children: ReactNode; id: string }) => (
  <div>
    <label htmlFor={id} className={labelClass}>{label}</label>
    <div className="mt-1.5">{children}</div>
    {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
  </div>
);

const KeyInput = ({ id, saved, value, onChange, cleared, onClear, label = 'API key' }: { id: string; saved: { hasKey: boolean; keyHint: string; keyUnreadable: boolean }; value: string; onChange: (value: string) => void; cleared: boolean; onClear: (value: boolean) => void; label?: string }) => (
  <Field
    id={id}
    label={label}
    hint={saved.keyUnreadable ? 'The saved key cannot be read: AI_SECRETS_KEY changed on the server. Paste the key again.' : saved.hasKey ? 'Leave empty to keep the saved key.' : 'Stored encrypted. It is never shown again or sent to the browser.'}
  >
    <div className="flex gap-2">
      <div className="relative flex-1">
        <KeyRound aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          id={id}
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={saved.hasKey && !cleared ? `Saved: ${saved.keyHint}` : 'Paste the key'}
          className={`${inputClass} pl-10 font-mono`}
        />
      </div>
      {saved.hasKey && (
        <button type="button" onClick={() => onClear(!cleared)} className={`${quietButton} shrink-0 ${cleared ? 'border-red-400/60 text-red-300' : ''}`}>
          {cleared ? 'Undo remove' : 'Remove'}
        </button>
      )}
    </div>
  </Field>
);

const Capability = ({ label, value }: { label: string; value: boolean | null | undefined }) =>
  value === null || value === undefined ? null : (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${value ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
      {value ? <CheckCircle2 aria-hidden className="size-3.5" /> : <CircleSlash aria-hidden className="size-3.5" />}
      {label}
    </span>
  );

const SlotEditor = ({ slot, saved, draft, onChange, fakeAllowed }: { slot: (typeof SLOTS)[number]; saved: MaskedSlot; draft: SlotDraft; onChange: (draft: SlotDraft) => void; fakeAllowed: boolean }) => {
  const id = useId();
  const router = useRouter();
  const [testing, setTesting] = useState(false);
  const [makePicture, setMakePicture] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const set = (change: Partial<SlotDraft>) => {
    setResult(null);
    onChange({ ...draft, ...change });
  };
  const providers = fakeAllowed ? [...slot.providers, 'fake'] : slot.providers;
  const examples = MODEL_EXAMPLES[slot.key][draft.provider] ?? [];

  const test = async () => {
    setTesting(true);
    setResult(null);
    try {
      const response = await fetch('/api/admin/ai/settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slot: slot.key,
          provider: draft.provider,
          model: draft.model.trim(),
          ...(draft.apiKey.trim() ? { apiKey: draft.apiKey.trim() } : {}),
          ...(draft.baseUrl.trim() ? { baseUrl: draft.baseUrl.trim() } : {}),
          ...(draft.hfProvider.trim() ? { hfProvider: draft.hfProvider.trim() } : {}),
          ...(slot.key === 'image' ? { makePicture } : {}),
        }),
      });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      const body: { message?: string; data?: TestResult } = await response.json();
      setResult(body.data ?? { ok: false, message: body.message ?? 'Test failed' });
      if (body.data?.saved) router.refresh();
    } catch {
      setResult({ ok: false, message: 'Could not reach the server.' });
    } finally {
      setTesting(false);
    }
  };

  const tested = result ?? (saved.tested && saved.provider === draft.provider && saved.model === draft.model ? { ...saved.tested, answers: saved.tested.ok } : null);

  return (
    <div className="rounded-2xl border border-line bg-surface-2/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <h3 className="text-sm font-semibold">{slot.title}</h3>
          <p className="mt-1 text-xs text-muted">{slot.description}</p>
        </div>
        <button type="button" onClick={() => void test()} disabled={testing || !draft.provider || !draft.model.trim()} className={quietButton}>
          {testing ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <FlaskConical aria-hidden className="size-4" />}
          {testing ? 'Testing…' : 'Test'}
        </button>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <Field id={`${id}-provider`} label="Provider">
          <select id={`${id}-provider`} value={draft.provider} onChange={(event) => set({ provider: event.target.value })} className={inputClass}>
            <option value="">Not set</option>
            {providers.map((provider) => <option key={provider} value={provider}>{providerLabel(provider)}</option>)}
          </select>
        </Field>
        <Field id={`${id}-model`} label="Model name" hint={examples.length ? `For example: ${examples.join(', ')}` : 'Exactly as the provider names it.'}>
          <input id={`${id}-model`} list={`${id}-examples`} value={draft.model} onChange={(event) => set({ model: event.target.value })} spellCheck={false} autoComplete="off" className={`${inputClass} font-mono`} />
          <datalist id={`${id}-examples`}>{examples.map((example) => <option key={example} value={example} />)}</datalist>
        </Field>
        {draft.provider && draft.provider !== 'fake' && (
          <div className="md:col-span-2">
            <KeyInput id={`${id}-key`} saved={saved} value={draft.apiKey} onChange={(apiKey) => set({ apiKey })} cleared={draft.clearApiKey} onClear={(clearApiKey) => set({ clearApiKey })} />
          </div>
        )}
        {(draft.provider === 'openai_compatible' || draft.provider === 'huggingface') && (
          <Field
            id={`${id}-base`}
            label={draft.provider === 'huggingface' ? 'Dedicated endpoint address (optional)' : 'Base address'}
            hint={draft.provider === 'huggingface' ? 'Only for a Hugging Face Inference Endpoint. Leave empty to use hosted inference.' : 'The provider’s OpenAI-compatible address, for example https://api.deepseek.com/v1. Must be a public https address.'}
          >
            <input id={`${id}-base`} type="url" value={draft.baseUrl} onChange={(event) => set({ baseUrl: event.target.value })} placeholder="https://" spellCheck={false} className={`${inputClass} font-mono`} />
          </Field>
        )}
        {draft.provider === 'huggingface' && !draft.baseUrl && (
          <Field id={`${id}-hf`} label="Inference provider (optional)" hint="Which Hugging Face partner runs the model. Empty means auto.">
            <input id={`${id}-hf`} value={draft.hfProvider} onChange={(event) => set({ hfProvider: event.target.value.toLowerCase() })} placeholder="auto" className={`${inputClass} font-mono`} />
          </Field>
        )}
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-xs font-medium text-muted hover:text-white">Prices for the cost estimate (optional)</summary>
        <div className="mt-3 grid gap-4 sm:grid-cols-3">
          {slot.key === 'image' ? (
            <Field id={`${id}-pp`} label="Per picture (USD)">
              <input id={`${id}-pp`} type="number" min={0} step="0.001" value={draft.perPicture} onChange={(event) => set({ perPicture: event.target.value })} className={inputClass} />
            </Field>
          ) : (
            <>
              <Field id={`${id}-in`} label="Input, per million tokens (USD)">
                <input id={`${id}-in`} type="number" min={0} step="0.01" value={draft.inputPerMillion} onChange={(event) => set({ inputPerMillion: event.target.value })} className={inputClass} />
              </Field>
              {slot.key !== 'embedding' && (
                <Field id={`${id}-out`} label="Output, per million tokens (USD)">
                  <input id={`${id}-out`} type="number" min={0} step="0.01" value={draft.outputPerMillion} onChange={(event) => set({ outputPerMillion: event.target.value })} className={inputClass} />
                </Field>
              )}
            </>
          )}
        </div>
      </details>

      {slot.key === 'image' && (
        <label className="mt-4 flex items-center gap-2 text-xs text-muted">
          <input type="checkbox" checked={makePicture} onChange={(event) => setMakePicture(event.target.checked)} className="size-4 accent-[var(--primary)]" />
          Make one small test picture when testing (costs one picture)
        </label>
      )}

      {tested && (
        <div role="status" className={`mt-4 rounded-xl border px-4 py-3 text-sm ${tested.ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
          <p className="flex items-center gap-2 font-medium">
            {tested.ok ? <CheckCircle2 aria-hidden className="size-4 text-emerald-400" /> : <AlertTriangle aria-hidden className="size-4 text-red-400" />}
            {tested.ok ? 'Works' : 'Did not work'}
            {'latency_ms' in tested && tested.latency_ms ? <span className="text-xs font-normal text-muted">{(tested.latency_ms / 1000).toFixed(1)} s</span> : null}
          </p>
          {!tested.ok && <p className="mt-1 text-xs text-red-200">{('error' in tested && tested.error?.message) || ('message' in tested && tested.message) || 'Unknown error'}</p>}
          {tested.ok && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Capability label="Tool calling: takes inquiries in the chat" value={tested.tools} />
              <Capability label="Structured output" value={tested.structured} />
              {tested.dimension ? <span className="rounded-full bg-tint px-2.5 py-1 text-xs text-accent">Vector size {tested.dimension}</span> : null}
              <Capability label="Test picture made" value={tested.picture} />
            </div>
          )}
          {result && result.ok && !result.saved && <p className="mt-2 text-xs text-muted">Save, then test again, to remember what this model can do.</p>}
        </div>
      )}
    </div>
  );
};

export const AiSettingsForm = ({ data, siteText }: { data: AiSettingsData; siteText: { en: SiteTextDocument[]; bn: SiteTextDocument[] } }) => {
  const router = useRouter();
  const initial = data.settings;
  const [settings, setSettings] = useState<Settings>(initial);
  const [slots, setSlots] = useState<Record<ModelSlot, SlotDraft>>(() => Object.fromEntries(SLOTS.map(({ key }) => [key, toDraft(initial.models[key])])) as Record<ModelSlot, SlotDraft>);
  const [pineconeKey, setPineconeKey] = useState({ value: '', clear: false });
  const [langsmithKey, setLangsmithKey] = useState({ value: '', clear: false });
  const [suggestions, setSuggestions] = useState({ en: initial.assistant.suggestions.en.join('\n'), bn: initial.assistant.suggestions.bn.join('\n') });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rebuild, setRebuild] = useState<{ running: boolean; message: string; ok?: boolean }>({ running: false, message: '' });
  const [search, setSearch] = useState({ query: '', locale: 'en', running: false, results: [] as { title: string; url: string; score: number; text: string }[], message: '' });
  const id = useId();

  const touch = () => {
    setSaved(false);
    setError(null);
  };
  const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    touch();
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    touch();
    const models = Object.fromEntries(
      SLOTS.map(({ key }) => {
        const draft = slots[key];
        return [
          key,
          {
            provider: draft.provider,
            model: draft.model.trim(),
            baseUrl: draft.baseUrl.trim(),
            hfProvider: draft.hfProvider.trim(),
            pricing: { inputPerMillion: price(draft.inputPerMillion), outputPerMillion: price(draft.outputPerMillion), perPicture: price(draft.perPicture) },
            ...(draft.apiKey.trim() ? { apiKey: draft.apiKey.trim() } : {}),
            ...(draft.clearApiKey ? { clearApiKey: true } : {}),
          },
        ];
      }),
    );
    const lines = (text: string) => text.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 4);

    try {
      const response = await fetch('/api/admin/ai/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: settings.enabled,
          showOnSite: settings.showOnSite,
          showInAdmin: settings.showInAdmin,
          features: settings.features,
          models,
          pinecone: {
            index: settings.pinecone.index,
            cloud: settings.pinecone.cloud,
            region: settings.pinecone.region,
            ...(pineconeKey.value.trim() ? { apiKey: pineconeKey.value.trim() } : {}),
            ...(pineconeKey.clear ? { clearApiKey: true } : {}),
          },
          langsmith: {
            project: settings.langsmith.project,
            ...(langsmithKey.value.trim() ? { apiKey: langsmithKey.value.trim() } : {}),
            ...(langsmithKey.clear ? { clearApiKey: true } : {}),
          },
          limits: settings.limits,
          assistant: { ...settings.assistant, suggestions: { en: lines(suggestions.en), bn: lines(suggestions.bn) } },
        }),
      });
      if (response.status === 401) {
        router.push(ADMIN_LOGIN_PATH);
        return;
      }
      const body: { message?: string; data?: AiSettingsData; errors?: { path: string; message: string }[] } = await response.json();
      if (!response.ok || !body.data) {
        const first = body.errors?.[0];
        setError(first ? `${first.path}: ${first.message}` : (body.message ?? 'Could not save.'));
        return;
      }
      // The website's built-in text also feeds the keyword search used without Pinecone, so it is refreshed on every save
      void fetch('/api/admin/ai/index/site-text', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteText) }).catch(() => undefined);
      // Keys typed in the form are cleared, so they do not linger in the page
      setSettings(body.data.settings);
      setSlots(Object.fromEntries(SLOTS.map(({ key }) => [key, toDraft(body.data!.settings.models[key])])) as Record<ModelSlot, SlotDraft>);
      setPineconeKey({ value: '', clear: false });
      setLangsmithKey({ value: '', clear: false });
      setSaved(true);
      router.refresh();
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const runRebuild = async () => {
    setRebuild({ running: true, message: 'Sending the website text…' });
    try {
      const text = await fetch('/api/admin/ai/index/site-text', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(siteText) });
      if (!text.ok) throw new Error((await text.json().catch(() => ({})))?.message ?? 'Could not send the website text');
      setRebuild({ running: true, message: 'Rebuilding the search index. This can take a few minutes…' });
      const response = await fetch('/api/admin/ai/index/rebuild', { method: 'POST' });
      const body: { message?: string; data?: { documents?: number; passages?: number } } = await response.json();
      if (!response.ok) throw new Error(body.message ?? 'Rebuild failed');
      setRebuild({ running: false, ok: true, message: body.data?.passages !== undefined ? `Done: ${body.data.documents} records in ${body.data.passages} passages.` : (body.message ?? 'Done') });
      router.refresh();
    } catch (failure) {
      setRebuild({ running: false, ok: false, message: (failure as Error).message });
    }
  };

  const runSearch = async (event: FormEvent) => {
    event.preventDefault();
    if (!search.query.trim()) return;
    setSearch((current) => ({ ...current, running: true, message: '', results: [] }));
    try {
      const response = await fetch('/api/admin/ai/index/search', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ query: search.query.trim(), locale: search.locale }) });
      const body: { message?: string; data?: typeof search.results } = await response.json();
      setSearch((current) => ({ ...current, running: false, results: body.data ?? [], message: response.ok ? (body.data?.length ? '' : 'Nothing found.') : (body.message ?? 'Search failed') }));
    } catch {
      setSearch((current) => ({ ...current, running: false, message: 'Could not reach the server.' }));
    }
  };

  const { status } = data;
  const index = initial.index;
  const number = (key: keyof Settings['limits'], label: string, hint: string, min: number, max: number) => (
    <Field id={`${id}-${key}`} label={label} hint={hint}>
      <input id={`${id}-${key}`} type="number" min={min} max={max} value={settings.limits[key]} onChange={(event) => update('limits', { ...settings.limits, [key]: Math.min(max, Math.max(min, Number(event.target.value) || min)) })} className={inputClass} />
    </Field>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-5 pb-24">
      {(!status.agentConnected || !status.canSaveKeys) && (
        <div role="alert" className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm">
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-amber-300" />
          <div>
            {!status.agentConnected && <p>The AI service is not connected. Set <code>AGENT_URL</code> and <code>AGENT_SHARED_SECRET</code> on the API server.</p>}
            {!status.canSaveKeys && <p>Keys cannot be saved until <code>AI_SECRETS_KEY</code> is set on the API server.</p>}
          </div>
        </div>
      )}

      <Card title="Assistant" description="The chat assistant answers visitors from the website’s own content, and can pass a visitor’s project details to the team after they confirm.">
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle label="Assistant on" hint="Turns the chat assistant on or off everywhere." checked={settings.enabled} onChange={(value) => update('enabled', value)} />
          <Toggle label="Show on the website" hint="A chat button above the WhatsApp button." checked={settings.showOnSite} onChange={(value) => update('showOnSite', value)} />
          <Toggle label="Show in the admin panel" hint="A chat button for the team on every admin screen." checked={settings.showInAdmin} onChange={(value) => update('showInAdmin', value)} />
          <Toggle label="Answer questions about the site" hint="Without it the chat stays hidden." checked={settings.features.siteQa} onChange={(value) => update('features', { ...settings.features, siteQa: value })} />
          <Toggle label="Take inquiries in the chat" hint="Needs a chat model with tool calling. Visitors check and send the details themselves." checked={settings.features.chatInquiry} onChange={(value) => update('features', { ...settings.features, chatInquiry: value })} />
          <Toggle label="Blog writer (AI Studio)" checked={settings.features.blogWriter} onChange={(value) => update('features', { ...settings.features, blogWriter: value })} />
          <Toggle label="Picture generation" hint="Cover and section pictures for blog drafts." checked={settings.features.pictures} onChange={(value) => update('features', { ...settings.features, pictures: value })} />
        </div>
      </Card>

      <Card title="Models" description="Pick a provider, type the model name and paste the API key for each job. One OpenAI, Google or Hugging Face key can cover every job. Press Test to check a model before relying on it.">
        <div className="space-y-4">
          {SLOTS.map((slot) => (
            <SlotEditor key={slot.key} slot={slot} saved={initial.models[slot.key]} draft={slots[slot.key]} fakeAllowed={status.fakeAllowed} onChange={(draft) => { touch(); setSlots((current) => ({ ...current, [slot.key]: draft })); }} />
          ))}
        </div>
      </Card>

      <Card
        title="Search index (Pinecone)"
        description="The assistant searches the site’s content here. Without Pinecone it searches by keyword, which works for a small site. The index is created on the first rebuild and updated by itself when content changes."
        aside={
          <button type="button" onClick={() => void runRebuild()} disabled={rebuild.running || !status.indexReady} className={quietButton}>
            <RefreshCw aria-hidden className={`size-4 ${rebuild.running ? 'animate-spin' : ''}`} />
            {rebuild.running ? 'Rebuilding…' : 'Rebuild'}
          </button>
        }
      >
        {status.needsRebuild && (
          <p role="alert" className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
            <AlertTriangle aria-hidden className="size-4 shrink-0 text-amber-300" />
            The embedding model or index changed. Press Rebuild so search uses it; until then the assistant searches by keyword.
          </p>
        )}
        {rebuild.message && <p role="status" className={`mb-4 text-sm ${rebuild.ok === false ? 'text-red-300' : 'text-muted'}`}>{rebuild.message}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <KeyInput id={`${id}-pc`} label="Pinecone API key" saved={initial.pinecone} value={pineconeKey.value} onChange={(value) => { touch(); setPineconeKey((current) => ({ ...current, value })); }} cleared={pineconeKey.clear} onClear={(clear) => { touch(); setPineconeKey((current) => ({ ...current, clear })); }} />
          </div>
          <Field id={`${id}-index`} label="Index name" hint="Lowercase letters, numbers and hyphens. A new name creates a new index.">
            <input id={`${id}-index`} value={settings.pinecone.index} onChange={(event) => update('pinecone', { ...settings.pinecone, index: event.target.value.toLowerCase() })} className={`${inputClass} font-mono`} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field id={`${id}-cloud`} label="Cloud">
              <select id={`${id}-cloud`} value={settings.pinecone.cloud} onChange={(event) => update('pinecone', { ...settings.pinecone, cloud: event.target.value as Settings['pinecone']['cloud'] })} className={inputClass}>
                <option value="aws">AWS</option>
                <option value="gcp">Google Cloud</option>
                <option value="azure">Azure</option>
              </select>
            </Field>
            <Field id={`${id}-region`} label="Region" hint="The free plan uses aws us-east-1.">
              <input id={`${id}-region`} value={settings.pinecone.region} onChange={(event) => update('pinecone', { ...settings.pinecone, region: event.target.value })} className={`${inputClass} font-mono`} />
            </Field>
          </div>
        </div>
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-4">
          {[
            ['Records', index.documents ?? '–'],
            ['Passages', index.passages ?? '–'],
            ['Vector size', index.dimension ?? '–'],
            ['Last rebuild', index.lastRebuildAt ? new Date(index.lastRebuildAt).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' }) : 'Never'],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-xl border border-line px-4 py-3">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-1 font-medium tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        {index.lastError && <p className="mt-3 text-xs text-red-300">Last error: {index.lastError}</p>}

        <div className="mt-6 border-t border-line pt-5">
          <p className="text-sm font-medium">Try a search</p>
          <p className="mt-1 text-xs text-muted">Shows the passages the assistant would read for a question. Uses saved settings.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input aria-label="Search question" value={search.query} onChange={(event) => setSearch((current) => ({ ...current, query: event.target.value }))} onKeyDown={(event) => event.key === 'Enter' && void runSearch(event)} placeholder="For example: ecommerce website price" className={inputClass} />
            <select aria-label="Language" value={search.locale} onChange={(event) => setSearch((current) => ({ ...current, locale: event.target.value }))} className={`${inputClass} sm:w-32`}>
              <option value="en">English</option>
              <option value="bn">Bangla</option>
            </select>
            <button type="button" onClick={(event) => void runSearch(event)} disabled={search.running} className={quietButton}>
              {search.running ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Search aria-hidden className="size-4" />}
              Search
            </button>
          </div>
          {search.message && <p className="mt-3 text-sm text-muted">{search.message}</p>}
          {search.results.length > 0 && (
            <ol className="mt-3 space-y-2">
              {search.results.map((result, position) => (
                <li key={`${result.url}-${position}`} className="rounded-xl border border-line px-4 py-3 text-sm">
                  <p className="flex flex-wrap items-center justify-between gap-2 font-medium">
                    {result.title || 'Untitled'}
                    <span className="text-xs font-normal tabular-nums text-muted">score {result.score}</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted">{result.text}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      </Card>

      <Card title="Greeting and tone" description="What visitors see when they open the chat, in both languages.">
        <div className="grid gap-4 md:grid-cols-2">
          {(['en', 'bn'] as const).map((language) => (
            <div key={language} className="space-y-4" lang={language}>
              <p className="text-xs font-semibold uppercase tracking-wide text-accent">{language === 'en' ? 'English' : 'Bangla'}</p>
              <Field id={`${id}-name-${language}`} label="Assistant name">
                <input id={`${id}-name-${language}`} maxLength={60} value={settings.assistant.name[language]} onChange={(event) => update('assistant', { ...settings.assistant, name: { ...settings.assistant.name, [language]: event.target.value } })} className={inputClass} />
              </Field>
              <Field id={`${id}-greet-${language}`} label="Greeting">
                <textarea id={`${id}-greet-${language}`} rows={3} maxLength={300} value={settings.assistant.greeting[language]} onChange={(event) => update('assistant', { ...settings.assistant, greeting: { ...settings.assistant.greeting, [language]: event.target.value } })} className={inputClass} />
              </Field>
              <Field id={`${id}-sugg-${language}`} label="Suggested questions" hint="One per line, up to four.">
                <textarea id={`${id}-sugg-${language}`} rows={4} value={suggestions[language]} onChange={(event) => { touch(); setSuggestions((current) => ({ ...current, [language]: event.target.value })); }} className={inputClass} />
              </Field>
            </div>
          ))}
          <div className="md:col-span-2">
            <Field id={`${id}-tone`} label="Tone" hint="How the assistant should sound. It always answers only from the website’s content.">
              <textarea id={`${id}-tone`} rows={2} maxLength={400} value={settings.assistant.tone} onChange={(event) => update('assistant', { ...settings.assistant, tone: event.target.value })} className={inputClass} />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Limits" description="Keep costs predictable. When a limit is reached, the feature pauses until the next day (UTC).">
        <div className="grid gap-4 md:grid-cols-3">
          {number('messagesPerVisitorPerDay', 'Messages per visitor per day', 'Counted by a one-way hash of the visitor’s address.', 1, 1000)}
          {number('publicMessagesPerDay', 'Website messages per day', 'All visitors together.', 1, 100000)}
          {number('maxReplyTokens', 'Longest reply (tokens)', 'About 0.75 words per token.', 64, 2000)}
          {number('blogsPerDay', 'Blog drafts per day', 'In AI Studio.', 0, 200)}
          {number('picturesPerBlog', 'Pictures per blog draft', 'Cover plus section pictures.', 0, 6)}
          {number('picturesPerDay', 'Pictures per day', 'All drafts together.', 0, 500)}
        </div>
      </Card>

      <Card title="LangSmith (optional)" description="Traces every AI request in LangSmith for debugging and evaluation. Email addresses, phone numbers and keys are masked in traces.">
        <div className="grid gap-4 md:grid-cols-2">
          <KeyInput id={`${id}-ls`} label="LangSmith API key" saved={initial.langsmith} value={langsmithKey.value} onChange={(value) => { touch(); setLangsmithKey((current) => ({ ...current, value })); }} cleared={langsmithKey.clear} onClear={(clear) => { touch(); setLangsmithKey((current) => ({ ...current, clear })); }} />
          <Field id={`${id}-project`} label="Project name">
            <input id={`${id}-project`} value={settings.langsmith.project} onChange={(event) => update('langsmith', { ...settings.langsmith, project: event.target.value })} className={inputClass} />
          </Field>
        </div>
      </Card>

      <SaveBar saving={saving} saved={saved} error={error} label="Save AI Settings" />
    </form>
  );
};

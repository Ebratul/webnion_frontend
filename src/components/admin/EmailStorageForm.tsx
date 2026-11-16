'use client';

import { CheckCircle2, CircleAlert, Cloud, KeyRound, Mail, Send, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import { MAIL_PRESETS, type IntegrationsData, type MailSettings, type MediaSettings } from '@/lib/admin/integrations';
import { cardClass, cardPadding, inputClass, labelClass, primaryButton, quietButton } from './ui';

type Result = { kind: 'ok' | 'error'; text: string } | null;

// Every call answers with the full settings, or a message saying what to fix
const call = async (path: string, method: string, body?: unknown): Promise<{ ok: boolean; status: number; message: string; data?: IntegrationsData }> => {
  const response = await fetch(`/api/admin/integrations${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json: { message?: string; errors?: { message: string }[]; data?: IntegrationsData } = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, message: json.errors?.[0]?.message ?? json.message ?? 'Something went wrong. Please try again.', data: json.data ?? undefined };
};

const Card = ({ title, description, Icon, status, children }: { title: string; description: string; Icon: typeof Mail; status: ReactNode; children: ReactNode }) => (
  <section className={`${cardClass} ${cardPadding}`}>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-tint text-accent">
          <Icon aria-hidden className="size-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-0.5 max-w-xl text-sm text-muted">{description}</p>
        </div>
      </div>
      {status}
    </div>
    <div className="mt-6">{children}</div>
  </section>
);

const Status = ({ good, children }: { good: boolean; children: ReactNode }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${good ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
    {good ? <CheckCircle2 aria-hidden className="size-3.5" /> : <CircleAlert aria-hidden className="size-3.5" />}
    {children}
  </span>
);

const Field = ({ id, label, hint, children }: { id: string; label: string; hint?: ReactNode; children: ReactNode }) => (
  <div>
    <label htmlFor={id} className={labelClass}>{label}</label>
    <div className="mt-1.5">{children}</div>
    {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
  </div>
);

// Typed once and never shown again. Left empty, the saved one is kept.
const SecretInput = ({ id, value, onChange, savedHint, placeholder }: { id: string; value: string; onChange: (value: string) => void; savedHint: string; placeholder: string }) => (
  <div className="relative">
    <KeyRound aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
    <input id={id} type="password" autoComplete="new-password" spellCheck={false} value={value} onChange={(event) => onChange(event.target.value)} placeholder={savedHint ? `Saved: ${savedHint}` : placeholder} className={`${inputClass} pl-10 font-mono`} />
  </div>
);

const Message = ({ result }: { result: Result }) =>
  result && (
    <p role={result.kind === 'error' ? 'alert' : 'status'} className={`text-sm ${result.kind === 'error' ? 'text-red-400' : 'text-emerald-300'}`}>
      {result.text}
    </p>
  );

// "Webnion <hello@webnion.com>" from .env becomes a name and an address
const splitFrom = (from = '') => {
  const match = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  return match ? { name: match[1]!.trim(), email: match[2]!.trim() } : { name: '', email: from.trim() };
};

const mailDraft = (mail: MailSettings) => {
  const envFrom = splitFrom(mail.envFrom);
  return {
    host: mail.host,
    port: mail.port || 587,
    user: mail.user,
    password: '',
    fromName: mail.source === 'admin' ? mail.fromName : envFrom.name,
    fromEmail: mail.source === 'admin' ? mail.fromEmail : envFrom.email,
  };
};

const EmailCard = ({ data, adminEmail, onSaved }: { data: IntegrationsData; adminEmail: string; onSaved: (data: IntegrationsData) => void }) => {
  const router = useRouter();
  const id = useId();
  const mail = data.mail;
  const [draft, setDraft] = useState(() => mailDraft(mail));
  const [clearPassword, setClearPassword] = useState(false);
  const [busy, setBusy] = useState<'save' | 'test' | 'remove' | null>(null);
  const [result, setResult] = useState<Result>(null);
  const [testTo, setTestTo] = useState(adminEmail);
  const [dirty, setDirty] = useState(false);
  const preset = MAIL_PRESETS.find((item) => item.host === draft.host);

  const set = (patch: Partial<typeof draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setDirty(true);
    setResult(null);
  };

  const finish = (response: Awaited<ReturnType<typeof call>>, success: string) => {
    if (response.status === 401) return router.push(ADMIN_LOGIN_PATH);
    if (!response.ok) return setResult({ kind: 'error', text: response.message });
    if (response.data) {
      onSaved(response.data);
      setDraft(mailDraft(response.data.mail));
      setClearPassword(false);
      setDirty(false);
    }
    setResult({ kind: 'ok', text: success });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy('save');
    setResult(null);
    const body = { ...draft, user: draft.user.trim(), ...(draft.password ? {} : { password: undefined }), ...(clearPassword ? { clearPassword: true } : {}) };
    finish(await call('/mail', 'PUT', body), 'Saved. The mail server accepted the sign-in, so inquiry emails will be sent.');
    setBusy(null);
  };

  const test = async () => {
    setBusy('test');
    setResult(null);
    const response = await call('/mail/test', 'POST', { to: testTo.trim() });
    if (response.status === 401) router.push(ADMIN_LOGIN_PATH);
    else setResult(response.ok ? { kind: 'ok', text: `${response.message}. Check that inbox, and the spam folder too.` } : { kind: 'error', text: response.message });
    setBusy(null);
  };

  const remove = async () => {
    if (!window.confirm(mail.source === 'admin' ? 'Stop using these email settings? The server’s .env settings are used instead, if there are any.' : 'Remove the email settings?')) return;
    setBusy('remove');
    finish(await call('/mail', 'DELETE'), 'Removed.');
    setBusy(null);
  };

  return (
    <Card
      title="Email server (SMTP)"
      description="Sends you an email for each new inquiry. Where those emails go is set under Contact & Links."
      Icon={Mail}
      status={
        mail.source === 'admin' ? <Status good>Sending emails</Status> : mail.source === 'env' ? <Status good>Using the server’s .env settings</Status> : <Status good={false}>Not set up: no emails are sent</Status>
      }
    >
      <form onSubmit={save} className="space-y-5">
        <div>
          <p className={labelClass}>Quick setup</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {MAIL_PRESETS.map((item) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={preset?.label === item.label}
                onClick={() => set({ host: item.host, port: item.port })}
                className={`min-h-9 rounded-full border px-3.5 text-xs font-medium transition-colors duration-200 ${preset?.label === item.label ? 'border-accent bg-primary/20 text-white' : 'border-line text-muted hover:border-accent/60 hover:text-white'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
          {preset && <p className="mt-2 rounded-xl bg-tint px-3.5 py-2.5 text-xs text-accent">{preset.note}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_9rem]">
          <Field id={`${id}-host`} label="SMTP server">
            <input id={`${id}-host`} value={draft.host} onChange={(event) => set({ host: event.target.value })} placeholder="smtp.gmail.com" required autoComplete="off" spellCheck={false} className={inputClass} />
          </Field>
          <Field id={`${id}-port`} label="Port">
            <select id={`${id}-port`} value={draft.port} onChange={(event) => set({ port: Number(event.target.value) })} className={inputClass}>
              <option value={587}>587 (TLS)</option>
              <option value={465}>465 (SSL)</option>
              <option value={2525}>2525</option>
              <option value={25}>25</option>
            </select>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={`${id}-user`} label="User name" hint="Usually your full email address.">
            <input id={`${id}-user`} value={draft.user} onChange={(event) => set({ user: event.target.value })} placeholder="you@gmail.com" autoComplete="off" spellCheck={false} className={inputClass} />
          </Field>
          <Field
            id={`${id}-password`}
            label="Password"
            hint={
              mail.passwordUnreadable ? (
                <span className="text-amber-300">The saved password cannot be read because the server’s key changed. Type it again.</span>
              ) : mail.source === 'admin' && mail.hasPassword ? (
                'Leave empty to keep the saved password.'
              ) : (
                'Stored encrypted and never shown again.'
              )
            }
          >
            <div className="flex gap-2">
              <div className="flex-1">
                <SecretInput id={`${id}-password`} value={draft.password} onChange={(password) => set({ password })} savedHint={mail.source === 'admin' && !clearPassword ? mail.passwordHint : ''} placeholder="App password" />
              </div>
              {mail.source === 'admin' && mail.hasPassword && (
                <button type="button" onClick={() => { setClearPassword(!clearPassword); setDirty(true); }} className={`${quietButton} shrink-0 px-4 ${clearPassword ? 'border-red-400/60 text-red-300' : ''}`}>
                  {clearPassword ? 'Undo' : 'Remove'}
                </button>
              )}
            </div>
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={`${id}-from-name`} label="Sender name" hint="Shown as who the email is from.">
            <input id={`${id}-from-name`} value={draft.fromName} onChange={(event) => set({ fromName: event.target.value })} placeholder="Webnion" className={inputClass} />
          </Field>
          <Field id={`${id}-from-email`} label="Sender email" hint="With Gmail, use the same address as the user name.">
            <input id={`${id}-from-email`} type="email" value={draft.fromEmail} onChange={(event) => set({ fromEmail: event.target.value })} placeholder="hello@webnion.com" required className={inputClass} />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button type="submit" disabled={busy !== null || !data.canEncrypt} className={primaryButton}>
            {busy === 'save' ? 'Checking the sign-in…' : 'Save'}
          </button>
          {mail.source === 'admin' && (
            <button type="button" onClick={() => void remove()} disabled={busy !== null} className={`${quietButton} hover:border-red-400/60 hover:text-red-300`}>
              <Trash2 aria-hidden className="size-4" />
              Remove
            </button>
          )}
          <Message result={result} />
        </div>
      </form>

      {mail.source !== 'none' && (
        <div className="mt-6 rounded-xl border border-line bg-surface-2/50 p-4">
          <label htmlFor={`${id}-test`} className={labelClass}>Send a test email</label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input id={`${id}-test`} type="email" value={testTo} onChange={(event) => setTestTo(event.target.value)} placeholder="you@example.com" className={inputClass} />
            <button type="button" onClick={() => void test()} disabled={busy !== null || dirty || !testTo.trim()} className={`${quietButton} shrink-0`}>
              <Send aria-hidden className="size-4" />
              {busy === 'test' ? 'Sending…' : 'Send Test'}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">{dirty ? 'Save your changes first, then send a test.' : 'Uses the saved settings.'}</p>
        </div>
      )}

      <p className="mt-5 text-xs text-muted">
        Inquiry emails go to the addresses under{' '}
        <Link href="/admin/settings" className="text-white underline underline-offset-2">Contact &amp; Links</Link>.
      </p>
    </Card>
  );
};

const TARGET_LABEL: Record<MediaSettings['target'], string> = {
  cloudinary: 'Uploads go to Cloudinary',
  blob: 'Uploads go to Vercel Blob',
  disk: 'Uploads go to the server’s disk',
  none: 'Uploads are not set up',
};

const MediaCard = ({ data, onSaved }: { data: IntegrationsData; onSaved: (data: IntegrationsData) => void }) => {
  const router = useRouter();
  const id = useId();
  const media = data.media;
  const fresh = (value: MediaSettings) => ({ cloudName: value.cloudName, apiKey: '', apiSecret: '', folder: value.folder || 'webnion' });
  const [draft, setDraft] = useState(() => fresh(media));
  const [busy, setBusy] = useState<'save' | 'test' | 'remove' | null>(null);
  const [result, setResult] = useState<Result>(null);
  const fromAdmin = media.source === 'admin';

  const set = (patch: Partial<typeof draft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setResult(null);
  };

  const finish = (response: Awaited<ReturnType<typeof call>>, success: string) => {
    if (response.status === 401) return router.push(ADMIN_LOGIN_PATH);
    if (!response.ok) return setResult({ kind: 'error', text: response.message });
    if (response.data) {
      onSaved(response.data);
      setDraft(fresh(response.data.media));
    }
    setResult({ kind: 'ok', text: success });
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setBusy('save');
    setResult(null);
    finish(await call('/media', 'PUT', draft), 'Saved. Cloudinary accepted the keys, so new uploads go there.');
    setBusy(null);
  };

  const test = async () => {
    setBusy('test');
    setResult(null);
    const response = await call('/media/test', 'POST');
    if (response.status === 401) router.push(ADMIN_LOGIN_PATH);
    else setResult(response.ok ? { kind: 'ok', text: 'Cloudinary answered. Uploads will work.' } : { kind: 'error', text: response.message });
    setBusy(null);
  };

  const remove = async () => {
    if (!window.confirm('Stop sending new uploads to Cloudinary? Files already there stay where they are.')) return;
    setBusy('remove');
    finish(await call('/media', 'DELETE'), 'Removed. New uploads go to the default storage again.');
    setBusy(null);
  };

  return (
    <Card
      title="Media storage (Cloudinary)"
      description="Optional. Without it, uploaded pictures and videos go to the hosting’s own storage. Cloudinary also resizes them for faster pages."
      Icon={Cloud}
      status={<Status good={media.target !== 'none'}>{TARGET_LABEL[media.target]}{media.target === 'cloudinary' && media.source === 'env' ? ' (.env)' : ''}</Status>}
    >
      <form onSubmit={save} className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={`${id}-cloud`} label="Cloud name" hint="On the Cloudinary dashboard, under Product Environment.">
            <input id={`${id}-cloud`} value={draft.cloudName} onChange={(event) => set({ cloudName: event.target.value })} placeholder="my-cloud" required autoComplete="off" spellCheck={false} className={inputClass} />
          </Field>
          <Field id={`${id}-folder`} label="Folder" hint="New uploads are kept in this folder.">
            <input id={`${id}-folder`} value={draft.folder} onChange={(event) => set({ folder: event.target.value })} placeholder="webnion" required autoComplete="off" spellCheck={false} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id={`${id}-key`} label="API key" hint={fromAdmin ? 'Leave empty to keep the saved key.' : undefined}>
            <input id={`${id}-key`} value={draft.apiKey} onChange={(event) => set({ apiKey: event.target.value })} placeholder={fromAdmin ? `Saved: ${media.apiKeyHint}` : '123456789012345'} inputMode="numeric" autoComplete="off" spellCheck={false} className={`${inputClass} font-mono`} />
          </Field>
          <Field
            id={`${id}-secret`}
            label="API secret"
            hint={media.secretUnreadable ? <span className="text-amber-300">The saved secret cannot be read because the server’s key changed. Type it again.</span> : fromAdmin ? 'Leave empty to keep the saved secret.' : 'Stored encrypted and never shown again.'}
          >
            <SecretInput id={`${id}-secret`} value={draft.apiSecret} onChange={(apiSecret) => set({ apiSecret })} savedHint={fromAdmin ? media.secretHint : ''} placeholder="API secret" />
          </Field>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <button type="submit" disabled={busy !== null || !data.canEncrypt} className={primaryButton}>
            {busy === 'save' ? 'Checking the keys…' : 'Save'}
          </button>
          {media.target === 'cloudinary' && (
            <button type="button" onClick={() => void test()} disabled={busy !== null} className={quietButton}>
              {busy === 'test' ? 'Testing…' : 'Test Connection'}
            </button>
          )}
          {fromAdmin && (
            <button type="button" onClick={() => void remove()} disabled={busy !== null} className={`${quietButton} hover:border-red-400/60 hover:text-red-300`}>
              <Trash2 aria-hidden className="size-4" />
              Remove
            </button>
          )}
          <Message result={result} />
        </div>
      </form>
      <p className="mt-5 text-xs text-muted">Only new uploads move. Pictures and videos uploaded before keep working from where they are.</p>
    </Card>
  );
};

export const EmailStorageForm = ({ initial, adminEmail }: { initial: IntegrationsData; adminEmail: string }) => {
  const [data, setData] = useState(initial);

  return (
    <div className="max-w-4xl space-y-5 pb-12">
      {!data.canEncrypt && (
        <p role="alert" className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">
          The server has no AI_SECRETS_KEY, so passwords cannot be stored safely and saving is turned off. Ask your developer to add it.
        </p>
      )}
      <EmailCard data={data} adminEmail={adminEmail} onSaved={setData} />
      <MediaCard data={data} onSaved={setData} />
      <p className="text-xs leading-relaxed text-muted">
        Server keys such as the database address, the login secret and the encryption key stay in the hosting’s environment settings: they are
        needed before this screen can even load, and changing them here could lock everyone out.
      </p>
    </div>
  );
};

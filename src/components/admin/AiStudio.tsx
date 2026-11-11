'use client';

import { ArrowDown, ArrowUp, CheckCircle2, ExternalLink, ImageIcon, Languages, Loader2, Plus, Sparkles, Trash2, Wand2, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent, type ReactNode } from 'react';
import { ADMIN_LOGIN_PATH } from '@/lib/admin/constants';
import { inputClass, labelClass } from './fields';
import { cardClass, cardPadding, primaryButton, quietButton } from './ui';

interface Outline {
  title: string;
  angle: string;
  sections: { heading: string; points: string[] }[];
}

interface StudioProps {
  ready: { writing: boolean; image: boolean; blogWriter: boolean; pictures: boolean };
  maxPictures: number;
  isAdmin: boolean;
}

type Step = { id: string; label: string; state: 'running' | 'done' | 'failed'; detail?: string };

// Reads the API's Server-Sent Events one at a time
const readEvents = async (response: Response, onEvent: (event: Record<string, unknown>) => void) => {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      const line = part.split('\n').find((item) => item.startsWith('data: '));
      if (!line) continue;
      try {
        onEvent(JSON.parse(line.slice(6)));
      } catch {
        // A broken line is skipped
      }
    }
  }
};

const Card = ({ title, step, children }: { title: string; step: number; children: ReactNode }) => (
  <section className={`${cardClass} ${cardPadding}`}>
    <h2 className="flex items-center gap-3 text-base font-semibold">
      <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-semibold text-white">{step}</span>
      {title}
    </h2>
    <div className="mt-6">{children}</div>
  </section>
);

export const AiStudio = ({ ready, maxPictures, isAdmin }: StudioProps) => {
  const router = useRouter();
  const id = useId();
  const [brief, setBrief] = useState({ topic: '', audience: '', tone: '', length: 'medium', keywords: '', notes: '' });
  const [languages, setLanguages] = useState<'en' | 'both'>('both');
  const [pictures, setPictures] = useState(Math.min(3, maxPictures));
  const [outline, setOutline] = useState<Outline | null>(null);
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [working, setWorking] = useState(false);
  const [draft, setDraft] = useState<{ id: string; title: string; slug: string } | null>(null);
  const [made, setMade] = useState<string[]>([]);

  const step = (next: Step) => setSteps((current) => (current.some((item) => item.id === next.id) ? current.map((item) => (item.id === next.id ? next : item)) : [...current, next]));

  const briefPayload = () => ({
    topic: brief.topic.trim(),
    audience: brief.audience.trim(),
    tone: brief.tone.trim(),
    length: brief.length,
    keywords: brief.keywords.split(',').map((word) => word.trim()).filter(Boolean).slice(0, 10),
    notes: brief.notes.trim(),
  });

  const handle401 = (response: Response) => {
    if (response.status === 401) {
      router.push(ADMIN_LOGIN_PATH);
      return true;
    }
    return false;
  };

  const plan = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (brief.topic.trim().length < 3) {
      setError('Give a topic of at least a few words.');
      return;
    }
    setPlanning(true);
    try {
      const response = await fetch('/api/admin/ai/studio/outline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(briefPayload()) });
      if (handle401(response)) return;
      const body: { message?: string; data?: Outline } = await response.json();
      if (!response.ok || !body.data) throw new Error(body.message ?? 'Could not plan the outline');
      setOutline({ ...body.data, sections: body.data.sections.map((section) => ({ heading: section.heading, points: section.points ?? [] })) });
      setDraft(null);
      setSteps([]);
      setMade([]);
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setPlanning(false);
    }
  };

  const write = async () => {
    if (!outline) return;
    const sections = outline.sections.map((section) => ({ heading: section.heading.trim(), points: section.points.map((point) => point.trim()).filter(Boolean) })).filter((section) => section.heading);
    if (!outline.title.trim() || sections.length < 2) {
      setError('The outline needs a title and at least two sections.');
      return;
    }
    setError('');
    setWorking(true);
    setSteps([]);
    setMade([]);
    setDraft(null);
    let saved: { id: string; title: string; slug: string; pictures: number; translate: boolean } | null = null;

    try {
      step({ id: 'write', label: 'Writing the article', state: 'running' });
      const response = await fetch('/api/admin/ai/studio/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: briefPayload(), outline: { title: outline.title.trim(), angle: outline.angle.trim(), sections }, languages: languages === 'both' ? ['en', 'bn'] : ['en'], maxPictures: ready.pictures && ready.image ? pictures : 0 }),
      });
      if (handle401(response)) return;
      if (!response.ok || !response.body) {
        const body: { message?: string } = await response.json().catch(() => ({}));
        throw new Error(body.message ?? 'Could not start writing');
      }
      await readEvents(response, (event) => {
        if (event.type === 'progress') step({ id: 'write', label: 'Writing the article', state: 'running', detail: String(event.message) });
        if (event.type === 'saved') saved = event as unknown as typeof saved;
        if (event.type === 'error') step({ id: 'write', label: 'Writing the article', state: 'failed', detail: String(event.message) });
      });
      if (!saved) throw new Error('The draft was not saved');
      const post = saved as { id: string; title: string; slug: string; pictures: number; translate: boolean };
      setDraft(post);
      step({ id: 'write', label: 'Article saved as a draft', state: 'done', detail: post.title });

      for (let index = 0; index < post.pictures; index += 1) {
        const label = index === 0 ? 'Making the cover picture' : `Making picture ${index + 1} of ${post.pictures}`;
        step({ id: `picture-${index}`, label, state: 'running' });
        const picture = await fetch(`/api/admin/ai/studio/posts/${post.id}/picture`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ index }) });
        const body: { message?: string; data?: { cover?: string | null; content?: { en?: { type: string; src?: string }[] } } } = await picture.json().catch(() => ({}));
        if (picture.ok) {
          const images = [body.data?.cover, ...(body.data?.content?.en ?? []).filter((block) => block.type === 'image').map((block) => block.src)].filter(Boolean) as string[];
          setMade(images);
          step({ id: `picture-${index}`, label: index === 0 ? 'Cover picture made' : `Picture ${index + 1} of ${post.pictures} made`, state: 'done' });
        } else {
          step({ id: `picture-${index}`, label, state: 'failed', detail: body.message ?? 'Failed' });
        }
      }

      if (post.translate) {
        step({ id: 'translate', label: 'Writing the Bangla version', state: 'running' });
        const translation = await fetch(`/api/admin/ai/studio/posts/${post.id}/translate`, { method: 'POST' });
        let ok = false;
        if (translation.ok && translation.body) {
          await readEvents(translation, (event) => {
            if (event.type === 'progress') step({ id: 'translate', label: 'Writing the Bangla version', state: 'running', detail: String(event.message) });
            if (event.type === 'saved') ok = true;
            if (event.type === 'error') step({ id: 'translate', label: 'Writing the Bangla version', state: 'failed', detail: String(event.message) });
          });
        }
        if (ok) step({ id: 'translate', label: 'Bangla version saved', state: 'done' });
        else if (!translation.ok) step({ id: 'translate', label: 'Writing the Bangla version', state: 'failed', detail: 'Could not start the translation' });
      }
      router.refresh();
    } catch (failure) {
      setError((failure as Error).message);
      setSteps((current) => current.map((item) => (item.state === 'running' ? { ...item, state: 'failed' } : item)));
    } finally {
      setWorking(false);
    }
  };

  const setSection = (index: number, change: Partial<Outline['sections'][number]>) =>
    setOutline((current) => current && { ...current, sections: current.sections.map((section, position) => (position === index ? { ...section, ...change } : section)) });

  const move = (index: number, by: number) =>
    setOutline((current) => {
      if (!current) return current;
      const sections = [...current.sections];
      const [item] = sections.splice(index, 1);
      sections.splice(index + by, 0, item!);
      return { ...current, sections };
    });

  if (!ready.blogWriter || !ready.writing) {
    return (
      <div className={`${cardClass} ${cardPadding} text-sm`}>
        <p className="font-medium">AI Studio is not ready yet.</p>
        <p className="mt-1 text-muted">{!ready.blogWriter ? 'The blog writer is turned off in AI Settings.' : 'Add a writing model and its key in AI Settings.'}</p>
        {isAdmin && <Link href="/admin/ai-settings" className={`${quietButton} mt-4`}>Open AI Settings</Link>}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card title="Topic" step={1}>
        <form onSubmit={plan} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor={`${id}-topic`} className={labelClass}>What should the article be about?</label>
            <input id={`${id}-topic`} required maxLength={300} value={brief.topic} onChange={(event) => setBrief({ ...brief, topic: event.target.value })} placeholder="For example: How a fast website helps a small shop sell more" className={`${inputClass} mt-1.5`} />
          </div>
          <div>
            <label htmlFor={`${id}-audience`} className={labelClass}>Readers</label>
            <input id={`${id}-audience`} maxLength={200} value={brief.audience} onChange={(event) => setBrief({ ...brief, audience: event.target.value })} placeholder="Small business owners in Bangladesh" className={`${inputClass} mt-1.5`} />
          </div>
          <div>
            <label htmlFor={`${id}-tone`} className={labelClass}>Tone</label>
            <input id={`${id}-tone`} maxLength={100} value={brief.tone} onChange={(event) => setBrief({ ...brief, tone: event.target.value })} placeholder="Friendly and practical" className={`${inputClass} mt-1.5`} />
          </div>
          <div>
            <label htmlFor={`${id}-keywords`} className={labelClass}>Keywords</label>
            <input id={`${id}-keywords`} value={brief.keywords} onChange={(event) => setBrief({ ...brief, keywords: event.target.value })} placeholder="page speed, online shop" className={`${inputClass} mt-1.5`} />
            <p className="mt-1.5 text-xs text-muted">Separated by commas.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor={`${id}-length`} className={labelClass}>Length</label>
              <select id={`${id}-length`} value={brief.length} onChange={(event) => setBrief({ ...brief, length: event.target.value })} className={`${inputClass} mt-1.5`}>
                <option value="short">Short (~700 words)</option>
                <option value="medium">Medium (~1200 words)</option>
                <option value="long">Long (~2000 words)</option>
              </select>
            </div>
            <div>
              <label htmlFor={`${id}-languages`} className={labelClass}>Languages</label>
              <select id={`${id}-languages`} value={languages} onChange={(event) => setLanguages(event.target.value as 'en' | 'both')} className={`${inputClass} mt-1.5`}>
                <option value="both">English and Bangla</option>
                <option value="en">English only</option>
              </select>
            </div>
          </div>
          <div className="md:col-span-2">
            <label htmlFor={`${id}-notes`} className={labelClass}>Notes for the writer (optional)</label>
            <textarea id={`${id}-notes`} rows={2} maxLength={1500} value={brief.notes} onChange={(event) => setBrief({ ...brief, notes: event.target.value })} placeholder="Points to include, a service to mention, things to avoid" className={`${inputClass} mt-1.5`} />
          </div>
          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <button type="submit" disabled={planning || working} className={primaryButton}>
              {planning ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Wand2 aria-hidden className="size-4" />}
              {planning ? 'Planning…' : outline ? 'Plan again' : 'Plan the outline'}
            </button>
            {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          </div>
        </form>
      </Card>

      {outline && (
        <Card title="Outline" step={2}>
          <p className="mb-5 text-sm text-muted">Change anything before writing: the title, the order, headings or points.</p>
          <div className="space-y-4">
            <div>
              <label htmlFor={`${id}-title`} className={labelClass}>Title</label>
              <input id={`${id}-title`} maxLength={200} value={outline.title} onChange={(event) => setOutline({ ...outline, title: event.target.value })} className={`${inputClass} mt-1.5 font-semibold`} />
            </div>
            <div>
              <label htmlFor={`${id}-angle`} className={labelClass}>Angle</label>
              <textarea id={`${id}-angle`} rows={2} maxLength={600} value={outline.angle} onChange={(event) => setOutline({ ...outline, angle: event.target.value })} className={`${inputClass} mt-1.5`} />
            </div>
            <ol className="space-y-3">
              {outline.sections.map((section, index) => (
                <li key={index} className="rounded-2xl border border-line bg-surface-2/40 p-4">
                  <div className="flex items-start gap-2">
                    <span className="mt-2.5 w-6 shrink-0 text-xs font-semibold tabular-nums text-muted">{index + 1}.</span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <input aria-label={`Section ${index + 1} heading`} maxLength={200} value={section.heading} onChange={(event) => setSection(index, { heading: event.target.value })} className={`${inputClass} font-medium`} />
                      <textarea aria-label={`Section ${index + 1} points, one per line`} rows={Math.max(2, section.points.length)} value={section.points.join('\n')} onChange={(event) => setSection(index, { points: event.target.value.split('\n').slice(0, 8) })} placeholder="Key points, one per line" className={`${inputClass} text-xs`} />
                    </div>
                    <div className="flex shrink-0 flex-col">
                      <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move up" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-white disabled:opacity-30"><ArrowUp aria-hidden className="size-4" /></button>
                      <button type="button" disabled={index === outline.sections.length - 1} onClick={() => move(index, 1)} aria-label="Move down" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-white disabled:opacity-30"><ArrowDown aria-hidden className="size-4" /></button>
                      <button type="button" disabled={outline.sections.length <= 2} onClick={() => setOutline({ ...outline, sections: outline.sections.filter((_, position) => position !== index) })} aria-label="Remove section" className="grid size-9 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-red-300 disabled:opacity-30"><Trash2 aria-hidden className="size-4" /></button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            {outline.sections.length < 10 && (
              <button type="button" onClick={() => setOutline({ ...outline, sections: [...outline.sections, { heading: '', points: [] }] })} className={quietButton}>
                <Plus aria-hidden className="size-4" />
                Add a section
              </button>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-end gap-4 border-t border-line pt-5">
            {ready.pictures && ready.image ? (
              <div>
                <label htmlFor={`${id}-pictures`} className={labelClass}>Pictures</label>
                <select id={`${id}-pictures`} value={pictures} onChange={(event) => setPictures(Number(event.target.value))} className={`${inputClass} mt-1.5 w-56`}>
                  {Array.from({ length: maxPictures + 1 }, (_, count) => (
                    <option key={count} value={count}>{count === 0 ? 'No pictures' : count === 1 ? 'Cover only' : `Cover and ${count - 1} more`}</option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-muted">Pictures are off: add a picture model in AI Settings to make them.</p>
            )}
            <button type="button" onClick={() => void write()} disabled={working || planning} className={primaryButton}>
              {working ? <Loader2 aria-hidden className="size-4 animate-spin" /> : <Sparkles aria-hidden className="size-4" />}
              {working ? 'Working…' : 'Write the draft'}
            </button>
          </div>
        </Card>
      )}

      {steps.length > 0 && (
        <Card title="Draft" step={3}>
          <ol className="space-y-2" aria-live="polite">
            {steps.map((item) => (
              <li key={item.id} className="flex items-start gap-3 text-sm">
                {item.state === 'running' ? <Loader2 aria-hidden className="mt-0.5 size-4 shrink-0 animate-spin text-accent" /> : item.state === 'done' ? <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-emerald-400" /> : <XCircle aria-hidden className="mt-0.5 size-4 shrink-0 text-red-400" />}
                <span>
                  <span className="font-medium">{item.id.startsWith('picture') ? <ImageIcon aria-hidden className="mr-1.5 inline size-3.5" /> : item.id === 'translate' ? <Languages aria-hidden className="mr-1.5 inline size-3.5" /> : null}{item.label}</span>
                  {item.detail && <span className="block text-xs text-muted">{item.detail}</span>}
                </span>
              </li>
            ))}
          </ol>
          {made.length > 0 && (
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {made.map((src) => (
                <li key={src}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- a fresh upload, shown as is */}
                  <img src={src} alt="" className="aspect-video w-full rounded-xl border border-line object-cover" />
                </li>
              ))}
            </ul>
          )}
          {draft && !working && (
            <div className="mt-6 flex flex-wrap gap-2.5 border-t border-line pt-5">
              <Link href={`/admin/blog-posts/${draft.id}`} className={primaryButton}>Review and publish</Link>
              <a href={`/en/blog/${draft.slug}`} target="_blank" rel="noopener noreferrer" className={quietButton}>
                <ExternalLink aria-hidden className="size-4" />
                Link after publishing
              </a>
            </div>
          )}
          <p className="mt-4 text-xs text-muted">Drafts are never published by themselves. Check facts, prices and pictures before publishing.</p>
        </Card>
      )}
    </div>
  );
};
